import { query } from '../database/connection';

export interface Notification {
    id?: string;
    user_id: string;
    title: string;
    message: string;
    type: 'booking' | 'system' | 'payout' | 'listing' | 'security';
    is_read?: boolean;
    created_at?: Date;
}

export const createNotification = async (data: Notification) => {
    const sql = `INSERT INTO notifications (id, user_id, title, message, type) VALUES (UUID(), ?, ?, ?, ?)`;
    await query(sql, [data.user_id, data.title, data.message, data.type]);
};

export const getNotificationsByUserId = async (userId: string) => {
    return await query<Notification[]>('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
};

export const markAsRead = async (notificationId: string) => {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
};

export const markAllAsRead = async (userId: string) => {
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
};

export const getUnreadCount = async (userId: string) => {
    const result = await query<any[]>('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
    return result[0].count;
};

// Admin helper to notify all admins
export const notifyAdmins = async (title: string, message: string, type: Notification['type']) => {
    const admins = await query<any[]>('SELECT id FROM users WHERE role = "admin" AND status = "active"');
    for (const admin of admins) {
        await createNotification({ user_id: admin.id, title, message, type });
    }
};
