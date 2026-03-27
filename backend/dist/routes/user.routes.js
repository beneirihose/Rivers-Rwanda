"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/profile', auth_middleware_1.authenticate, user_controller_1.getProfile);
router.patch('/profile', auth_middleware_1.authenticate, upload_middleware_1.uploadProfileImage, user_controller_1.updateProfile);
router.post('/change-password', auth_middleware_1.authenticate, user_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map