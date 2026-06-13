import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? ''
  const adapter = new PrismaPg({ connectionString: url })
  if (url.startsWith('prisma+postgres://')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require('@prisma/extension-accelerate')
    return new PrismaClient({ adapter }).$extends(withAccelerate()) as unknown as PrismaClient
  }
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
