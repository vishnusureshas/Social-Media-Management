import APIError from '../utils/AppError.js';

const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new APIError(400, 'Validation failed.', errors));
    }

    req[property] = value;
    next();
  };

export default validate;