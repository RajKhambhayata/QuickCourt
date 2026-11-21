/** Return true when a Prisma error indicates the configured database is unreachable. */
export function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const prismaError = error as { code?: string; message?: string; errorCode?: string };
  return prismaError.code === 'P1001' || prismaError.errorCode === 'P1001' || Boolean(prismaError.message?.includes('P1001'));
}
