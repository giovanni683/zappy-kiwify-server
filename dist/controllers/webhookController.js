"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleKiwifyWebhook = handleKiwifyWebhook;
exports.handleWebhook = handleWebhook;
const zenviaService_1 = require("../services/zenviaService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function handleKiwifyWebhook(req, res) {
    const event = req.body;
    // Validação básica dos dados do evento
    if (!event || typeof event !== 'object') {
        console.error('Webhook Kiwify: evento inválido');
        return res.status(400).json({ error: 'Evento inválido.' });
    }
    if (!event.account_id || typeof event.account_id !== 'string') {
        console.error('Webhook Kiwify: account_id inválido');
        return res.status(400).json({ error: 'account_id é obrigatório e deve ser string.' });
    }
    if (!event.integration_id || typeof event.integration_id !== 'string') {
        console.error('Webhook Kiwify: integration_id inválido');
        return res.status(400).json({ error: 'integration_id é obrigatório e deve ser string.' });
    }
    try {
        await prisma.notificationRule.create({
            data: {
                accountId: event.account_id,
                integrationId: event.integration_id,
                active: true,
                event: event.event_code || 1,
                message: JSON.stringify(event)
            }
        });
        await (0, zenviaService_1.sendZenviaNotification)(event);
        console.log(`Evento Kiwify registrado para account_id: ${event.account_id}`);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Erro ao processar webhook Kiwify:', err);
        res.status(500).json({ error: err.message });
    }
}
async function handleWebhook(req, res) {
    const notification = req.body;
    if (!notification || typeof notification !== 'object') {
        console.error('Webhook: notification inválida');
        return res.status(400).json({ error: 'Notification inválida.' });
    }
    try {
        await (0, zenviaService_1.sendZenviaNotification)(notification);
        console.log('Notificação processada via webhook.');
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Erro ao processar webhook:', err);
        res.status(500).json({ error: err.message });
    }
}
