import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import config from '../config/env.js';
import APIError from '../utils/AppError.js';

const assertCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new APIError(
      503,
      'Media uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.'
    );
  }
};

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new APIError(400, 'Only image files are allowed.'));
  }
};

const postMediaFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new APIError(400, 'Only image or video files are allowed.'));
  }
};

const videoOnlyFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new APIError(400, 'Only video files are allowed.'));
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

export const uploadPostMedia = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 4 }, // 50MB each, max 4 files
  fileFilter: postMediaFilter,
});

export const uploadStoryMedia = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // story: image/video ≤50MB, single file
  fileFilter: postMediaFilter,
});

export const uploadReelVideo = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024, files: 1 }, // reel: video ≤200MB, single file
  fileFilter: videoOnlyFilter,
});

export const uploadToCloudinary = async (file, folder) => {
  assertCloudinaryConfigured();
  if (!file || !file.buffer) {
    throw new APIError(400, 'No file uploaded.');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 2000, crop: 'limit' }],
      },
      (error, uploadResult) => {
        if (error) {
          reject(new APIError(500, `Image upload failed: ${error.message}`));
        } else {
          resolve(uploadResult);
        }
      }
    );
    stream.end(file.buffer);
  });

  return result.secure_url;
};

export const uploadMediaToCloudinary = async (file, folder) => {
  assertCloudinaryConfigured();
  if (!file || !file.buffer) {
    throw new APIError(400, 'No file uploaded.');
  }

  const isVideo = file.mimetype.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: isVideo ? undefined : [{ width: 2000, crop: 'limit' }],
      },
      (error, uploadResult) => {
        if (error) {
          reject(new APIError(500, `Media upload failed: ${error.message}`));
        } else {
          resolve(uploadResult);
        }
      }
    );
    stream.end(file.buffer);
  });

  return {
    type: isVideo ? 'video' : 'image',
    public_id: result.public_id,
    url: result.secure_url,
    thumb: result.thumbnail_url || result.secure_url || undefined,
  };
};

export const uploadReelToCloudinary = async (file, folder) => {
  assertCloudinaryConfigured();
  if (!file || !file.buffer) {
    throw new APIError(400, 'No file uploaded.');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'video',
        eager: [{ width: 480, height: 853, crop: 'fill' }],
      },
      (error, uploadResult) => {
        if (error) {
          reject(new APIError(500, `Reel upload failed: ${error.message}`));
        } else {
          resolve(uploadResult);
        }
      }
    );
    stream.end(file.buffer);
  });

  return {
    public_id: result.public_id,
    url: result.secure_url,
    thumbnail: result.thumbnail_url || undefined,
    duration: Number(result.duration) || 0,
  };
};
