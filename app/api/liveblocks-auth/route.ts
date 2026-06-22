import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { checkProjectAccess } from "@/lib/project-access";
import { getLiveblocksClient, getCursorColor } from "@/lib/liveblocks";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const body = await request.json();
  const { projectId } = body as { projectId?: string };

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const project = await checkProjectAccess(projectId, userId, userEmail);
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    userEmail ||
    userId;

  const avatarUrl = user?.imageUrl ?? "";
  const color = getCursorColor(userId);

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(projectId, {
    defaultAccesses: [],
  });

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: displayName,
      avatar: avatarUrl,
      color,
    },
  });

  session.allow(projectId, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();

  return new Response(responseBody, { status });
}
