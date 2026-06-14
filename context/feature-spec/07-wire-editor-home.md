# wire Editor Section With API

wire the editor home sidebar and dialogs to the real project API.

## Data Fetching

The editor home is a server side component.

Fetch owned and shared projects server-side using the existing project data helper and pass both list to the sidebar.

No client-side fetching for initial load.

## `Use Project Actions`

create a hook in `hooks/` that manages dialog state and project mutations.

**Create**

- manage create dialog state
- manage project name input
- generate a short unique suffix
- slugify the name to create the room ID
- call `Post /api/projects`
- naigate to the new workspace

The project ID and Liveblocks room ID shoudl stay aligned.

**Rename**

- store target project id+current name
- call `PATCH /api/projects/[id]`
- refresh on success

**Delete**

- store target project
- call `DELETE /api/projects/[id]`
- redirect to `/editor` if deleting the active workspace
- otherwise refresh

## Wiring

Connect the hook to the sidebat and dialogs.

- create dialog shows room ID preview
- rename dialog pre-fills current name
- delete dialog show project name

## Check when done

- sidebar uses real project data
- create navigates to workspace
- rename updates correctly
- delete refreshes or redirects correctly
- `npm run build` passes
