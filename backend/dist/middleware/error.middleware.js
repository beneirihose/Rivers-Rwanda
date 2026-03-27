"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log the full error for debugging purposes on the server
    console.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    console.error(err.stack);
    // Send a clean JSON response to the client
    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map