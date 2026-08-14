import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const createCommentSchema = Joi.object({
  post: objectId.required(),
  parent: objectId.allow(null).optional(),
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment cannot be empty',
  }),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment cannot be empty',
  }),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const commentQuerySchema = Joi.object({
  cursor: objectId.allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { createCommentSchema, updateCommentSchema, idParamSchema, commentQuerySchema };