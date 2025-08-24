import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listIntegrations() {
  return prisma.integration.findMany();
}

export async function createIntegration(data: { accountId: string; type: number; credentials: object }) {
  return prisma.integration.create({ data });
}
