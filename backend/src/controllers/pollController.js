import Poll from '../models/Poll.js';
import Post from '../models/Post.js';
import APIError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

const pollToJSON = (poll, userId) => {
  const myVote = poll.voters.some((v) => String(v) === String(userId));
  const myOption = myVote
    ? poll.options.find((opt) => opt.voters?.some((v) => String(v) === String(userId)))
    : null;

  return {
    id: poll._id,
    question: poll.question,
    options: poll.options.map((opt) => ({
      id: opt._id,
      text: opt.text,
      votes: opt.votes,
    })),
    totalVotes: poll.totalVotes,
    expiresAt: poll.expiresAt,
    hasVoted: myVote,
    myOptionId: myOption ? myOption._id : null,
    isExpired: Boolean(poll.expiresAt && poll.expiresAt < new Date()),
  };
};

const votePoll = async (req, res, next) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) throw new APIError(404, 'Poll not found.');

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      throw new APIError(400, 'This poll has ended.');
    }
    if (poll.voters.some((v) => String(v) === String(req.userId))) {
      throw new APIError(400, 'You have already voted on this poll.');
    }

    const option = poll.options.find((opt) => String(opt._id) === String(optionId));
    if (!option) throw new APIError(404, 'Poll option not found.');

    const incremented = await Poll.findOneAndUpdate(
      { _id: poll._id, 'options._id': option._id },
      {
        $inc: {
          totalVotes: 1,
          'options.$.votes': 1,
        },
        $push: { voters: req.userId, 'options.$.voters': req.userId },
      },
      { new: true }
    );
    if (!incremented) throw new APIError(409, 'Could not record vote.');

    sendSuccess(res, 200, 'Vote recorded.', { poll: pollToJSON(incremented, req.userId) });
  } catch (err) {
    next(err);
  }
};

const getPollResults = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) throw new APIError(404, 'Poll not found.');

    sendSuccess(res, 200, 'Poll results retrieved.', { poll: pollToJSON(poll, req.userId) });
  } catch (err) {
    next(err);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const { post, question, options, expiresAt } = req.body;

    const postDoc = await Post.findOne({ _id: post, isDeleted: false });
    if (!postDoc) throw new APIError(404, 'Post not found.');
    if (String(postDoc.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only add a poll to your own post.');
    }
    if (postDoc.poll) throw new APIError(400, 'This post already has a poll.');

    const poll = await Poll.create({
      post,
      author: req.userId,
      question,
      options: options.map((text) => ({ text })),
      expiresAt: expiresAt || null,
    });

    await Post.updateOne({ _id: post }, { poll: poll._id });
    sendSuccess(res, 201, 'Poll created.', { poll: pollToJSON(poll, req.userId) });
  } catch (err) {
    next(err);
  }
};

export { votePoll, getPollResults, createPoll };