"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const house_controller_1 = require("../controllers/house.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/', house_controller_1.getHouses);
router.get('/:id', house_controller_1.getHouse);
// Admin and Seller routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), upload_middleware_1.uploadHouseImages, house_controller_1.createHouse);
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), upload_middleware_1.uploadHouseImages, house_controller_1.updateHouse);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'seller'), house_controller_1.deleteHouse);
exports.default = router;
//# sourceMappingURL=house.routes.js.map