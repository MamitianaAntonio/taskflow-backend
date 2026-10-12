import prisma from "../prismaClient.ts";

export async function findProjectOrThrow(userId: string, id: string) {
  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) throw new Error("Project Not Found");
  return project;
}
