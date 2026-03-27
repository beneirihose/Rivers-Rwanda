"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accommodation_controller_1 = require("../controllers/accommodation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/', accommodation_controller_1.getAccommodations);
router.get('/:id', accommodation_controller_1.getAccommodation);
// Seller and Admin routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('seller', 'admin'), upload_middleware_1.uploadAccommodationImages, accommodation_controller_1.createAccommodation);
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('seller', 'admin'), upload_middleware_1.uploadAccommodationImages, accommodation_controller_1.updateAccommodation);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('seller', 'admin'), accommodation_controller_1.deleteAccommodation);
exports.default = router;
//# sourceMappingURL=accommodation.routes.js.map