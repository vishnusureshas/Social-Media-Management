import { Router } from 'express';
import {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  sharePost,
  likePost,
  getPostLikes,
  savePost,
  getExplore,
  getPostsByTag,
  getSavedPosts,
  getTrending,
} from '../controllers/postController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadPostMedia } from '../middlewares/upload.js';
import {
  createPostSchema,
  updatePostSchema,
  idParamSchema,
  hashtagParamSchema,
  feedQuerySchema,
} from '../validations/postValidation.js';
import { commentQuerySchema } from '../validations/commentValidation.js';
import { getPostComments } from '../controllers/commentController.js';

const router = Router();

router.post('/', protect, uploadPostMedia.array('media', 4), validate(createPostSchema), createPost);

router.get('/explore', protect, validate(feedQuerySchema, 'query'), getExplore);
router.get('/trending', protect, getTrending);
router.get('/saved', protect, validate(feedQuerySchema, 'query'), getSavedPosts);
router.get('/tag/:hashtag', protect, validate(hashtagParamSchema, 'params'), validate(feedQuerySchema, 'query'), getPostsByTag);
router.get('/', protect, validate(feedQuerySchema, 'query'), getFeed);

router.get('/:id/likes', protect, validate(idParamSchema, 'params'), validate(feedQuerySchema, 'query'), getPostLikes);
router.get('/:id/comments', protect, validate(idParamSchema, 'params'), validate(commentQuerySchema, 'query'), getPostComments);

router.post('/:id/share', protect, validate(idParamSchema, 'params'), sharePost);
router.post('/:id/like', protect, validate(idParamSchema, 'params'), likePost);
router.post('/:id/save', protect, validate(idParamSchema, 'params'), savePost);

router.get('/:id', protect, validate(idParamSchema, 'params'), getPost);
router.patch('/:id', protect, validate(idParamSchema, 'params'), validate(updatePostSchema), updatePost);
router.delete('/:id', protect, validate(idParamSchema, 'params'), deletePost);

export default router;