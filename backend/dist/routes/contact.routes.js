"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', contact_controller_1.submitInquiry);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), contact_controller_1.getInquiries);
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), contact_controller_1.updateInquiryStatus);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map