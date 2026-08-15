import { Router } from 'express';
import {
  listReports,
  resolveReport,
  listKeywords,
  createKeyword,
  deleteKeyword,
  getReportStats,
} from '../controllers/moderationController.js';
import {
  adminLogin,
  dashboardStats,
  dashboardCharts,
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  listPosts,
  deletePost,
  togglePinPost,
  listStories,
  deleteStory,
  listReels,
  deleteReel,
  listComments,
  deleteComment,
  getHashtags,
  broadcastNotification,
  listAuditLogs,
  getSettings,
  updateSettings,
  getAdminSelf,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  adminLoginSchema,
  listUsersSchema,
  userStatusSchema,
  userRoleSchema,
  listContentSchema,
  pinPostSchema,
  broadcastSchema,
  logQuerySchema,
  settingsPayloadSchema,
} from '../validations/adminValidation.js';
import {
  reportQuerySchema,
  resolveReportSchema,
  idParamSchema,
  createKeywordSchema,
} from '../validations/reportValidation.js';

const router = Router();

router.post('/login', validate(adminLoginSchema), adminLogin);

router.get('/me', protect, authorize('admin', 'superadmin'), getAdminSelf);
router.get('/dashboard/stats', protect, authorize('admin', 'superadmin'), dashboardStats);
router.get('/dashboard/charts', protect, authorize('admin', 'superadmin'), dashboardCharts);

router.get('/users', protect, authorize('admin', 'superadmin'), validate(listUsersSchema, 'query'), listUsers);
router.get('/users/:id', protect, authorize('admin', 'superadmin'), validate(idParamSchema, 'params'), getUserDetail);
router.patch(
  '/users/:id/status',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  validate(userStatusSchema),
  updateUserStatus
);
router.patch(
  '/users/:id/role',
  protect,
  authorize('superadmin'),
  validate(idParamSchema, 'params'),
  validate(userRoleSchema),
  updateUserRole
);
router.delete(
  '/users/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  deleteUser
);

router.get('/posts', protect, authorize('admin', 'superadmin'), validate(listContentSchema, 'query'), listPosts);
router.delete(
  '/posts/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  deletePost
);
router.patch(
  '/posts/:id/pin',
  protect,
  authorize('superadmin'),
  validate(idParamSchema, 'params'),
  validate(pinPostSchema),
  togglePinPost
);

router.get('/stories', protect, authorize('admin', 'superadmin'), validate(listContentSchema, 'query'), listStories);
router.delete(
  '/stories/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  deleteStory
);

router.get('/reels', protect, authorize('admin', 'superadmin'), validate(listContentSchema, 'query'), listReels);
router.delete(
  '/reels/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  deleteReel
);

router.get('/comments', protect, authorize('admin', 'superadmin'), validate(listContentSchema, 'query'), listComments);
router.delete(
  '/comments/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  deleteComment
);

router.get('/hashtags', protect, authorize('admin', 'superadmin'), getHashtags);

router.post(
  '/notifications/broadcast',
  protect,
  authorize('admin', 'superadmin'),
  validate(broadcastSchema),
  broadcastNotification
);

router.get(
  '/audit-logs',
  protect,
  authorize('superadmin'),
  validate(logQuerySchema, 'query'),
  listAuditLogs
);

router.get('/settings', protect, authorize('admin', 'superadmin'), getSettings);
router.patch(
  '/settings',
  protect,
  authorize('superadmin'),
  validate(settingsPayloadSchema),
  updateSettings
);

// Moderation (reports + keywords)
router.get('/reports', protect, authorize('admin', 'superadmin'), validate(reportQuerySchema, 'query'), listReports);
router.get('/reports/stats', protect, authorize('admin', 'superadmin'), getReportStats);
router.patch(
  '/reports/:id',
  protect,
  authorize('admin', 'superadmin'),
  validate(idParamSchema, 'params'),
  validate(resolveReportSchema),
  resolveReport
);

router.get('/keywords', protect, authorize('admin', 'superadmin'), listKeywords);
router.post('/keywords', protect, authorize('admin', 'superadmin'), validate(createKeywordSchema), createKeyword);
router.delete('/keywords/:id', protect, authorize('admin', 'superadmin'), validate(idParamSchema, 'params'), deleteKeyword);

export default router;