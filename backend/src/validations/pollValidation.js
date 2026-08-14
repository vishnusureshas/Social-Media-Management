import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const voteSchema = Joi.object({
  optionId: objectId.required(),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const createPollSchema = Joi.object({
  post: objectId.required(),
  question: Joi.string().trim().min(1).max(300).required(),
  options: Joi.array().items(Joi.string().trim().min(1).max(100)).min(2).max(5).required(),
  expiresAt: Joi.date().iso().allow(null, '').optional(),
});

export { voteSchema, idParamSchema, createPollSchema };