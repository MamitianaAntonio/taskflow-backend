import type { Request, Response } from "express";
import * as notificationService from "../services/notification.service.ts";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const notifications = await notificationService.getAllNotifications(userId);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const notifications =
      await notificationService.getUnreadNotifications(userId);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: "Invalid notification ID" });

    const notification = await notificationService.markAsRead(userId, id);
    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Notification not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : 500;
    res.status(status).json({ error: message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    await notificationService.markAllAsRead(userId);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: "Invalid notification ID" });

    await notificationService.deleteNotification(userId, id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    const message = (error as Error).message;
    const status =
      message === "Notification not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : 500;
    res.status(status).json({ error: message });
  }
};

export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId as number;
    await notificationService.deleteAllNotifications(userId);
    res.json({ message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notifications" });
  }
};
