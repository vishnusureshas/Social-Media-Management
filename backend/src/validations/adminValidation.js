import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  q: Joi.string().trim().max(50).allow('', null).optional(),
  role: Joi.string().valid('user', 'admin', 'superadmin').optional(),
  status: Joi.string().valid('active', 'banned', 'deactivated').optional(),
});

const userStatusSchema = Joi.object({
  status: Joi.string().valid('ban', 'unban', 'activate', 'deactivate').required(),
  reason: Joi.string().trim().max(300).allow('', null).optional(),
});

const userRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin', 'superadmin').required(),
});

const listContentSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  q: Joi.string().trim().max(120).allow('', null).optional(),
  status: Joi.string().valid('flagged', 'deleted', 'visible').optional(),
});

const pinPostSchema = Joi.object({
  isPinned: Joi.boolean().required(),
});

const reportQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewing', 'resolved', 'dismissed').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const resolveReportSchema = Joi.object({
  status: Joi.string().valid('resolved', 'dismissed').required(),
  actionTaken: Joi.string().trim().max(200).allow('', null).optional(),
});

const createKeywordSchema = Joi.object({
  keyword: Joi.string().trim().min(2).max(50).required(),
  matchType: Joi.string().valid('exact', 'includes').default('includes'),
});

const broadcastSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
  recipients: Joi.array().items(objectId).optional(),
  type: Joi.string().valid('admin_notice', 'broadcast').default('broadcast'),
});

const logQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  action: Joi.string().optional(),
  adminId: objectId.optional(),
});

const settingsPayloadSchema = Joi.object({
  settings: Joi.object()
    .pattern(Joi.string(), Joi.any())
    .min(1)
    .required(),
}).messages({ 'object.min': 'Provide at least one setting to update.' });

export {
  adminLoginSchema,
  listUsersSchema,
  userStatusSchema,
  userRoleSchema,
  listContentSchema,
  pinPostSchema,
  idParamSchema,
  reportQuerySchema,
  resolveReportSchema,
  createKeywordSchema,
  broadcastSchema,
  logQuerySchema,
  settingsPayloadSchema,
};