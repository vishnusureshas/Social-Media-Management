import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const targetTypeSchema = Joi.string().valid('user', 'post', 'comment', 'reel', 'story', 'message');

const reasonSchema = Joi.string().valid(
  'spam',
  'harassment',
  'hate_speech',
  'violence',
  'nudity',
  'false_info',
  'scam',
  'copyright',
  'other'
);

const createReportSchema = Joi.object({
  targetType: targetTypeSchema.required(),
  targetId: objectId.required(),
  reason: reasonSchema.required(),
  description: Joi.string().trim().max(1000).allow('', null).optional(),
});

const statusSchema = Joi.string().valid('pending', 'reviewing', 'resolved', 'dismissed');

const reportQuerySchema = Joi.object({
  status: statusSchema.optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const resolveReportSchema = Joi.object({
  status: Joi.string().valid('resolved', 'dismissed').required(),
  actionTaken: Joi.string().trim().max(200).allow('', null).optional(),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const createKeywordSchema = Joi.object({
  keyword: Joi.string().trim().min(2).max(50).required(),
  matchType: Joi.string().valid('exact', 'includes').default('includes'),
});

export {
  createReportSchema,
  reportQuerySchema,
  resolveReportSchema,
  idParamSchema,
  createKeywordSchema,
};