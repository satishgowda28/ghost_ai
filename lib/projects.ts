import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/types/project";

export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSharedProjects(
  userEmail: string
): Promise<ProjectData[]> {
  return prisma.project.findMany({
    where: { collaborators: { some: { email: userEmail } } },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
}
