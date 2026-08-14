import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid id format',
});

const createReelSchema = Joi.object({
  caption: Joi.string().max(2200).allow('', null),
  audioName: Joi.string().max(100).allow('', null),
  audioArtist: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string().max(50)).max(30),
});

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const feedQuerySchema = Joi.object({
  cursor: Joi.string().max(120).allow('').optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const reelCommentSchema = Joi.object({
  parent: objectId.allow(null).optional(),
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment cannot be empty',
  }),
});

export { createReelSchema, idParamSchema, feedQuerySchema, reelCommentSchema };