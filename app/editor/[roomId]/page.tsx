import { redirect } from "next/navigation";
import { getUserIdentity, checkProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params;
  const { userId, primaryEmail } = await getUserIdentity();

  if (!userId) redirect("/sign-in");

  const project = await checkProjectAccess(roomId, userId, primaryEmail);
  if (!project) return <AccessDenied />;

  return (
    <WorkspaceShell
      projectId={roomId}
      projectName={project.name}
      isOwner={project.isOwner}
    />
  );
}
