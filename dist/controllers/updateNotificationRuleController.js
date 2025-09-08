"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationRuleController = void 0;
const prisma_1 = require("../config/prisma");
// PATCH /notification-rules/:id
const updateNotificationRuleController = async (req, res) => {
    const { id } = req.params;
    let data = { ...req.body };
    // Só faz connect se sectorId for string não vazia e existir no banco
    if (typeof data.sectorId === 'string' && data.sectorId.trim() !== '') {
        const sectorExists = await prisma_1.prisma.sector.findUnique({ where: { id: data.sectorId } });
        if (sectorExists) {
            data.sector = { connect: { id: data.sectorId } };
        }
    }
    delete data.sectorId;
    // Se o frontend enviar integrationId, converte para o formato Prisma
    if (data.integrationId) {
        data.integration = { connect: { id: data.integrationId } };
        delete data.integrationId;
    }
    // Garante que active seja boolean se enviado como string
    if (typeof data.active === 'string') {
        data.active = data.active === 'true';
    }
    try {
        const updated = await prisma_1.prisma.notificationRule.update({
            where: { id },
            data,
        });
        return res.json(updated);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to update notification rule' });
    }
};
exports.updateNotificationRuleController = updateNotificationRuleController;
