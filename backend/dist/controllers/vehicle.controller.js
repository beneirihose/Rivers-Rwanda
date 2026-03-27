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
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicle = exports.getVehicles = void 0;
const VehicleModel = __importStar(require("../models/Vehicle.model"));
const UserModel = __importStar(require("../models/User.model"));
const SellerModel = __importStar(require("../models/Seller.model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getVehicles = async (req, res, next) => {
    try {
        const filters = req.query;
        const vehicles = await VehicleModel.getAllVehicles(filters);
        res.status(200).json({ success: true, data: vehicles });
    }
    catch (error) {
        next(error);
    }
};
exports.getVehicles = getVehicles;
const getVehicle = async (req, res, next) => {
    try {
        const vehicle = await VehicleModel.getVehicleById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.status(200).json({ success: true, data: vehicle });
    }
    catch (error) {
        next(error);
    }
};
exports.getVehicle = getVehicle;
const createVehicle = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication error.' });
        }
        let sellerId = null;
        let initialStatus = 'available';
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
            if (!seller.agreed_to_commission && String(agreed_to_commission) !== 'true') {
                return res.status(403).json({ success: false, message: 'You must agree to the commission terms.' });
            }
            if (!seller.agreed_to_commission && String(agreed_to_commission) === 'true') {
                await SellerModel.updateSeller(sellerId, { agreed_to_commission: true });
            }
            // For sellers, the status MUST be pending_approval
            initialStatus = 'pending_approval';
        }
        const imagePaths = [];
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
                const urlPath = `/uploads/vehicles/${path_1.default.basename(file.path)}`;
                imagePaths.push(urlPath);
            });
        }
        const data = {
            ...req.body,
            seller_id: sellerId,
            images: JSON.stringify(imagePaths),
            status: initialStatus,
            seating_capacity: parseInt(req.body.seating_capacity || '0', 10)
        };
        const newId = await VehicleModel.createVehicle(data);
        res.status(201).json({
            success: true,
            message: userRole === 'admin' ? 'Vehicle created and published.' : 'Vehicle created and is pending approval.',
            data: { id: newId }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImagePaths = req.files.map((file) => `/uploads/vehicles/${path_1.default.basename(file.path)}`);
            data.images = JSON.stringify(newImagePaths);
        }
        await VehicleModel.updateVehicle(id, data);
        res.status(200).json({ success: true, message: 'Vehicle updated' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vehicle = await VehicleModel.getVehicleById(id);
        if (vehicle && vehicle.images) {
            try {
                const images = JSON.parse(vehicle.images);
                images.forEach((imgPath) => {
                    const fullPath = path_1.default.join(__dirname, '../../', imgPath);
                    if (fs_1.default.existsSync(fullPath)) {
                        fs_1.default.unlinkSync(fullPath);
                    }
                });
            }
            catch (e) {
                console.error("Error deleting images:", e);
            }
        }
        await VehicleModel.deleteVehicle(id);
        res.status(200).json({ success: true, message: 'Vehicle deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicle.controller.js.map