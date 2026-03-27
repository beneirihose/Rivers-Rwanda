"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmins = exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotificationsByUserId = exports.createNotification = void 0;
const connection_1 = require("../database/connection");
const createNotification = async (data) => {
    const sql = `INSERT INTO notifications (id, user_id, title, message, type) VALUES (UUID(), ?, ?, ?, ?)`;
    await (0, connection_1.query)(sql, [data.user_id, data.title, data.message, data.type]);
};
exports.createNotification = createNotification;
const getNotificationsByUserId = async (userId) => {
    return await (0, connection_1.query)('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
};
exports.getNotificationsByUserId = getNotificationsByUserId;
const markAsRead = async (notificationId) => {
    await (0, connection_1.query)('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    await (0, connection_1.query)('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (userId) => {
    const result = await (0, connection_1.query)('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
    return result[0].count;
};
exports.getUnreadCount = getUnreadCount;
// Admin helper to notify all admins
const notifyAdmins = async (title, message, type) => {
    const admins = await (0, connection_1.query)('SELECT id FROM users WHERE role = "admin" AND status = "active"');
    for (const admin of admins) {
        await (0, exports.createNotification)({ user_id: admin.id, title, message, type });
    }
};
exports.notifyAdmins = notifyAdmins;
//# sourceMappingURL=Notification.model.js.map