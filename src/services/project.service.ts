import prisma from "../prismaClient.ts";
import { findProjectOrThrow } from "../utils/project.ts";

// get all projects
export async function getAllProjects(userId: number) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// get specifics project
export async function getProjectById(userId: number, id: number) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: { todos: true },
  });
}

// project creation
export async function createProject(data: {
  name: string;
  description?: string;
  userId: number;
}) {
  return prisma.project.create({ data });
}

// update project
export async function updateProject(
  userId: number,
  id: number,
  data: {
    name?: string;
    description?: string;
  },
) {
  await findProjectOrThrow(userId, id);
  return prisma.project.update({ where: { id }, data });
}

// delete project
export async function deleteProject(userId: number, id: number) {
  await findProjectOrThrow(userId, id);
  return prisma.project.delete({ where: { id } });
}
