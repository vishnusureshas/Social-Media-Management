import { Router } from 'express';
import {
  createStory,
  getActiveStories,
  getStory,
  deleteStory,
  getStoryViewers,
} from '../controllers/storyController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadStoryMedia } from '../middlewares/upload.js';
import {
  createStorySchema,
  idParamSchema,
  feedQuerySchema,
  viewersQuerySchema,
} from '../validations/storyValidation.js';

const router = Router();

router.post('/', protect, uploadStoryMedia.single('media'), validate(createStorySchema), createStory);
router.get('/', protect, validate(feedQuerySchema, 'query'), getActiveStories);
router.get('/:id/viewers', protect, validate(idParamSchema, 'params'), validate(viewersQuerySchema, 'query'), getStoryViewers);
router.get('/:id', protect, validate(idParamSchema, 'params'), getStory);
router.delete('/:id', protect, validate(idParamSchema, 'params'), deleteStory);

export default router;