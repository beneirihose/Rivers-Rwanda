"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticate, review_controller_1.submitReview);
router.get('/:type/:id', review_controller_1.getTargetReviews);
exports.default = router;
//# sourceMappingURL=review.routes.js.map