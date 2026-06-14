## Error Type

Runtime PrismaClientKnownRequestError

## Error Message

Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].project.findMany()` invocation in
/Users/satishgowda/DEV/AI_Learning/ghost-ai/.next/dev/server/chunks/ssr/[root-of-the-server]__0cikg4e._.js:330:140

  327 [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
  328 ;
  329 async function getOwnedProjects(userId) {
→ 330     return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].project.findMany(
The table `public.Project` does not exist in the current database.

    at <unknown> (lib/projects.ts:5:25)
    at Promise.all (<anonymous>:1:20)
    at EditorLayout (app/editor/layout.tsx:18:43)

## Code Frame

  3 |
  4 | export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
> 5 |   return prisma.project.findMany({
    |                         ^
  6 |     where: { ownerId: userId },
  7 |     select: { id: true, name: true },
  8 |     orderBy: { createdAt: "desc" },

Next.js version: 16.2.6 (Turbopack)

## Error Type

Console Error

## Error Message

(node:63669) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:

- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See <https://www.postgresql.org/docs/current/libpq-ssl.html> for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)

    at EditorLayout (<anonymous>:null:null)

Next.js version: 16.2.6 (Turbopack)
