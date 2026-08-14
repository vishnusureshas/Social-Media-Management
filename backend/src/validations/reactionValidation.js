import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const reactSchema = Joi.object({
  targetType: Joi.string().valid('post', 'comment').required(),
  targetId: objectId.required(),
  emoji: Joi.string().valid('like', 'love', 'haha', 'wow', 'sad', 'angry').required(),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const summaryQuerySchema = Joi.object({
  targetType: Joi.string().valid('post', 'comment').required(),
  targetId: objectId.required(),
});

export { reactSchema, idParamSchema, summaryQuerySchema };