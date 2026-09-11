// singleton pattern so we're not spinning up 400 db connections
// like that one intern did (jk, im the intern, this is me)
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  // uncomment if u wanna see every query fly by in the terminal
  // log: ['query', 'error', 'warn'],
});
