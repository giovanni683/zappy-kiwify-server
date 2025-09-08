"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationRules = getNotificationRules;
exports.createNotificationRule = createNotificationRule;
exports.updateNotificationRuleStatus = updateNotificationRuleStatus;
exports.deleteNotificationRule = deleteNotificationRule;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
async function getNotificationRules(status, accountId) {
    const where = {};
    if (status === "active")
        where.active = true;
    if (status === "inactive")
        where.active = false;
    if (accountId)
        where.accountId = accountId;
    return prisma_1.prisma.notificationRule.findMany({ where });
}
async function createNotificationRule(data) {
    return prisma_1.prisma.notificationRule.create({
        data: {
            ...data,
            adjustments: data.adjustments ?? client_1.Prisma.JsonNull,
            variables: (typeof data.variables === 'object' && data.variables !== null) ? data.variables : {}
        }
    });
}
async function updateNotificationRuleStatus(id, active) {
    return prisma_1.prisma.notificationRule.update({ where: { id }, data: { active } });
}
async function deleteNotificationRule(id) {
    return prisma_1.prisma.notificationRule.delete({ where: { id } });
}
