import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export async function getNotificationRules(status?: "active" | "inactive") {
  if (status === "active") {
    return prisma.notificationRule.findMany({ where: { active: true } });
  }
  if (status === "inactive") {
    return prisma.notificationRule.findMany({ where: { active: false } });
  }
  return prisma.notificationRule.findMany();
}

export async function createNotificationRule(data: { id?: string; integrationId: string; accountId: string; active: boolean; event: number; message: string; adjustments?: Prisma.InputJsonValue | null; variables?: object }) {
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
