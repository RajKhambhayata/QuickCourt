import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn', { emit: 'event', level: 'query' }] 
      : ['error'],
  });

globalForPrisma.prisma = prisma;

if (process.env.NODE_ENV !== 'production') {
  // Log slow queries (>100ms) in development
  (prisma as any).$on?.('query', (e: any) => {
    if (e.duration > 100) {
      console.log(`\n⚠️  Slow Query (${e.duration}ms):`);
      console.log(`Query: ${e.query}`);
      console.log(`Params: ${e.params}\n`);
    }
  });
}

export default prisma;
