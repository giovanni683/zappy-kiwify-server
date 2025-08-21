"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationController = sendNotificationController;
const notificationService_1 = require("../services/notificationService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function sendNotificationController(req, res) {
    const { title, message } = req.body;
    if (!title || typeof title !== 'string') {
        console.error('Erro de validação: title inválido');
        return res.status(400).json({ error: 'title é obrigatório e deve ser string.' });
    }
    if (!message || typeof message !== 'string') {
        console.error('Erro de validação: message inválido');
        return res.status(400).json({ error: 'message é obrigatório e deve ser string.' });
    }
    try {
        await (0, notificationService_1.sendNotification)({ title, message });
        console.log('Notificação enviada via controller.');
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Erro ao enviar notificação:', error);
        res.status(500).json({ error: error.message });
    }
}
