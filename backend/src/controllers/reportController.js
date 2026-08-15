import Report from '../models/Report.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { notifyOne } from '../utils/notify.js';

const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (targetType === 'user' && String(targetId) === String(req.userId)) {
      throw new APIError(400, 'You cannot report yourself.');
    }

    const existing = await Report.findOne({
      reportedBy: req.userId,
      targetType,
      targetId,
      status: { $in: ['pending', 'reviewing'] },
    });
    if (existing) {
      throw new APIError(
        409,
        'You already have a pending report for this content. It is being reviewed.'
      );
    }

    const report = await Report.create({
      reportedBy: req.userId,
      targetType,
      targetId,
      reason,
      description: description || undefined,
    });

    sendSuccess(res, 201, 'Report submitted. Our team will review it shortly.', {
      report: {
        _id: report._id,
        targetType,
        targetId,
        reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [docs, total] = await Promise.all([
      Report.find({ reportedBy: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('handledBy', 'username fullName avatar verified'),
      Report.countDocuments({ reportedBy: req.userId }),
    ]);

    sendSuccess(
      res,
      200,
      'Your reports retrieved.',
      { reports: docs },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const notifyReporterOnResolution = async (report, actionTaken) => {
  await notifyOne({
    recipient: report.reportedBy,
    type: 'report_resolved',
    actor: report.handledBy,
    targetType: report.targetType,
    targetId: report.targetId,
    targetModel: report.targetType === 'user' ? 'User' : report.targetType.charAt(0).toUpperCase() + report.targetType.slice(1),
    message: actionTaken ? `Your report was resolved. Action: ${actionTaken}.` : 'Your report was resolved. Thank you for helping keep the platform safe.',
  });
};

export { createReport, getMyReports, notifyReporterOnResolution };