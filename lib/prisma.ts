import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

// Always assign to global to ensure singleton across hot reloads
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}



