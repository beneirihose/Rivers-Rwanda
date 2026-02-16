import { Router } from 'express';
import { 
  getHouses, 
  getHouse, 
  createHouse, 
  updateHouse, 
  deleteHouse 
} from '../controllers/house.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadHouseImages } from '../middleware/upload.middleware';

const router = Router();

router.get('/', getHouses);
router.get('/:id', getHouse);

// Admin only routes
router.post('/', authenticate, authorize('admin'), uploadHouseImages, createHouse);
router.patch('/:id', authenticate, authorize('admin'), uploadHouseImages, updateHouse);
router.delete('/:id', authenticate, authorize('admin'), deleteHouse);

export default router;
