"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const connection_1 = require("../database/connection");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication token is missing or malformed.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        // Check if the user exists and is active
        const userResult = await (0, connection_1.query)('SELECT id, status FROM users WHERE id = ?', [decoded.userId]);
        if (userResult.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }
        const user = userResult[0];
        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: `User account is ${user.status}.` });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map