import { Router } from 'express';
import {
  createReel,
  getReels,
  getReel,
  playReel,
  deleteReel,
  likeReel,
  shareReel,
  getSharedWithMe,
  addReelComment,
  getReelComments,
} from '../controllers/reelController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadReelVideo } from '../middlewares/upload.js';
import {
  createReelSchema,
  idParamSchema,
  feedQuerySchema,
  reelCommentSchema,
  shareReelSchema,
} from '../validations/reelValidation.js';
import { commentQuerySchema } from '../validations/commentValidation.js';

const router = Router();

router.post('/', protect, uploadReelVideo.single('video'), validate(createReelSchema), createReel);
router.get('/', protect, validate(feedQuerySchema, 'query'), getReels);
router.get('/shared-with-me', protect, validate(feedQuerySchema, 'query'), getSharedWithMe);

router.get('/:id/comments', protect, validate(idParamSchema, 'params'), validate(commentQuerySchema, 'query'), getReelComments);
router.post('/:id/comments', protect, validate(idParamSchema, 'params'), validate(reelCommentSchema), addReelComment);

router.post('/:id/play', protect, validate(idParamSchema, 'params'), playReel);
router.post('/:id/like', protect, validate(idParamSchema, 'params'), likeReel);
router.post('/:id/share', protect, validate(idParamSchema, 'params'), validate(shareReelSchema), shareReel);

router.get('/:id', protect, validate(idParamSchema, 'params'), getReel);
router.delete('/:id', protect, validate(idParamSchema, 'params'), deleteReel);

export default router;