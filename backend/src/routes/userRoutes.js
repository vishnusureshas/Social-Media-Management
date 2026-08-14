import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestions,
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadImage } from '../middlewares/upload.js';
import {
  updateProfileSchema,
  usernameParamSchema,
  searchSchema,
  suggestionQuerySchema,
} from '../validations/userValidation.js';

const router = Router();

router.get('/search', protect, validate(searchSchema, 'query'), searchUsers);
router.get('/suggestions', protect, validate(suggestionQuerySchema, 'query'), getSuggestions);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/avatar', protect, uploadImage.single('image'), uploadAvatar);
router.post('/cover', protect, uploadImage.single('image'), uploadCover);
router.get('/:username/followers', validate(usernameParamSchema, 'params'), getFollowers);
router.get('/:username/following', validate(usernameParamSchema, 'params'), getFollowing);
router.post('/:username/follow', protect, validate(usernameParamSchema, 'params'), follow);
router.delete('/:username/follow', protect, validate(usernameParamSchema, 'params'), unfollow);
router.get('/:username', validate(usernameParamSchema, 'params'), getProfile);

export default router;
