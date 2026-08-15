import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const notificationQuerySchema = Joi.object({
  cursor: Joi.string().max(120).allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

export { notificationQuerySchema, idParamSchema };