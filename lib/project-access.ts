import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getUserIdentity() {
  const { userId } = await auth();
  const user = await currentUser();
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  return { userId, primaryEmail };
}

export async function checkProjectAccess(
  projectId: string,
  userId: string,
  userEmail: string
): Promise<{ id: string; name: string; isOwner: boolean } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: { select: { email: true } },
    },
  });

  if (!project) return null;

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborators.some(
    (c) => c.email.toLowerCase() === userEmail.toLowerCase()
  );

  if (!isOwner && !isCollaborator) return null;

  return { id: project.id, name: project.name, isOwner };
}
