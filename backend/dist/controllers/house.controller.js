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
exports.deleteHouse = exports.updateHouse = exports.createHouse = exports.getHouse = exports.getHouses = void 0;
const HouseModel = __importStar(require("../models/House.model"));
const UserModel = __importStar(require("../models/User.model"));
const SellerModel = __importStar(require("../models/Seller.model"));
const path_1 = __importDefault(require("path"));
const processRequestData = (body, files) => {
    const data = { ...body };
    const booleanFields = ['has_parking', 'has_garden', 'has_wifi', 'has_tiles', 'has_electricity', 'has_water'];
    booleanFields.forEach(field => {
        if (body[field] !== undefined) {
            data[field] = ['true', true, 1, 'on'].includes(body[field]) ? 1 : 0;
        }
    });
    const numericFields = ['total_rooms', 'bedrooms', 'bathrooms', 'balconies'];
    numericFields.forEach(field => {
        if (body[field] !== undefined) {
            const val = parseInt(body[field], 10);
            data[field] = isNaN(val) ? 0 : val;
        }
    });
    if (body.size_sqm !== undefined) {
        const val = parseFloat(body.size_sqm);
        data.size_sqm = isNaN(val) ? null : val;
    }
    if (body.monthly_rent_price !== undefined) {
        const val = parseFloat(body.monthly_rent_price);
        data.monthly_rent_price = isNaN(val) || val <= 0 ? null : val;
    }
    if (body.purchase_price !== undefined) {
        const val = parseFloat(body.purchase_price);
        data.purchase_price = isNaN(val) || val <= 0 ? null : val;
    }
    delete data.existingImages; // Remove frontend-only field
    return data;
};
const getHouses = async (req, res, next) => {
    try {
        const houses = await HouseModel.getAllHouses(req.query);
        res.status(200).json({ success: true, data: houses });
    }
    catch (error) {
        next(error);
    }
};
exports.getHouses = getHouses;
const getHouse = async (req, res, next) => {
    try {
        const house = await HouseModel.getHouseById(req.params.id);
        if (house) {
            res.status(200).json({ success: true, data: house });
        }
        else {
            res.status(404).json({ success: false, message: 'House not found' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getHouse = getHouse;
const createHouse = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication error.' });
        }
        let sellerId = null;
        let initialStatus = 'pending_approval';
        if (userRole === 'admin') {
            sellerId = null;
            initialStatus = 'available';
        }
        else {
            sellerId = await UserModel.getSellerIdByUserId(userId);
            if (!sellerId) {
                return res.status(403).json({ success: false, message: 'User is not a valid seller.' });
            }
            const seller = await SellerModel.findSellerById(sellerId);
            if (!seller) {
                return res.status(404).json({ success: false, message: 'Seller profile not found.' });
            }
            if (seller.status !== 'approved') {
                return res.status(403).json({ success: false, message: 'Your seller account has not been approved.' });
            }
            const { agreed_to_commission } = req.body;
            if (!seller.agreed_to_commission && agreed_to_commission !== 'true' && agreed_to_commission !== true) {
                return res.status(403).json({ success: false, message: 'You must agree to the commission terms.' });
            }
            if (!seller.agreed_to_commission && (agreed_to_commission === 'true' || agreed_to_commission === true)) {
                await SellerModel.updateSeller(sellerId, { agreed_to_commission: true });
            }
        }
        const sanitizedData = processRequestData(req.body, null);
        sanitizedData.seller_id = sellerId;
        sanitizedData.status = initialStatus;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imagePaths = req.files.map((file) => `/uploads/houses/${path_1.default.basename(file.path)}`);
            sanitizedData.images = JSON.stringify(imagePaths);
        }
        const houseId = await HouseModel.createHouse(sanitizedData);
        res.status(201).json({
            success: true,
            message: userRole === 'admin' ? 'House created and published.' : 'House created and is pending approval.',
            id: houseId
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createHouse = createHouse;
const updateHouse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await HouseModel.getHouseById(id);
        if (!existing)
            return res.status(404).json({ success: false, message: 'House not found' });
        // Handle Image Logic
        let finalImages = [];
        if (req.body.existingImages) {
            try {
                finalImages = JSON.parse(req.body.existingImages);
            }
            catch (e) {
                finalImages = [];
            }
        }
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImages = req.files.map((file) => `/uploads/houses/${path_1.default.basename(file.path)}`);
            finalImages = [...finalImages, ...newImages];
        }
        const sanitizedData = processRequestData(req.body, null);
        if (finalImages.length > 0 || (req.files && Array.isArray(req.files) && req.files.length > 0)) {
            sanitizedData.images = JSON.stringify(finalImages);
        }
        await HouseModel.updateHouse(id, sanitizedData);
        res.status(200).json({ success: true, message: 'House updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateHouse = updateHouse;
const deleteHouse = async (req, res, next) => {
    try {
        await HouseModel.deleteHouse(req.params.id);
        res.status(200).json({ success: true, message: 'House deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteHouse = deleteHouse;
//# sourceMappingURL=house.controller.js.map