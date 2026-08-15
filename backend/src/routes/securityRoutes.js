import { Router } from 'express';
import {
  setup2FA,
  enable2FA,
  disable2FA,
  login2FA,
  getSessions,
  revokeSession,
  getSecurityLogs,
} from '../controllers/securityController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  codeSchema,
  login2FASchema,
  idParamSchema,
  listQuerySchema,
} from '../validations/securityValidation.js';

const router = Router();

router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/enable', protect, validate(codeSchema), enable2FA);
router.post('/2fa/disable', protect, validate(codeSchema), disable2FA);
router.post('/2fa/login', validate(login2FASchema), login2FA);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, validate(idParamSchema, 'params'), revokeSession);
router.get('/logs', protect, validate(listQuerySchema, 'query'), getSecurityLogs);

export default router;