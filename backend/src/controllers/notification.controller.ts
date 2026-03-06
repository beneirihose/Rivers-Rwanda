import { Request, Response, NextFunction } from 'express';
import * as NotificationModel from '../models/Notification.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const notifications = await NotificationModel.getNotificationsByUserId(userId);
        const unreadCount = await NotificationModel.getUnreadCount(userId);
        
        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await NotificationModel.markAsRead(req.params.id);
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        await NotificationModel.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        next(error);
    }
};
