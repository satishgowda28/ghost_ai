# Auth

Clerk is already installed and connected. Wiring it is done into the Next.js app: look for these if not please make the chnages: provider, auth pages, redirects, route protection and user menu.

Override Clerk appearance varianles using the app's existing CSS variables. Do not harcode colors.

## Sign-in and sign-up pages

- large screens: simple two-panel layout
- left: compact logo, tagline, shoirt text-only feature list
- right: centered Clerk form
- small screens: form only
- not gradients
- no oversized hero sections
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional.

## Implementation

In the root layout `ClerkProvider` is used make it dark using clerks `dark` theme

Define Public routes using the existing sign-in and sign-up env vars. Prtect everthing else by default.

update `/`:

- authenticated user visit redirect to `/editor`
- anauthenticated user visint redirect to `/sign-in`

Add clerk's built-in `UserButton` if not used to the editor navbar right section for profile settings and logout. I fused SKIP this.

Keep Clerk's defalut user menu and profile flows intact. Do not rebuild or heavily customise clerk internals.

## Dependencies

install: @clerk/ui.

## Check When Done

- `Proxy.ts` exist at the root
- all routes are protected except public auth paths
- auth pages use CSS varibles with no harcoded colors
- `ClerkProvider` wrap the root layout
- `npm run build` passes
