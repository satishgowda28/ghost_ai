# Prisma

Prisma is already installed . Add the project data model, Prisma client singleton and first migration.

## Models

create `prisma/models/project.prisma`

Add `Project`:

- Owner ID mapped to clerk user
- name
- optional description
- status enum: `DRAFT`, `ARCHIVED`
- `canvasJsonPath` for future canvas blob stroage
- timestamps
- indexes on owner ID and creation date

Add `ProjectCollaborator`

- Project realtion with cascade delete
- collaborator email
- creation timestamp
- unique constraing on project/email
- indexes on email and project/date

Do not add extra field unless required by Prisma.

## Prisma Client

Create `lib/prisma.ts` as a cached singleton

Branch by `DATABASE_URL`:

- if its starts with `prisma+postgress://`, use Accelerate
- otherwise use direct `@prisma/adapter-pg`

Cache the client on `global` in development for hot reloads.

## Migrations

Run the migration and generate the client.

## Dependencies

Already installed:

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

## Check When Done

- Schema has both models with correct relations and indexes
- `lib/prisma.ts` exports one cached Prisma instance
- migration run successfully
- `npm run build` passes
