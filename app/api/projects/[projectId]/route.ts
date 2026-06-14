import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return new Response(null, { status: 401 })

  const { projectId } = await params

  let body: { name?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return new Response(null, { status: 404 })
  if (project.ownerId !== userId) return new Response(null, { status: 403 })

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return Response.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()
  if (!userId) return new Response(null, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return new Response(null, { status: 404 })
  if (project.ownerId !== userId) return new Response(null, { status: 403 })

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
