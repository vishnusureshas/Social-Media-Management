export const getApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.data || err?.error || {};
  if (typeof data === 'string') return data;
  return data?.message || fallback;
};

export const getFieldErrors = (err) => {
  const data = err?.data;
  if (!data?.errors) return {};
  return data.errors.reduce((acc, e) => {
    acc[e.field] = e.message;
    return acc;
  }, {});
};