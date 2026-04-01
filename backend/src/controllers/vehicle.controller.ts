import { Request, Response, NextFunction } from 'express';
import * as VehicleModel from '../models/Vehicle.model';
import * as UserModel from '../models/User.model';
import * as SellerModel from '../models/Seller.model';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const vehicles = await VehicleModel.getAllVehicles(filters);
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await VehicleModel.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication error.' });
    }

    let sellerId: string | null = null;
    let initialStatus: string = 'available';

    if (userRole === 'admin') {
        sellerId = null;
        initialStatus = 'available';
    } else {
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
            await SellerModel.updateSeller(sellerId, { agreed_to_commission: true } as Partial<SellerModel.Seller>);
        }
        
        // For sellers, the status MUST be pending_approval
        initialStatus = 'pending_approval';
    }

    const imagePaths: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        imagePaths.push(file.path);
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
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImagePaths: string[] = req.files.map((file: any) => file.path);
      data.images = JSON.stringify(newImagePaths);
    }

    await VehicleModel.updateVehicle(id, data);
    res.status(200).json({ success: true, message: 'Vehicle updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleModel.getVehicleById(id);

    if (vehicle && vehicle.images) {
      try {
        const images = JSON.parse(vehicle.images as string);
        images.forEach((imgPath: string) => {
          const fullPath = path.join(__dirname, '../../', imgPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      } catch (e) {
        console.error("Error deleting images:", e);
      }
    }

    await VehicleModel.deleteVehicle(id);
    res.status(200).json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    next(error);
  }
};
