import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getNotificationRules(status?: "active" | "inactive") {
  if (status === "active") {
    return prisma.notificationRule.findMany({ where: { active: true } });
  }
  if (status === "inactive") {
    return prisma.notificationRule.findMany({ where: { active: false } });
  }
  return prisma.notificationRule.findMany();
}

export async function createNotificationRule(data: { id?: string; integrationId: string; accountId: string; active: boolean; event: number | string; message: string; adjustments: object }) {
  return prisma.notificationRule.create({ data: { ...data, event: Number(data.event) } });
}

export async function updateNotificationRuleStatus(id: string, active: boolean) {
  return prisma.notificationRule.update({ where: { id }, data: { active } });
}

export async function deleteNotificationRule(id: string) {
  return prisma.notificationRule.delete({ where: { id } });
}
