"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIntegrations = listIntegrations;
exports.createIntegration = createIntegration;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /integrations?accountId=xxx
async function listIntegrations(req, res) {
    const { accountId } = req.query;
    if (!accountId) {
        return res.status(400).json({ error: 'accountId é obrigatório.' });
    }
    try {
        const integrations = await prisma.integration.findMany({
            where: { accountId: String(accountId) }
        });
        res.status(200).json(integrations);
    }
    catch (err) {
        console.error('Erro ao listar integrações:', err);
        res.status(500).json({ error: err.message });
    }
}
// POST /integrations
async function createIntegration(req, res) {
    const { accountId, type, credentials } = req.body;
    if (!accountId || !type || !credentials) {
        return res.status(400).json({ error: 'accountId, type e credentials são obrigatórios.' });
    }
    try {
        const integration = await prisma.integration.create({
            data: {
                accountId,
                type: Number(type),
                credentials
            }
        });
        res.status(201).json({ success: true, id: integration.id });
    }
    catch (err) {
        console.error('Erro ao criar integração:', err);
        res.status(500).json({ error: err.message });
    }
}
