# Edit workspace

Build the `/editor/[roomId]` workspace shell with server-side access checks. No canvas logic yet.

## Access

`/editor/[roomId]` must be a server component.

Before Rendering

- unauthenticated users redirect to `/sign-in`
- unauthorized user , user with out access to project see `AccessDenied`
- The project that do not exisit  see `AccessDenied`

Create `/components/editor/access-denied.tsx` with:

- centered layout
- lock icon
- short message
- link back to `/editor`

## Access Helper

Create `lib/project-access.ts` with helpers for:

- getting current Clerk identity: `userId` + primary email
- check project access by owner or collaborator

## Layout

Build a full-viewport workspace layout with:

- top navbar showing the project name
- navbar actions: share button and AI sidebar toggle
- exisitng `ProjectSidebar` on left
- current room highlighted in the sidebar
- central canvas placeholder with dark background and centered message
- right sidebar placeholder for Future AI chat

The canvas are should fill the remaining space

## Scope

Do not add real canvas logic, Liveblocks, AI chat, or sharing behavior yet.

## Check when done

- `/editor/[roomId]` build successfully
- access helper exists outside the page component
- `AccessDenied` is used for missing or unauthorized projects
- workspace layout renders with current project context
- no typescript errors
