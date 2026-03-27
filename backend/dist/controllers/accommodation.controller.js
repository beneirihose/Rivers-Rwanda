"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccommodation = exports.updateAccommodation = exports.createAccommodation = exports.getAccommodation = exports.getAccommodations = void 0;
const AccommodationModel = __importStar(require("../models/Accommodation.model"));
const UserModel = __importStar(require("../models/User.model"));
const SellerModel = __importStar(require("../models/Seller.model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sanitizeAccommodationData = (body, imagePaths) => {
    const data = { ...body };
    if (imagePaths) {
        data.images = JSON.stringify(imagePaths);
    }
    // Process boolean fields
    const boolFields = [
        'wifi', 'parking', 'garden', 'decoration', 'sonolization', 'gym', 'kitchen',
        'toilet', 'living_room', 'swimming_pool', 'has_elevator', 'is_furnished'
    ];
    boolFields.forEach(field => {
        if (body[field] !== undefined) {
            data[field] = ['true', true, 1, 'on'].includes(body[field]) ? 1 : 0;
        }
    });
    // Process numeric fields - Ensure empty strings are converted to null for MySQL
    const numericFields = ['floor_number', 'number_of_living_rooms'];
    numericFields.forEach(field => {
        if (body[field] !== undefined) {
            const val = parseInt(body[field]);
            data[field] = isNaN(val) ? null : val;
        }
    });
    const decimalFields = ['price_per_night', 'price_per_event', 'sale_price'];
    decimalFields.forEach(field => {
        if (body[field] !== undefined) {
            const val = parseFloat(body[field]);
            data[field] = isNaN(val) ? null : val;
        }
    });
    delete data.agreed_to_commission;
    delete data.existingImages; // Remove frontend-only field
    return data;
};
const getAccommodations = async (req, res, next) => {
    try {
        const filters = req.query;
        const accommodations = await AccommodationModel.getAllAccommodations(filters);
        res.status(200).json({ success: true, data: accommodations });
    }
    catch (error) {
        next(error);
    }
};
exports.getAccommodations = getAccommodations;
const getAccommodation = async (req, res, next) => {
    try {
        const accommodation = await AccommodationModel.getAccommodationById(req.params.id);
        if (!accommodation)
            return res.status(404).json({ success: false, message: 'Accommodation not found' });
        res.status(200).json({ success: true, data: accommodation });
    }
    catch (error) {
        next(error);
    }
};
exports.getAccommodation = getAccommodation;
const createAccommodation = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Authentication error.' });
        let sellerId = null;
        let initialStatus = 'pending_approval';
        if (userRole === 'admin') {
            sellerId = null;
            initialStatus = 'available';
        }
        else {
            sellerId = await UserModel.getSellerIdByUserId(userId);
            if (!sellerId)
                return res.status(403).json({ success: false, message: 'User is not a valid seller.' });
            const seller = await SellerModel.findSellerById(sellerId);
            if (!seller)
                return res.status(404).json({ success: false, message: 'Seller profile not found.' });
            if (seller.status !== 'approved')
                return res.status(403).json({ success: false, message: 'Seller account not approved.' });
            if (!seller.agreed_to_commission && String(req.body.agreed_to_commission) === 'true') {
                await SellerModel.updateSeller(sellerId, { agreed_to_commission: true });
            }
        }
        const imagePaths = [];
        if (req.files) {
            req.files.forEach(file => {
                imagePaths.push(`/uploads/accommodations/${path_1.default.basename(file.path)}`);
            });
        }
        const data = sanitizeAccommodationData(req.body, imagePaths);
        data.seller_id = sellerId;
        data.status = initialStatus;
        const newId = await AccommodationModel.createAccommodation(data);
        res.status(201).json({ success: true, message: userRole === 'admin' ? 'Published!' : 'Created!', data: { id: newId } });
    }
    catch (error) {
        next(error);
    }
};
exports.createAccommodation = createAccommodation;
const updateAccommodation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await AccommodationModel.getAccommodationById(id);
        if (!existing)
            return res.status(404).json({ success: false, message: 'Not found' });
        // Handle Image Logic (Keep existing ones selected by user + new uploads)
        let finalImages = [];
        if (req.body.existingImages) {
            try {
                finalImages = JSON.parse(req.body.existingImages);
            }
            catch (e) {
                finalImages = [];
            }
        }
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `/uploads/accommodations/${path_1.default.basename(f.path)}`);
            finalImages = [...finalImages, ...newImages];
        }
        const data = sanitizeAccommodationData(req.body, null);
        data.images = JSON.stringify(finalImages);
        await AccommodationModel.updateAccommodation(id, data);
        res.status(200).json({ success: true, message: 'Updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAccommodation = updateAccommodation;
const deleteAccommodation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const accommodation = await AccommodationModel.getAccommodationById(id);
        if (accommodation && accommodation.images) {
            try {
                const images = JSON.parse(accommodation.images);
                images.forEach((imgPath) => {
                    const fullPath = path_1.default.join(__dirname, '../../', imgPath);
                    if (fs_1.default.existsSync(fullPath))
                        fs_1.default.unlinkSync(fullPath);
                });
            }
            catch (e) { }
        }
        await AccommodationModel.deleteAccommodation(id);
        res.status(200).json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccommodation = deleteAccommodation;
//# sourceMappingURL=accommodation.controller.js.map