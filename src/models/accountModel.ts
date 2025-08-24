import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listAccounts() {
  return prisma.account.findMany();
}

export async function createAccount(data: { name: string; status: string }) {
  // Ajusta o tipo do campo status para number
  return prisma.account.create({ data: { ...data, status: Number(data.status) } });
}
