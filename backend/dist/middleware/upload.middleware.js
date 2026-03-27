"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPayoutProof = exports.uploadPaymentProof = exports.uploadProfileImage = exports.uploadHouseImages = exports.uploadVehicleImages = exports.uploadAccommodationImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure the base upload directory exists
const baseDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(baseDir)) {
    fs_1.default.mkdirSync(baseDir, { recursive: true });
}
// Function to create storage engine for a specific type
const createStorage = (subfolder) => {
    const storageDir = path_1.default.join(baseDir, subfolder);
    if (!fs_1.default.existsSync(storageDir)) {
        fs_1.default.mkdirSync(storageDir, { recursive: true });
    }
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, storageDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path_1.default.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        }
    });
};
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP are allowed.'));
};
exports.uploadAccommodationImages = (0, multer_1.default)({
    storage: createStorage('accommodations'),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).array('images', 5);
exports.uploadVehicleImages = (0, multer_1.default)({
    storage: createStorage('vehicles'),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
}).array('images', 5);
exports.uploadHouseImages = (0, multer_1.default)({
    storage: createStorage('houses'),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
}).array('images', 10);
exports.uploadProfileImage = (0, multer_1.default)({
    storage: createStorage('profiles'),
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 } // 2MB for profile pictures
}).single('profile_image');
exports.uploadPaymentProof = (0, multer_1.default)({
    storage: createStorage('payment-proofs'),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    },
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).single('payment_proof');
exports.uploadPayoutProof = (0, multer_1.default)({
    storage: createStorage('payout-proofs'),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    },
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
}).single('payout_proof');
//# sourceMappingURL=upload.middleware.js.map