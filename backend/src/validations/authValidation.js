import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(6)
  .max(64)
  .pattern(/[a-zA-Z]/, 'letters')
  .pattern(/[0-9]/, 'numbers')
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters',
    'string.pattern.base': 'Password must contain at least one letter and one number',
  });

const emailSchema = Joi.string().email().lowercase().required().messages({
  'string.email': 'Please provide a valid email',
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9_]+$/).required().messages({
    'string.pattern.base': 'Username can only contain letters, numbers and underscores',
  }),
  email: emailSchema,
  password: passwordSchema,
  fullName: Joi.string().max(50).optional().allow(''),
});

const verifyEmailSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
  }),
});

const resendOtpSchema = Joi.object({
  email: emailSchema,
  purpose: Joi.string().valid('verify_email', 'reset_password', 'login').default('verify_email'),
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({ 'any.required': 'Password is required' }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const resetPasswordSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  newPassword: passwordSchema,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
});

export {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};