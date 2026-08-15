import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  notificationQuerySchema,
  idParamSchema,
} from '../validations/notificationValidation.js';

const router = Router();

router.get('/', protect, validate(notificationQuerySchema, 'query'), getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read', protect, markAllRead);
router.put('/:id/read', protect, validate(idParamSchema, 'params'), markOneRead);

export default router;