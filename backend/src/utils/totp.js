import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

const generateSecret = (length = 20) => base32Encode(crypto.randomBytes(length));

const generateTOTP = (secret, timeStepSeconds = 30, digits = 6) => {
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binary % 10 ** digits;
  return String(otp).padStart(digits, '0');
};

const verifyTOTP = (secret, code, window = 1, timeStepSeconds = 30) => {
  const normalized = String(code || '').replace(/\s+/g, '');
  for (let offset = -window; offset <= window; offset += 1) {
    const counter = Math.floor(Date.now() / 1000 / timeStepSeconds) + offset;
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));
    const key = base32Decode(secret);
    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
    const i = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[i] & 0x7f) << 24) |
      ((hmac[i + 1] & 0xff) << 16) |
      ((hmac[i + 2] & 0xff) << 8) |
      (hmac[i + 3] & 0xff);
    const otp = String(binary % 10 ** 6).padStart(6, '0');
    if (crypto.timingSafeEqual(Buffer.from(otp), Buffer.from(normalized))) return true;
  }
  return false;
};

const generateBackupCodes = (count = 8) =>
  Array.from({ length: count }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 10)
  );

const buildOtpauthUrl = (secret, account, issuer = 'Nexus') =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${encodeURIComponent(
    secret
  )}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

export { generateSecret, generateTOTP, verifyTOTP, generateBackupCodes, buildOtpauthUrl };