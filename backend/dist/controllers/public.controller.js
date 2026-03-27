"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicStats = void 0;
const connection_1 = require("../database/connection");
const getPublicStats = async (req, res, next) => {
    try {
        const [accommodationCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM accommodations');
        const [vehicleCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM vehicles');
        const [bookingCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM bookings');
        const [agentCount] = await (0, connection_1.query)('SELECT COUNT(*) as count FROM users WHERE role = "agent" AND status = "active"');
        res.status(200).json({
            success: true,
            data: {
                accommodations: accommodationCount.count,
                vehicles: vehicleCount.count,
                bookings: bookingCount.count,
                agents: agentCount.count
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicStats = getPublicStats;
//# sourceMappingURL=public.controller.js.map