import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const createConversationSchema = Joi.object({
  type: Joi.string().valid('direct', 'group').default('direct'),
  participant: objectId.optional(),
  participants: Joi.array().items(objectId).min(1).max(50).default([]),
  groupName: Joi.string().trim().min(1).max(50).optional(),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const messageQuerySchema = Joi.object({
  cursor: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
}).default({ limit: 50 });

const conversationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).default();

export { createConversationSchema, idParamSchema, messageQuerySchema, conversationQuerySchema };