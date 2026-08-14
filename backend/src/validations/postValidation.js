import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const createPostSchema = Joi.object({
  content: Joi.string().max(10000).allow('', null),
  location: Joi.string().max(100).allow('', null),
  visibility: Joi.string().valid('public', 'followers', 'onlyme'),
  tags: Joi.array().items(Joi.string().max(50)).max(30),
});

const updatePostSchema = Joi.object({
  content: Joi.string().max(10000).allow('', null),
  location: Joi.string().max(100).allow('', null),
  visibility: Joi.string().valid('public', 'followers', 'onlyme'),
}).min(1);

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const hashtagParamSchema = Joi.object({
  hashtag: Joi.string().trim().min(1).max(50).pattern(/^[a-zA-Z0-9_]+$/).required(),
});

const feedQuerySchema = Joi.object({
  cursor: objectId.allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { createPostSchema, updatePostSchema, idParamSchema, hashtagParamSchema, feedQuerySchema };