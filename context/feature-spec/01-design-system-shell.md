# 01 Design System

Read `AGENTS.md` before starting

We're adding the desing system and UI primitive components.

Install and configure `shadcn/ui`.

Add these shadcn components:

- Button
- card
- Dailog
- Input
- Tabs
- Testarea
- ScrollArea

Do not modifu the generated `components/ui/*` files after installation

Also Install `licide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

Esnure all components match the exixting dark theme in `globas.css`.

### Check when done

- All components import with out errors
- `cn()` works properly
- No default light styling appears
