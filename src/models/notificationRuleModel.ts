import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export async function getNotificationRules(status?: "active" | "inactive", accountId?: string) {
  const where: any = {};
  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;
  if (accountId) where.accountId = accountId;
  return prisma.notificationRule.findMany({ where });
}

export async function createNotificationRule(data: { id?: string; integrationId: string; accountId: string; active: boolean; event: string; message: string; adjustments?: Prisma.InputJsonValue | null; variables?: object }) {
  return prisma.notificationRule.create({
    data: {
      ...data,
      adjustments: data.adjustments ?? Prisma.JsonNull,
      variables: (typeof data.variables === 'object' && data.variables !== null) ? data.variables : {}
    }
  });
}

export async function updateNotificationRuleStatus(id: string, active: boolean) {
  return prisma.notificationRule.update({ where: { id }, data: { active } });
}

export async function deleteNotificationRule(id: string) {
  return prisma.notificationRule.delete({ where: { id } });
}
