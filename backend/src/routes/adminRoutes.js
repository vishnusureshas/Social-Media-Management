import { Router } from 'express';
import {
  listReports,
  resolveReport,
  listKeywords,
  createKeyword,
  deleteKeyword,
  getReportStats,
} from '../controllers/moderationController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  reportQuerySchema,
  resolveReportSchema,
  idParamSchema,
  createKeywordSchema,
} from '../validations/reportValidation.js';

const router = Router();

router.use(protect, authorize('admin', 'superadmin'));

router.get('/reports', validate(reportQuerySchema, 'query'), listReports);
router.get('/reports/stats', getReportStats);
router.patch(
  '/reports/:id',
  validate(idParamSchema, 'params'),
  validate(resolveReportSchema),
  resolveReport
);

router.get('/keywords', listKeywords);
router.post('/keywords', validate(createKeywordSchema), createKeyword);
router.delete('/keywords/:id', validate(idParamSchema, 'params'), deleteKeyword);

export default router;