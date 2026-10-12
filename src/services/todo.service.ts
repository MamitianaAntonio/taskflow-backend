import prisma from "../prismaClient.ts";

export const todoStatuses = ["todo", "doing", "done"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

// Relations embedded on every todo returned to the client so the UI can
// render subtask/checklist progress without extra requests.
const todoRelations = {
  subtasks: { orderBy: { createdAt: "asc" as const } },
  checklist: { orderBy: { position: "asc" as const } },
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
}) {
  if (data.parentId) {
    const parent = await prisma.todo.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) throw new Error("Parent todo not found");
    if (parent.userId !== data.userId) throw new Error("Forbidden");
    if (parent.parentId) throw new Error("Subtasks cannot be nested further");
  }

  return prisma.todo.create({
    data: {
      title: data.title,
      description: data.description,
      userId: data.userId,
      status: data.status ?? "todo",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority ?? "medium",
      projectId: data.projectId ?? null,
      parentId: data.parentId ?? null,
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
  } = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.priority !== undefined) updateData.priority = data.priority;

  return prisma.todo.update({ where: { id }, data: updateData });
}

export async function deleteTodo(userId: string, id: string) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  return prisma.todo.delete({ where: { id } });
}

// --- Checklist items -------------------------------------------------------

async function findOwnedChecklistItem(
  userId: string,
  todoId: string,
  itemId: string,
) {
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { todo: true },
  });
  if (!item || item.todoId !== todoId) throw new Error("Checklist item not found");
  if (item.todo.userId !== userId) throw new Error("Forbidden");
  return item;
}

export async function addChecklistItem(
  userId: string,
  todoId: string,
  text: string,
) {
  const todo = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!todo) throw new Error("Todo not found");
  if (todo.userId !== userId) throw new Error("Forbidden");

  const last = await prisma.checklistItem.findFirst({
    where: { todoId },
    orderBy: { position: "desc" },
  });

  return prisma.checklistItem.create({
    data: { text, todoId, position: (last?.position ?? -1) + 1 },
  });
}

export async function updateChecklistItem(
  userId: string,
  todoId: string,
  itemId: string,
  data: { text?: string; done?: boolean },
) {
  await findOwnedChecklistItem(userId, todoId, itemId);

  const updateData: { text?: string; done?: boolean } = {};
  if (data.text !== undefined) updateData.text = data.text;
  if (data.done !== undefined) updateData.done = data.done;

  return prisma.checklistItem.update({ where: { id: itemId }, data: updateData });
}

export async function deleteChecklistItem(
  userId: string,
  todoId: string,
  itemId: string,
) {
  await findOwnedChecklistItem(userId, todoId, itemId);
  return prisma.checklistItem.delete({ where: { id: itemId } });
}
