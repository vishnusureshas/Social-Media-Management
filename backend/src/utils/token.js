import crypto from 'crypto';

const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    otp += digits[bytes[i] % digits.length];
  }
  return otp;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const TIME_MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export { generateOtp, hashToken, TIME_MS };