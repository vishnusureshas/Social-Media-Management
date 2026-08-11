const sendSuccess = (res, statusCode, message, data = null, pagination = undefined) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  if (pagination) body.pagination = pagination;
  res.status(statusCode).json(body);
};

const sendError = (res, statusCode, message, errors = []) => {
  res.status(statusCode).json({ success: false, message, errors });
};

export { sendSuccess, sendError };