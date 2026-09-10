import { Router } from "express";
import {
  getAllNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Successfully fetched notifications
 */
router.get("/", authMiddleware, getAllNotifications);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Get unread notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Successfully fetched unread notifications
 */
router.get("/unread", authMiddleware, getUnreadNotifications);

/**
 * @swagger
 * /api/notifications/unread/count:
 *   get:
 *     summary: Get unread notifications count
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: Successfully fetched unread count
 */
router.get("/unread/count", authMiddleware, getUnreadCount);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", authMiddleware, markAllAsRead);

/**
 * @swagger
 * /api/notifications/delete-all:
 *   delete:
 *     summary: Delete all notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: All notifications deleted
 */
router.delete("/delete-all", authMiddleware, deleteAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch("/:id/read", authMiddleware, markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
