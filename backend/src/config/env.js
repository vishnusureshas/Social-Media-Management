import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/socialplatform',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  refresh: {
    secret: process.env.REFRESH_SECRET || 'dev_refresh_secret_change_me',
    expiresIn: process.env.REFRESH_EXPIRES_IN || '30d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
    cacheTtl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 300,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

export default config;