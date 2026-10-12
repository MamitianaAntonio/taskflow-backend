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
  userId: string;
}) {
  return prisma.project.create({ data });
}

// update project
export async function updateProject(
  userId: string,
  id: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  await findProjectOrThrow(userId, id);
  return prisma.project.update({ where: { id }, data });
}

// delete project
export async function deleteProject(userId: string, id: string) {
  await findProjectOrThrow(userId, id);
  return prisma.project.delete({ where: { id } });
}
