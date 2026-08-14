import { Router } from 'express';
import { react, removeReaction, getReactionSummary } from '../controllers/reactionController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { reactSchema, idParamSchema, summaryQuerySchema } from '../validations/reactionValidation.js';

const router = Router();

router.post('/', protect, validate(reactSchema), react);
router.delete('/:id', protect, validate(idParamSchema, 'params'), removeReaction);
router.get('/summary', protect, validate(summaryQuerySchema, 'query'), getReactionSummary);

export default router;