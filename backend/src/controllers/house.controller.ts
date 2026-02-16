import { Request, Response, NextFunction } from 'express';
import * as HouseModel from '../models/House.model';

const processRequestData = (body: any, files: any) => {
  const data = { ...body };

  // Sanitize boolean-like strings to 1 or 0 for the database
  data.has_parking = ['true', true, 1].includes(data.has_parking) ? 1 : 0;
  data.has_garden = ['true', true, 1].includes(data.has_garden) ? 1 : 0;
  data.has_wifi = ['true', true, 1].includes(data.has_wifi) ? 1 : 0;
  data.featured = ['true', true, 1].includes(data.featured) ? 1 : 0;

  // Sanitize number and price fields
  data.total_rooms = parseInt(data.total_rooms || '0', 10);
  data.bedrooms = parseInt(data.bedrooms || '0', 10);
  data.bathrooms = parseInt(data.bathrooms || '0', 10);
  data.monthly_rent_price = parseFloat(data.monthly_rent_price || '0');
  data.purchase_price = parseFloat(data.purchase_price || '0');
  if (!body.monthly_rent_price || body.monthly_rent_price === '0') data.monthly_rent_price = null;
  if (!body.purchase_price || body.purchase_price === '0') data.purchase_price = null;

  // --- THE DEFINITIVE, CORRECT FIX FOR IMAGE PATHS ---
  if (files && Array.isArray(files) && files.length > 0) {
    const imagePaths = files.map((file: any) => {
      // file.path is an absolute path like: "D:\\Rivers-Rwanda\\backend\\uploads\\houses\\image.png"
      // We need to transform it into a web-accessible URL path like: "/uploads/houses/image.png"
      const fullPath = file.path;
      const uploadsDir = 'uploads';
      const uploadsIndex = fullPath.indexOf(uploadsDir);
      
      // Take the substring from 'uploads' to the end, and normalize slashes for the URL
      const relativePath = fullPath.substring(uploadsIndex);
      return '/' + relativePath.replace(/\\/g, '/');
    });
    data.images = JSON.stringify(imagePaths);
  } else if (body.images) {
    data.images = body.images;
  } else {
    data.images = JSON.stringify([]);
  }

  return data;
};

export const getHouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const houses = await HouseModel.getAllHouses(req.query);
    res.status(200).json({ success: true, data: houses });
  } catch (error) {
    next(error);
  }
};

export const getHouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const house = await HouseModel.getHouseById(req.params.id);
    if (house) {
      res.status(200).json({ success: true, data: house });
    } else {
      res.status(404).json({ success: false, message: 'House not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const createHouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sanitizedData = processRequestData(req.body, req.files);
    const houseId = await HouseModel.createHouse(sanitizedData);
    res.status(201).json({ success: true, id: houseId });
  } catch (error) {
    next(error);
  }
};

export const updateHouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sanitizedData = processRequestData(req.body, req.files);
    await HouseModel.updateHouse(req.params.id, sanitizedData);
    res.status(200).json({ success: true, message: 'House updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteHouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await HouseModel.deleteHouse(req.params.id);
    res.status(200).json({ success: true, message: 'House deleted successfully' });
  } catch (error) {
    next(error);
  }
};
