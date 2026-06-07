import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const makeStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `avyuktha/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    } as object,
  });

export const productUpload = multer({
  storage: makeStorage('products'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const avatarUpload = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const blogUpload = multer({
  storage: makeStorage('blogs'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const bannerUpload = multer({
  storage: makeStorage('banners'),
  limits: { fileSize: 5 * 1024 * 1024 },
});
