import { Router } from 'express';
import { votePoll, getPollResults, createPoll } from '../controllers/pollController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { voteSchema, idParamSchema, createPollSchema } from '../validations/pollValidation.js';

const router = Router();

router.post('/:id/vote', protect, validate(idParamSchema, 'params'), validate(voteSchema), votePoll);
router.get('/:id/results', protect, validate(idParamSchema, 'params'), getPollResults);
router.post('/create', protect, validate(createPollSchema), createPoll);

export default router;