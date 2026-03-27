"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controllers/agent.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All agent routes require authentication and the 'agent' role.
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('agent'));
// Define the routes for agent-specific data
router.get('/commissions', agent_controller_1.getMyCommissions);
router.get('/stats', agent_controller_1.getMyStats);
router.get('/referral-code', agent_controller_1.getMyReferralCode);
router.get('/clients', agent_controller_1.getMyClients);
router.patch('/commissions/:id/confirm-receipt', agent_controller_1.confirmPayoutReceipt);
exports.default = router;
//# sourceMappingURL=agent.routes.js.map