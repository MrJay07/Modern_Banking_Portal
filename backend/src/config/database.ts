import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.prisma = prisma;
}

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query}`, { params: e.params, duration: e.duration });
});

export default prisma;
