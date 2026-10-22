import prisma from "../prismaClient.ts";
import {
  nextFutureOccurrence,
  type RepeatRule,
} from "../utils/recurrence.ts";

export const todoStatuses = ["todo", "doing", "done"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

// Relations embedded on every todo returned to the client so the UI can
// render subtask progress without extra requests.
const todoRelations = {
  subtasks: { orderBy: { createdAt: "asc" as const } },
};

export async function getAllTodos(userId: string) {
  return prisma.todo.findMany({
    where: { userId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: todoRelations,
  });
}

export async function getTodoByTitle(userId: string, title: string) {
  const todo = await prisma.todo.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      userId,
    },
  });
  if (!todo) throw new Error("Todo not found");
  return todo;
}

export async function createTodo(data: {
  title: string;
  description?: string;
  userId: string;
  status?: TodoStatus;
  dueDate?: string;
  priority?: string;
  projectId?: string;
  parentId?: string;
  repeat?: RepeatRule;
}) {
  if (data.parentId) {
    const parent = await prisma.todo.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) throw new Error("Parent todo not found");
    if (parent.userId !== data.userId) throw new Error("Forbidden");
    if (parent.parentId) throw new Error("Subtasks cannot be nested further");
  }

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;
  const repeat = data.repeat ?? "none";

  return prisma.todo.create({
    data: {
      title: data.title,
      description: data.description,
      userId: data.userId,
      status: data.status ?? "todo",
      dueDate,
      priority: data.priority ?? "medium",
      projectId: data.projectId ?? null,
      parentId: data.parentId ?? null,
      repeat,
      repeatAnchorDay:
        repeat !== "none" && dueDate ? dueDate.getUTCDate() : null,
    },
    include: todoRelations,
  });
}

export async function updateTodo(
  userId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: TodoStatus;
    dueDate?: string;
    priority?: string;
    projectId?: string | null;
    repeat?: RepeatRule;
  },
) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  const updateData: {
    title?: string;
    description?: string;
    status?: TodoStatus;
    dueDate?: Date | null;
    priority?: string;
    projectId?: string | null;
    repeat?: RepeatRule;
    repeatAnchorDay?: number | null;
  } = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.repeat !== undefined) updateData.repeat = data.repeat;
  if (data.projectId !== undefined) {
    if (data.projectId === null) {
      updateData.projectId = null;
    } else {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project) throw new Error("Project not found");
      if (project.userId !== userId) throw new Error("Forbidden");
      updateData.projectId = data.projectId;
    }
  }

  // Moving a recurring task moves its anchor day with it, so a monthly task
  // moved from the 5th to the 12th keeps coming back on the 12th.
  const repeat = updateData.repeat ?? todo.repeat;
  const dueDate = updateData.dueDate !== undefined ? updateData.dueDate : todo.dueDate;
  if (repeat !== "none" && dueDate) {
    updateData.repeatAnchorDay = dueDate.getUTCDate();
  } else if (repeat === "none") {
    updateData.repeatAnchorDay = null;
  }

  const updated = await prisma.todo.update({ where: { id }, data: updateData });

  // Completing a recurring task schedules its next occurrence.
  if (data.status === "done" && todo.status !== "done" && updated.repeat !== "none") {
    await spawnNextOccurrence(updated);
  }

  return updated;
}

/**
 * Creates the next occurrence of a recurring task, with its subtasks copied
 * over so a recurring checklist comes back with the same steps.
 */
async function spawnNextOccurrence(todo: {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  dueDate: Date | null;
  priority: string;
  projectId: string | null;
  parentId: string | null;
  repeat: RepeatRule;
  repeatAnchorDay: number | null;
}) {
  if (!todo.dueDate) return null;

  const nextDate = nextFutureOccurrence(
    todo.dueDate,
    todo.repeat,
    todo.repeatAnchorDay,
  );
  if (!nextDate) return null;

  const subtasks = await prisma.todo.findMany({ where: { parentId: todo.id } });
  // Subtasks keep their own offset relative to the parent they hang from.
  const shift = nextDate.getTime() - todo.dueDate.getTime();

  return prisma.$transaction(async (tx) => {
    const created = await tx.todo.create({
      data: {
        title: todo.title,
        description: todo.description,
        userId: todo.userId,
        status: "todo",
        dueDate: nextDate,
        priority: todo.priority,
        projectId: todo.projectId,
        parentId: todo.parentId,
        repeat: todo.repeat,
        repeatAnchorDay: todo.repeatAnchorDay ?? nextDate.getUTCDate(),
      },
    });

    if (subtasks.length > 0) {
      await tx.todo.createMany({
        data: subtasks.map((subtask) => ({
          title: subtask.title,
          description: subtask.description,
          userId: todo.userId,
          status: "todo" as const,
          dueDate: subtask.dueDate
            ? new Date(subtask.dueDate.getTime() + shift)
            : null,
          priority: subtask.priority,
          parentId: created.id,
        })),
      });
    }

    return created;
  });
}

export async function deleteTodo(userId: string, id: string) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  return prisma.todo.delete({ where: { id } });
}
