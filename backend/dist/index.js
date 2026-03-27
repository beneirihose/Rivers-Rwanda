"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const connection_1 = require("./database/connection");
const connection_2 = require("./database/connection");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
/**
 * Daily Task to check for expired bookings
 * Resets property status to 'pending_approval' after the booking end date
 */
const checkExpiredBookings = async () => {
    try {
        console.log('[CLEANUP]: Checking for expired bookings...');
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        // 1. Get all 'confirmed' or 'approved' bookings that reached their end_date
        const expiredBookings = await (0, connection_2.query)(`SELECT id, booking_type, house_id, vehicle_id, accommodation_id 
       FROM bookings 
       WHERE end_date < ? AND booking_status IN ('confirmed', 'approved')`, [now]);
        if (expiredBookings.length === 0) {
            console.log('[CLEANUP]: No expired bookings found.');
            return;
        }
        for (const booking of expiredBookings) {
            // Update Booking Status to 'completed'
            await (0, connection_2.query)("UPDATE bookings SET booking_status = 'completed' WHERE id = ?", [booking.id]);
            // Reset Property to 'pending_approval' so Admin can re-verify
            if (booking.house_id) {
                await (0, connection_2.query)("UPDATE houses SET status = 'pending_approval' WHERE id = ?", [booking.house_id]);
            }
            else if (booking.vehicle_id) {
                await (0, connection_2.query)("UPDATE vehicles SET status = 'pending_approval' WHERE id = ?", [booking.vehicle_id]);
            }
            else if (booking.accommodation_id) {
                await (0, connection_2.query)("UPDATE accommodations SET status = 'pending_approval' WHERE id = ?", [booking.accommodation_id]);
            }
            console.log(`[CLEANUP]: Property reset for expired booking ${booking.id}`);
        }
    }
    catch (error) {
        console.error('[CLEANUP_ERROR]:', error);
    }
};
// --- Start Server Function ---
const startServer = async () => {
    try {
        // Connect to the database first
        await (0, connection_1.connectDatabase)();
        console.log('Database connected successfully');
        // Middleware
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        // Serve Static Files
        app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        // API Routes
        app.use('/api/v1', routes_1.default);
        // Global Error Handler
        app.use(error_middleware_1.errorHandler);
        // Run cleanup once on startup
        await checkExpiredBookings();
        // Run cleanup every 24 hours
        setInterval(checkExpiredBookings, 24 * 60 * 60 * 1000);
        // Start Listening
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1); // Exit if DB connection fails
    }
};
// --- Execute Start ---
startServer();
//# sourceMappingURL=index.js.map