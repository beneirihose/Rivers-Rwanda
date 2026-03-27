export interface Notification {
    id?: string;
    user_id: string;
    title: string;
    message: string;
    type: 'booking' | 'system' | 'payout' | 'listing' | 'security';
    is_read?: boolean;
    created_at?: Date;
}
export declare const createNotification: (data: Notification) => Promise<void>;
export declare const getNotificationsByUserId: (userId: string) => Promise<Notification[]>;
export declare const markAsRead: (notificationId: string) => Promise<void>;
export declare const markAllAsRead: (userId: string) => Promise<void>;
export declare const getUnreadCount: (userId: string) => Promise<any>;
export declare const notifyAdmins: (title: string, message: string, type: Notification["type"]) => Promise<void>;
//# sourceMappingURL=Notification.model.d.ts.map