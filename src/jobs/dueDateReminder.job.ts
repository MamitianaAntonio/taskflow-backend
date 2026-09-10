import cron from "node-cron";
import prisma from "../prismaClient.ts";
import { notifyTodoDueSoon } from "../utils/notification.helper.ts";

const ONE_MINUTE = 60 * 1000;
const THIRTY_MINUTES = 30 * ONE_MINUTE;
const TWENTY_FOUR_HOURS = 24 * 60 * ONE_MINUTE;

function getReminderStage(dueDate: Date, now: Date): "24h" | "30min" | "overdue" | null {
  if (dueDate.getTime() <= now.getTime()) return "overdue";
  if (dueDate.getTime() <= now.getTime() + THIRTY_MINUTES) return "30min";
  if (dueDate.getTime() <= now.getTime() + TWENTY_FOUR_HOURS) return "24h";
  return null;
}

export async function runDueDateReminders() {
  const todos = await prisma.todo.findMany({
    where: {
      dueDate: { not: null },
      status: { not: "done" },
    },
  });

  const now = new Date();

  for (const todo of todos) {
    if (!todo.dueDate) continue;

    const stage = getReminderStage(todo.dueDate, now);
    if (!stage) continue;

    const alreadySent = await prisma.notification.findFirst({
      where: {
        todoId: todo.id,
        type: "todo_due_soon",
        reminderStage: stage,
      },
    });

    if (alreadySent) continue;

    await notifyTodoDueSoon({
      userId: todo.userId,
      todoId: todo.id,
      todoTitle: todo.title,
      stage,
    });
  }
}

export function startDueDateReminderJob() {
  cron.schedule("*/5 * * * *", () => {
    runDueDateReminders().catch((error) => {
      console.error("Due date reminder job failed:", error);
    });
  });
}