import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const userIdParamSchema = Joi.object({
  userId: objectId.required(),
});

const muteSchema = Joi.object({
  scope: Joi.string().valid('feed', 'stories', 'notifications', 'all').default('all'),
});

const privacySettingsSchema = Joi.object({
  postsVisibleTo: Joi.string().valid('public', 'followers', 'onlyme').optional(),
  messages: Joi.string().valid('everyone', 'followers', 'nobody').optional(),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

export { userIdParamSchema, muteSchema, privacySettingsSchema, listQuerySchema };