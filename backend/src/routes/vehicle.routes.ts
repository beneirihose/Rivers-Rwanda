import { Router } from 'express';
import { 
  getVehicles, 
  getVehicle, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadVehicleImages } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getVehicles);
router.get('/:id', getVehicle);

// Admin and Seller routes
router.post('/', authenticate, authorize('admin', 'seller'), uploadVehicleImages, createVehicle);
router.patch('/:id', authenticate, authorize('admin', 'seller'), uploadVehicleImages, updateVehicle);
router.delete('/:id', authenticate, authorize('admin', 'seller'), deleteVehicle);

export default router;
