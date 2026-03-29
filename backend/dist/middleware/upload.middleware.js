"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPayoutProof = exports.uploadPaymentProof = exports.uploadProfileImage = exports.uploadHouseImages = exports.uploadVehicleImages = exports.uploadAccommodationImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Configure Cloudinary using CLOUDINARY_URL
cloudinary_1.v2.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
});
// Function to create Cloudinary storage for a specific folder
const createCloudinaryStorage = (folder, allowPdf = false) => {
    return new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: `rivers-rwanda/${folder}`,
            allowed_formats: allowPdf ? ['jpg', 'jpeg', 'png', 'webp', 'pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
            resource_type: 'auto',
        },
    });
};
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname)
        return cb(null, true);
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP are allowed.'));
};
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname)
        return cb(null, true);
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
};
exports.uploadAccommodationImages = (0, multer_1.default)({
    storage: createCloudinaryStorage('accommodations'),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 5);
exports.uploadVehicleImages = (0, multer_1.default)({
    storage: createCloudinaryStorage('vehicles'),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 5);
exports.uploadHouseImages = (0, multer_1.default)({
    storage: createCloudinaryStorage('houses'),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
}).array('images', 10);
exports.uploadProfileImage = (0, multer_1.default)({
    storage: createCloudinaryStorage('profiles'),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 2 },
}).single('profile_image');
exports.uploadPaymentProof = (0, multer_1.default)({
    storage: createCloudinaryStorage('payment-proofs', true),
    fileFilter: documentFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
}).single('payment_proof');
exports.uploadPayoutProof = (0, multer_1.default)({
    storage: createCloudinaryStorage('payout-proofs', true),
    fileFilter: documentFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
}).single('payout_proof');
//# sourceMappingURL=upload.middleware.js.map