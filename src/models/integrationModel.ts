import { prisma } from '../config/prisma';

export async function listIntegrations() {
  return prisma.integration.findMany();
}

export async function createIntegration(data: { accountId: string; type: string; credentials: object }) {
  return prisma.integration.create({ data });
}

