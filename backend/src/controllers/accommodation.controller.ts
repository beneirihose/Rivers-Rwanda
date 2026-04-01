import { Request, Response, NextFunction } from 'express';
import * as AccommodationModel from '../models/Accommodation.model';
import * as UserModel from '../models/User.model';
import * as SellerModel from '../models/Seller.model';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const sanitizeAccommodationData = (body: any, imagePaths: string[] | null) => {
    const data: any = { ...body };
    
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

export const getAccommodations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const accommodations = await AccommodationModel.getAllAccommodations(filters);
    res.status(200).json({ success: true, data: accommodations });
  } catch (error) {
    next(error);
  }
};

export const getAccommodation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodation = await AccommodationModel.getAccommodationById(req.params.id);
    if (!accommodation) return res.status(404).json({ success: false, message: 'Accommodation not found' });
    res.status(200).json({ success: true, data: accommodation });
  } catch (error) {
    next(error);
  }
};

export const createAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication error.' });

    let sellerId: string | null = null;
    let initialStatus = 'pending_approval';

    if (userRole === 'admin') {
        sellerId = null;
        initialStatus = 'available';
    } else {
        sellerId = await UserModel.getSellerIdByUserId(userId);
        if (!sellerId) return res.status(403).json({ success: false, message: 'User is not a valid seller.' });
        const seller = await SellerModel.findSellerById(sellerId);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found.' });
        if (seller.status !== 'approved') return res.status(403).json({ success: false, message: 'Seller account not approved.' });
        
        if (!seller.agreed_to_commission && String(req.body.agreed_to_commission) === 'true') {
            await SellerModel.updateSeller(sellerId, { agreed_to_commission: true });
        }
    }

    const imagePaths: string[] = [];
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        imagePaths.push(file.path);
      });
    }

    const data = sanitizeAccommodationData(req.body, imagePaths);
    data.seller_id = sellerId;
    data.status = initialStatus;

    const newId = await AccommodationModel.createAccommodation(data);
    res.status(201).json({ success: true, message: userRole === 'admin' ? 'Published!' : 'Created!', data: { id: newId } });
  } catch (error) {
    next(error);
  }
};

export const updateAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await AccommodationModel.getAccommodationById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    // Handle Image Logic (Keep existing ones selected by user + new uploads)
    let finalImages = [];
    if (req.body.existingImages) {
        try {
            finalImages = JSON.parse(req.body.existingImages);
        } catch(e) { finalImages = []; }
    }

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const newImages = (req.files as Express.Multer.File[]).map(f => f.path);
        finalImages = [...finalImages, ...newImages];
    }

    const data = sanitizeAccommodationData(req.body, null);
    data.images = JSON.stringify(finalImages);

    await AccommodationModel.updateAccommodation(id, data);
    res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccommodation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const accommodation = await AccommodationModel.getAccommodationById(id);
    if (accommodation && accommodation.images) {
        try {
            const images = JSON.parse(accommodation.images as string);
            images.forEach((imgPath: string) => {
                const fullPath = path.join(__dirname, '../../', imgPath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
        } catch(e) {}
    }
    await AccommodationModel.deleteAccommodation(id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};
