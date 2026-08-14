import { Router } from 'express';
import {
  addComment,
  getCommentReplies,
  editComment,
  deleteComment,
  likeComment,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  createCommentSchema,
  updateCommentSchema,
  idParamSchema,
  commentQuerySchema,
} from '../validations/commentValidation.js';

const router = Router();

router.post('/', protect, validate(createCommentSchema), addComment);
router.get('/:id/replies', protect, validate(idParamSchema, 'params'), validate(commentQuerySchema, 'query'), getCommentReplies);
router.patch('/:id', protect, validate(idParamSchema, 'params'), validate(updateCommentSchema), editComment);
router.delete('/:id', protect, validate(idParamSchema, 'params'), deleteComment);
router.post('/:id/like', protect, validate(idParamSchema, 'params'), likeComment);

export default router;