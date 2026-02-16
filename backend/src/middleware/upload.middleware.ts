import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the base upload directory exists
const baseDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Function to create storage engine for a specific type
const createStorage = (subfolder: string) => {
  const storageDir = path.join(baseDir, subfolder);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
  });
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPG, PNG, WEBP are allowed.'));
};

export const uploadAccommodationImages = multer({
  storage: createStorage('accommodations'),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).array('images', 5);

export const uploadVehicleImages = multer({
  storage: createStorage('vehicles'),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
}).array('images', 5);

export const uploadHouseImages = multer({
  storage: createStorage('houses'),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
}).array('images', 10);

export const uploadProfileImage = multer({
  storage: createStorage('profiles'),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB for profile pictures
}).single('profile_image');

export const uploadPaymentProof = multer({
  storage: createStorage('payment-proofs'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
  },
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).single('payment_proof');
