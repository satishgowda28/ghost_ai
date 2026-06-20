# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 09 complete — Share dialog with collaborator management

## Completed

- **01-design-system**: shadcn/ui initialized (Tailwind v4), components/ui/{button,card,dialog,input,tabs,textarea,scroll-area}.tsx added, lucide-react installed, lib/utils.ts cn() helper created, globals.css dark theme applied with project design tokens.
- **02-editor**: Editor chrome shell components added. `components/editor/editor-navbar.tsx` — fixed top navbar with PanelLeftOpen/PanelLeftClose toggle. `components/editor/project-sidebar.tsx` — floating overlay sidebar with Tabs (My Projects / Shared), empty placeholder states, New Project button. Dialog pattern: existing `components/ui/dialog.tsx` (shadcn) uses project color tokens via globals.css — ready for future use.
- **03-auth**: Clerk wired end-to-end. `proxy.ts` provides route protection via `clerkMiddleware` (Next.js 16 convention). `ClerkProvider` in root layout with dark appearance using CSS variable references. `/` redirects authenticated → `/editor`, unauthenticated → `/sign-in`. Sign-in and sign-up pages use two-panel layout (left: logo/tagline/feature list, hidden on mobile; right: Clerk form). `UserButton` added to editor navbar right section. `@clerk/ui` installed.
- **04-project-dialogs**: Editor home screen added to `/editor` page — centered heading, description, and New Project button. Three dialogs implemented: Create (live slug preview), Rename (prefilled input, auto-focus, Enter submits), Delete (destructive confirm). Dedicated hook `hooks/use-project-dialogs.ts` manages dialog/form/loading state. `EditorActionsContext` bridges layout→page boundary for New Project button wiring. Sidebar updated with mock project list (`lib/mock-projects.ts`) — owned projects show rename/delete actions, shared tab shows projects without actions. Mobile backdrop scrim added to sidebar. All wired: editor home New Project → create, sidebar New Project → create, sidebar rename/delete → respective dialogs. No API calls — mock data only. TypeScript clean, lint clean.
- **05-prisma**: `prisma/models/project.prisma` — `Project` and `ProjectCollaborator` models with enum, relations, cascade delete, unique constraint, and indexes. `lib/prisma.ts` — cached singleton; branches on `DATABASE_URL`: `prisma+postgres://` → Accelerate path; otherwise `@prisma/adapter-pg`. Client generated to `app/generated/prisma/`. `@prisma/extension-accelerate` installed. Migration not applied — run `npx prisma migrate dev --name init` in terminal.
- **06-project-apis**: `app/api/projects/route.ts` — GET (list owner's projects, desc by createdAt) and POST (create, default name `Untitled Project`). `app/api/projects/[projectId]/route.ts` — PATCH (rename, 400 on empty name) and DELETE. All handlers: explicit 401 on no userId, 404 when project missing, 403 when requester is not owner. Owner-only mutations (no collaborator check per spec). `npm run build` passes.
- **07-wire-editor-home**: Editor home and sidebar wired to real API. `types/project.ts` — shared `ProjectData` interface (id, name). `lib/projects.ts` — `getOwnedProjects(userId)` and `getSharedProjects(userEmail)` helpers used by layout and GET route. `app/editor/layout.tsx` — async RSC; fetches owned + shared projects server-side via Clerk auth/currentUser, passes both lists to `EditorShell`. `app/editor/page.tsx` — converted to RSC; New Project button extracted to `components/editor/new-project-button.tsx` (client). `hooks/use-project-actions.ts` — replaces old mock hook; manages dialog state + real API mutations: POST create (id = slugify(name)+suffix, navigates to `/editor/[id]`), PATCH rename (router.refresh), DELETE (redirect to /editor if active workspace, else refresh). `app/api/projects/route.ts` — POST now accepts `{ name, suffix }`, computes id = `${slug}-${suffix}`, handles P2002 conflict with 409. `components/editor/project-sidebar.tsx` — accepts `ownedProjects`/`sharedProjects` props, no mock data. Dialogs updated to `ProjectData` type + `isLoading` prop + "room:" label in create dialog. `lib/mock-projects.ts` and `hooks/use-project-dialogs.ts` deleted. `npm run build` passes.
- **08-editor-workspace**: Workspace shell at `/editor/[roomId]` with server-side access control. `lib/project-access.ts` — `getUserIdentity()` (userId + primaryEmail via Clerk) and `checkProjectAccess(projectId, userId, email)` (owner or collaborator check). `components/editor/access-denied.tsx` — centered lock icon, message, link back to `/editor`; shown for missing or unauthorized projects. `app/editor/[roomId]/page.tsx` — async RSC; awaits params (Next.js 16 Promise params), calls getUserIdentity + checkProjectAccess, redirects unauthenticated users to `/sign-in`, renders AccessDenied for no-access, renders WorkspaceShell for authorized users. `components/editor/workspace-shell.tsx` — client component; sub-navbar with project name + Share button + AI sidebar toggle; canvas placeholder (dark bg, centered message); right AI sidebar placeholder (slide-over on toggle). `components/editor/project-sidebar.tsx` — updated to use `usePathname` and highlight active room with `bg-elevated`. `npm run build` passes.
- **09-shared-dialog**: Share dialog wired to Share button in editor workspace. `checkProjectAccess` extended to return `isOwner` flag. `lib/clerk-users.ts` — `enrichEmailsWithClerk(emails[])` does one batch `getUserList` call and maps results to `{ displayName, avatarUrl }` with graceful fallback to email. `app/api/projects/[projectId]/collaborators/route.ts` — GET (list, enriched with Clerk; accessible to owner or collaborator) and POST (invite by email, owner-only, normalized lowercase, rejects owner-self-invite, 409 on duplicate). `app/api/projects/[projectId]/collaborators/[collaboratorId]/route.ts` — DELETE (owner-only, verifies collaborator belongs to project by cuid). `components/editor/share-dialog.tsx` — Dialog with avatar + display name, owner view: invite form + remove button + copy-link; collaborator view: read-only list. `components/editor/workspace-shell.tsx` — Share button opens dialog, passes projectId/isOwner. `app/editor/[roomId]/page.tsx` — passes projectId and isOwner to WorkspaceShell. `npm run build` passes.

## In Progress

- None.

## Next Up

- Feature 10: Canvas workspace — Liveblocks room setup, React Flow canvas.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn/ui initialized for Tailwind v4 (no tailwind.config.js — config via CSS @theme inline).
- globals.css is single source of truth: project tokens (--bg-base, --text-primary, etc.) mapped to Tailwind utilities (bg-base, text-copy-primary, etc.) via @theme inline.
- Dark-only: all shadcn semantic tokens wired to dark values in :root; `dark` class added to `<html>` so dark: variants activate.
- Do not modify components/ui/* — protected foundation per ai-workflow-rules.md.
- Next.js 16: middleware renamed to `proxy.ts` (not `middleware.ts`). Clerk's `clerkMiddleware` default export is compatible with Next.js 16 proxy convention.
- Clerk appearance themed via CSS variable references (`var(--bg-base)` etc.) in `ClerkProvider` `appearance.variables` — no hardcoded colors, no `@clerk/themes` dependency needed.

## Session Notes

- Next.js 16.2.6 with Tailwind v4 (PostCSS plugin). shadcn 4.8.0. lucide-react installed.
