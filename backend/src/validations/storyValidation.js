import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const createStorySchema = Joi.object({
  text: Joi.string().trim().min(1).max(500).allow('', null),
  bgColor: Joi.string().pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).allow(null, ''),
  mentions: Joi.array().items(objectId).max(20),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const feedQuerySchema = Joi.object({
  cursor: objectId.allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const viewersQuerySchema = Joi.object({
  cursor: objectId.allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { createStorySchema, idParamSchema, feedQuerySchema, viewersQuerySchema };