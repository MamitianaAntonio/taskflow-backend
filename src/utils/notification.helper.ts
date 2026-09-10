import * as notificationService from "../services/notification.service.ts";

export async function notifyTodoDueSoon(data: {
  userId: number;
  todoId: number;
  todoTitle: string;
  stage: "24h" | "30min" | "overdue";
}) {
  const messages: Record<(typeof data.stage), string> = {
    "24h": `Task "${data.todoTitle}" is due tomorrow`,
    "30min": `Task "${data.todoTitle}" is due in 30 minutes`,
    overdue: `Task "${data.todoTitle}" is overdue`,
  };

  return notificationService.createNotification({
    userId: data.userId,
    todoId: data.todoId,
    reminderStage: data.stage,
    type: "todo_due_soon",
    message: messages[data.stage],
  });
}