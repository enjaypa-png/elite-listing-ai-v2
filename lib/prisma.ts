import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    // Disable prepared statements for PgBouncer compatibility
    // This fixes "prepared statement 's0' already exists" error
    datasourceUrl: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'pgbouncer=true&statement_cache_size=0',
  });

// Always assign to global to ensure singleton across hot reloads
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}



