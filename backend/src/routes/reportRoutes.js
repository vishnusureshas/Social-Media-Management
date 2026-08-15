import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/reportController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createReportSchema, reportQuerySchema } from '../validations/reportValidation.js';

const router = Router();

router.post('/', protect, validate(createReportSchema), createReport);
router.get('/my', protect, validate(reportQuerySchema, 'query'), getMyReports);

export default router;