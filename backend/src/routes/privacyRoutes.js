import { Router } from 'express';
import {
  block,
  unblock,
  getBlocked,
  mute,
  unmute,
  getMuted,
  updateSettings,
} from '../controllers/privacyController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  userIdParamSchema,
  muteSchema,
  privacySettingsSchema,
  listQuerySchema,
} from '../validations/privacyValidation.js';

const router = Router();

router.patch('/settings', protect, validate(privacySettingsSchema), updateSettings);
router.get('/blocked', protect, validate(listQuerySchema, 'query'), getBlocked);
router.post('/block/:userId', protect, validate(userIdParamSchema, 'params'), block);
router.delete('/block/:userId', protect, validate(userIdParamSchema, 'params'), unblock);
router.get('/muted', protect, validate(listQuerySchema, 'query'), getMuted);
router.post('/mute/:userId', protect, validate(userIdParamSchema, 'params'), validate(muteSchema), mute);
router.delete('/mute/:userId', protect, validate(userIdParamSchema, 'params'), unmute);

export default router;