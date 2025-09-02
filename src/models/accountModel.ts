import { prisma } from '../config/prisma';

export async function listAccounts() {
  return prisma.account.findMany();
}

export async function createAccount(data: { name: string; status: number; ZappyUrl: string; kiwifyToken: string }) {
  return prisma.account.create({ data });
}

