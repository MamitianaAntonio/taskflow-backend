import prisma from "../prismaClient.ts";

export const todoStatuses = ["todo", "doing", "done"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

export async function getAllTodos(userId: number) {
  return prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTodoByTitle(userId: number, title: string) {
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
  userId: number;
  status?: TodoStatus;
  dueDate?: string;
  priority?: string;
  projectId?: number;
}) {
  return prisma.todo.create({
    data: {
      title: data.title,
      userId: data.userId,
      status: data.status ?? "todo",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority ?? "medium",
      projectId: data.projectId ?? null,
    },
  });
}

export async function updateTodo(
  userId: number,
  id: number,
  data: {
    title?: string;
    status?: TodoStatus;
    dueDate?: string;
    priority?: string;
  },
) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  const updateData: {
    title?: string;
    status?: TodoStatus;
    dueDate?: Date | null;
    priority?: string;
  } = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.priority !== undefined) updateData.priority = data.priority;

  return prisma.todo.update({ where: { id }, data: updateData });
}

export async function deleteTodo(userId: number, id: number) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  return prisma.todo.delete({ where: { id } });
}
