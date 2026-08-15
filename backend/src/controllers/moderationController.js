import Report from '../models/Report.js';
import ModerationKeyword from '../models/ModerationKeyword.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { clearKeywordCache } from '../services/moderationService.js';
import { notifyReporterOnResolution } from './reportController.js';

const REPORTER_FIELDS = 'username fullName avatar verified counts';
const HANDLER_FIELDS = 'username fullName avatar verified';

const listReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = status ? { status } : {};
    const [docs, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('reportedBy', REPORTER_FIELDS)
        .populate('handledBy', HANDLER_FIELDS),
      Report.countDocuments(query),
    ]);

    sendSuccess(
      res,
      200,
      'Reports retrieved.',
      { reports: docs },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { status, actionTaken } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) throw new APIError(404, 'Report not found.');
    if (report.status === 'resolved' || report.status === 'dismissed') {
      throw new APIError(409, 'This report has already been resolved.');
    }

    report.status = status;
    report.handledBy = req.userId;
    if (actionTaken) report.actionTaken = actionTaken;
    await report.save();

    await notifyReporterOnResolution(report, actionTaken || null);

    sendSuccess(res, 200, `Report marked as ${status}.`, {
      report: {
        _id: report._id,
        status: report.status,
        actionTaken: report.actionTaken,
        handledBy: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
};

const listKeywords = async (req, res, next) => {
  try {
    const keywords = await ModerationKeyword.find().sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Moderation keywords retrieved.', { keywords });
  } catch (err) {
    next(err);
  }
};

const createKeyword = async (req, res, next) => {
  try {
    const { keyword, matchType } = req.body;
    const normalized = keyword.trim().toLowerCase();

    const exists = await ModerationKeyword.findOne({ keyword: normalized });
    if (exists) throw new APIError(409, 'This keyword already exists.');

    const doc = await ModerationKeyword.create({ keyword: normalized, matchType });
    await clearKeywordCache();
    sendSuccess(res, 201, 'Keyword added.', { keyword: doc });
  } catch (err) {
    next(err);
  }
};

const deleteKeyword = async (req, res, next) => {
  try {
    const deleted = await ModerationKeyword.findByIdAndDelete(req.params.id);
    if (!deleted) throw new APIError(404, 'Keyword not found.');

    await clearKeywordCache();
    sendSuccess(res, 200, 'Keyword removed.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const getReportStats = async (req, res, next) => {
  try {
    const [pending, reviewing, resolved, dismissed, total] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'reviewing' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments({}),
    ]);
    sendSuccess(res, 200, 'Report stats retrieved.', {
      stats: { pending, reviewing, resolved, dismissed, total },
    });
  } catch (err) {
    next(err);
  }
};

export { listReports, resolveReport, listKeywords, createKeyword, deleteKeyword, getReportStats };