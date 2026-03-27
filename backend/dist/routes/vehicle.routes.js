"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/', vehicle_controller_1.getVehicles);
router.get('/:id', vehicle_controller_1.getVehicle);
// Admin and Seller routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), upload_middleware_1.uploadVehicleImages, vehicle_controller_1.createVehicle);
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), upload_middleware_1.uploadVehicleImages, vehicle_controller_1.updateVehicle);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), vehicle_controller_1.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicle.routes.js.map