import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to create Cloudinary storage for a specific folder
const createCloudinaryStorage = (folder: string, allowPdf = false) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `rivers-rwanda/${folder}`,
      allowed_formats: allowPdf ? ['jpg', 'jpeg', 'png', 'webp', 'pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'auto',
    } as any,
  });
};

const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Invalid file type. Only JPG, PNG, WEBP are allowed.'));
};

const documentFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
};

export const uploadAccommodationImages = multer({
  storage: createCloudinaryStorage('accommodations'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 5);

export const uploadVehicleImages = multer({
  storage: createCloudinaryStorage('vehicles'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 5);

export const uploadHouseImages = multer({
  storage: createCloudinaryStorage('houses'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 10);

export const uploadProfileImage = multer({
  storage: createCloudinaryStorage('profiles'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 },
}).single('profile_image');

export const uploadPaymentProof = multer({
  storage: createCloudinaryStorage('payment-proofs', true),
  fileFilter: documentFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).single('payment_proof');

export const uploadPayoutProof = multer({
  storage: createCloudinaryStorage('payout-proofs', true),
  fileFilter: documentFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
}).single('payout_proof');