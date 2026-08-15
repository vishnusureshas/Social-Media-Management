import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const otpCodeSchema = Joi.string().pattern(/^\s*[0-9]{6}\s*$/).required().messages({
  'string.pattern.base': 'Enter the 6-digit code',
});

const codeSchema = Joi.object({
  code: Joi.string().trim().min(1).max(20).required().messages({
    'any.required': 'A verification code is required',
  }),
});

const login2FASchema = Joi.object({
  challenge: Joi.string().required(),
  code: Joi.string().trim().min(1).max(20).required(),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { otpCodeSchema, codeSchema, login2FASchema, idParamSchema, listQuerySchema };