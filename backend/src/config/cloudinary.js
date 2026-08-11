import cloudinary from 'cloudinary';
import config from './env.js';

const v2 = cloudinary.v2;

v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export default v2;