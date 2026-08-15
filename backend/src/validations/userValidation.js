import Joi from 'joi';

const usernameSchema = Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9_]+$/).messages({
  'string.min': 'Username must be at least 3 characters',
  'string.max': 'Username must be at most 20 characters',
  'string.pattern.base': 'Username can only contain letters, numbers and underscores',
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().max(50).allow('', null),
  bio: Joi.string().max(160).allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').allow(null),
  dob: Joi.date().iso().max('now').allow(null),
  location: Joi.string().max(100).allow('', null),
  website: Joi.string().uri().max(200).allow('', null),
  privacy: Joi.object({
    postsVisibleTo: Joi.string().valid('public', 'followers', 'onlyme'),
    messages: Joi.string().valid('everyone', 'followers', 'nobody'),
  }),
});

const usernameParamSchema = Joi.object({
  username: usernameSchema.required(),
});

const searchSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const suggestionQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).default(10),
});

const userPostsQuerySchema = Joi.object({
  cursor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { updateProfileSchema, usernameParamSchema, searchSchema, suggestionQuerySchema, userPostsQuerySchema };
