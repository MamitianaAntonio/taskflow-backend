import prisma from "../prismaClient.ts";
import { findProjectOrThrow } from "../utils/project.ts";

// get all projects
export async function getAllProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// get specifics project
export async function getProjectById(userId: string, id: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: { todos: true },
  });
}

// project creation
export async function createProject(data: {
  name: string;
  description?: string;
  dueDate?: string;
  userId: string;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: data.userId,
    },
  });
}

// update project
export async function updateProject(
  userId: string,
  id: string,
  data: {
    name?: string;
    description?: string;
    dueDate?: string | null;
  },
) {
  await findProjectOrThrow(userId, id);

  const updateData: {
    name?: string;
    description?: string;
    dueDate?: Date | null;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined)
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  return prisma.project.update({ where: { id }, data: updateData });
}

// delete project
export async function deleteProject(userId: string, id: string) {
  await findProjectOrThrow(userId, id);
  return prisma.project.delete({ where: { id } });
}
