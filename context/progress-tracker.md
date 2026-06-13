# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 04 complete — Project Dialogs

## Current Goal

- Define the immediate implementation goal here.

## Completed

- **01-design-system**: shadcn/ui initialized (Tailwind v4), components/ui/{button,card,dialog,input,tabs,textarea,scroll-area}.tsx added, lucide-react installed, lib/utils.ts cn() helper created, globals.css dark theme applied with project design tokens.
- **02-editor**: Editor chrome shell components added. `components/editor/editor-navbar.tsx` — fixed top navbar with PanelLeftOpen/PanelLeftClose toggle. `components/editor/project-sidebar.tsx` — floating overlay sidebar with Tabs (My Projects / Shared), empty placeholder states, New Project button. Dialog pattern: existing `components/ui/dialog.tsx` (shadcn) uses project color tokens via globals.css — ready for future use.
- **03-auth**: Clerk wired end-to-end. `proxy.ts` provides route protection via `clerkMiddleware` (Next.js 16 convention). `ClerkProvider` in root layout with dark appearance using CSS variable references. `/` redirects authenticated → `/editor`, unauthenticated → `/sign-in`. Sign-in and sign-up pages use two-panel layout (left: logo/tagline/feature list, hidden on mobile; right: Clerk form). `UserButton` added to editor navbar right section. `@clerk/ui` installed.
- **04-project-dialogs**: Editor home screen added to `/editor` page — centered heading, description, and New Project button. Three dialogs implemented: Create (live slug preview), Rename (prefilled input, auto-focus, Enter submits), Delete (destructive confirm). Dedicated hook `hooks/use-project-dialogs.ts` manages dialog/form/loading state. `EditorActionsContext` bridges layout→page boundary for New Project button wiring. Sidebar updated with mock project list (`lib/mock-projects.ts`) — owned projects show rename/delete actions, shared tab shows projects without actions. Mobile backdrop scrim added to sidebar. All wired: editor home New Project → create, sidebar New Project → create, sidebar rename/delete → respective dialogs. No API calls — mock data only. TypeScript clean, lint clean.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

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
