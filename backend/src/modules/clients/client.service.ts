import { prisma } from '../../lib/prisma';

// clients are basically just "who is this project for", kept deliberately
// dumb-simple, no ownership scoping needed here since these arent sensitive
export async function createClient(name: string) {
  return prisma.client.create({ data: { name } });
}

export async function listClients() {
  return prisma.client.findMany();
}
