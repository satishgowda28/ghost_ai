import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOwnedProjects } from "@/lib/projects";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response(null, { status: 401 });

  const projects = await getOwnedProjects(userId);
  return Response.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response(null, { status: 401 });

  let body: { name?: unknown; suffix?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — defaults below
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Untitled Project";

  const rawSuffix =
    typeof body.suffix === "string" && /^[a-z0-9]{2,8}$/.test(body.suffix)
      ? body.suffix
      : Math.random().toString(36).slice(2, 6);

  const slug = slugify(name) || "project";
  const id = `${slug}-${rawSuffix}`;

  try {
    const project = await prisma.project.create({
      data: { id, name, ownerId: userId },
    });
    return Response.json(project, { status: 201 });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return Response.json(
        { error: "Project ID conflict, try again" },
        { status: 409 }
      );
    }
    throw e;
  }
}
