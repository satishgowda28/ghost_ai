import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { enrichEmailsWithClerk } from "@/lib/clerk-users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response(null, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: {
        select: { id: true, email: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) return new Response(null, { status: 404 });

  const isOwner = project.ownerId === userId;

  if (!isOwner) {
    const user = await currentUser();
    const callerEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "";
    const isMember = project.collaborators.some(
      (c) => c.email.toLowerCase() === callerEmail
    );
    if (!isMember) return new Response(null, { status: 403 });
  }

  // Fetch owner info from Clerk
  const client = await clerkClient();
  const ownerUser = await client.users.getUser(project.ownerId);
  const ownerEmail = ownerUser.emailAddresses[0]?.emailAddress ?? "";
  const ownerDisplayName =
    ownerUser.fullName ||
    [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(" ") ||
    ownerUser.username ||
    ownerEmail;

  const owner = {
    displayName: ownerDisplayName,
    email: ownerEmail,
    avatarUrl: ownerUser.imageUrl || null,
  };

  // Batch enrich collaborator emails
  const emails = project.collaborators.map((c) => c.email);
  const enriched = await enrichEmailsWithClerk(emails);

  const collaborators = project.collaborators.map((c) => {
    const info = enriched.get(c.email.toLowerCase());
    return {
      id: c.id,
      email: c.email,
      displayName: info?.displayName ?? c.email,
      avatarUrl: info?.avatarUrl ?? null,
    };
  });

  return Response.json({ owner, collaborators });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response(null, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return new Response(null, { status: 404 });
  if (project.ownerId !== userId) return new Response(null, { status: 403 });

  let body: { email?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const raw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!raw || !raw.includes("@")) {
    return Response.json({ error: "valid email required" }, { status: 400 });
  }

  const caller = await currentUser();
  const ownerEmails =
    caller?.emailAddresses.map((e) => e.emailAddress.toLowerCase()) ?? [];
  if (ownerEmails.includes(raw)) {
    return Response.json({ error: "cannot invite yourself" }, { status: 400 });
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId, email: raw },
    });
    return Response.json(collaborator, { status: 201 });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return Response.json({ error: "already a collaborator" }, { status: 409 });
    }
    throw e;
  }
}
