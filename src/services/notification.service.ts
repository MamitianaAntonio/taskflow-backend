import prisma from "../prismaClient.ts";

export const notificationTypes = [
  "todo_created",
  "todo_updated",
  "todo_deleted",
  "todo_due_soon",
  "project_created",
  "project_updated",
  "project_deleted",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export async function getAllNotifications(userId: number) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadNotifications(userId: number) {
  return prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: number) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function createNotification(data: {
  userId: number;
  type: NotificationType;
  message: string;
  todoId?: number;
  reminderStage?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
      todoId: data.todoId ?? null,
      reminderStage: data.reminderStage ?? null,
    },
  });
}

export async function hasDueSoonReminder(
  todoId: number,
  reminderStage: string,
) {
  const existing = await prisma.notification.findFirst({
    where: {
      todoId,
      type: "todo_due_soon",
      reminderStage,
    },
  });
  return existing !== null;
}

export async function markAsRead(userId: number, id: number) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Forbidden");

  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: number) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(userId: number, id: number) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Forbidden");

  return prisma.notification.delete({ where: { id } });
}

export async function deleteAllNotifications(userId: number) {
  return prisma.notification.deleteMany({
    where: { userId },
  });
}
