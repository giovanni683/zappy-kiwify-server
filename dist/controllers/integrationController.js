"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIntegrations = listIntegrations;
exports.createIntegration = createIntegration;
exports.createAccount = createAccount;
exports.listAccounts = listAccounts;
exports.sendNotificationController = sendNotificationController;
exports.createNotificationRuleController = createNotificationRuleController;
exports.getNotificationRulesController = getNotificationRulesController;
exports.updateNotificationRuleStatusController = updateNotificationRuleStatusController;
exports.deleteNotificationRuleController = deleteNotificationRuleController;
exports.kiwifyWebhookHandler = kiwifyWebhookHandler;
exports.listConnectionsController = listConnectionsController;
exports.listZappyConnectionsController = listZappyConnectionsController;
exports.getNotificationRuleByIdController = getNotificationRuleByIdController;
const prisma_1 = require("../config/prisma");
const uuidv7_1 = require("uuidv7");
const sendMessageToClient_1 = require("../utils/sendMessageToClient");
const interpolateMessage_1 = require("../utils/interpolateMessage");
const sendMessage_1 = require("../services/sendMessage");
const notificationRuleModel_1 = require("../models/notificationRuleModel");
const zappyConnections_1 = require("../services/zappyConnections");
// Listar integrações (por accountId ou todas)
async function listIntegrations(req, res) {
    const { accountId } = req.query;
    try {
        const where = accountId ? { accountId: String(accountId) } : {};
        const integrations = await prisma_1.prisma.integration.findMany({ where });
        res.status(200).json(integrations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Criar integração (ZAPPY)
async function createIntegration(req, res) {
    const { accountId, type, credentials, zappyToken, zappyUrl, name } = req.body;
    if (!accountId || String(accountId).trim() === '' || type !== 'ZAPPY' || !credentials ||
        !credentials.client_id || String(credentials.client_id).trim() === '' ||
        !credentials.client_secret || String(credentials.client_secret).trim() === '' ||
        !zappyToken || String(zappyToken).trim() === '' ||
        !zappyUrl || String(zappyUrl).trim() === '') {
        return res.status(400).json({ error: 'Os campos accountId, type (deve ser ZAPPY), credentials.client_id, credentials.client_secret, zappyToken e zappyUrl são obrigatórios e não podem ser vazios.' });
    }
    try {
        const id = (0, uuidv7_1.uuidv7)();
        const fullCredentials = {
            ...credentials,
            zappyToken,
            zappyUrl
        };
        const integration = await prisma_1.prisma.integration.create({
            data: {
                id,
                accountId,
                type: 'ZAPPY',
                credentials: fullCredentials,
                name: name || null // Salva o nome se enviado, senão null
            }
        });
        res.status(201).json({ success: true, id: integration.id, integration });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Criar conta (ZAPPY)
async function createAccount(req, res) {
    const { name, status, ZappyUrl } = req.body;
    if (!name || typeof status !== 'number' || String(name).trim() === '' || !ZappyUrl || String(ZappyUrl).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), ZappyUrl.' });
    }
    try {
        const id = (0, uuidv7_1.uuidv7)();
        const result = await prisma_1.prisma.account.create({
            data: {
                id,
                name,
                status,
                credentials: {
                    zappyUrl: ZappyUrl
                }
            }
        });
        res.status(201).json({ success: true, id: result.id, result });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Listar contas
async function listAccounts(req, res) {
    try {
        const accounts = await prisma_1.prisma.account.findMany();
        res.json(accounts);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Envio de notificação simples
async function sendNotificationController(req, res) {
    const { title, message } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'O campo title é obrigatório, deve ser string e não pode ser vazio.' });
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'O campo message é obrigatório, deve ser string e não pode ser vazio.' });
    }
    try {
        await (0, sendMessage_1.sendMessage)({ eventType: 'custom_notification', title, message });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// CRUD de regras de notificação
async function createNotificationRuleController(req, res) {
    const { integrationId, accountId, active, event, message, adjustments } = req.body;
    if (!integrationId || String(integrationId).trim() === '' ||
        !accountId || String(accountId).trim() === '' ||
        typeof active !== 'boolean' || event === undefined ||
        !message || String(message).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId, accountId, active, event, message.' });
    }
    try {
        // Verifica se já existe uma regra para o mesmo accountId, integrationId e event
        const existing = await prisma_1.prisma.notificationRule.findFirst({
            where: { accountId, integrationId, event: String(event) }
        });
        if (existing) {
            // Atualiza a notificação existente
            const updated = await prisma_1.prisma.notificationRule.update({
                where: { id: existing.id },
                data: { integrationId, accountId, active, event: String(event), message, adjustments }
            });
            return res.json({ updated: true, rule: updated });
        }
        else {
            // Cria nova notificação
            const id = (0, uuidv7_1.uuidv7)();
            const rule = await (0, notificationRuleModel_1.createNotificationRule)({ id, integrationId, accountId, active, event: String(event), message, adjustments });
            return res.status(201).json({ created: true, rule });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getNotificationRulesController(req, res) {
    try {
        const { status, accountId } = req.query;
        if (status && status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: 'Invalid status filter.' });
        }
        const rules = await (0, notificationRuleModel_1.getNotificationRules)(status, accountId);
        const rulesWithName = rules.map(rule => ({
            ...rule,
            name: rule.message || rule.event || rule.id
        }));
        res.status(200).json(rulesWithName);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function updateNotificationRuleStatusController(req, res) {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'active must be boolean.' });
    }
    try {
        const updated = await (0, notificationRuleModel_1.updateNotificationRuleStatus)(id, active);
        res.status(200).json(updated);
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Notification rule not found.' });
        }
        res.status(500).json({ error: error.message });
    }
}
async function deleteNotificationRuleController(req, res) {
    const { id } = req.params;
    try {
        await (0, notificationRuleModel_1.deleteNotificationRule)(id);
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Handler de webhook Kiwify (mantido para centralização)
async function kiwifyWebhookHandler(req, res) {
    const payload = req.body;
    const eventType = payload?.event || payload?.webhook_event_type;
    const accountId = payload?.account_id || payload?.customerId;
    if (!eventType || !accountId) {
        return res.status(400).json({ error: 'Payload inválido.' });
    }
    try {
        // Cria evento/log ao receber o payload do Kiwify
        await prisma_1.prisma.notificationLog.create({
            data: {
                accountId: accountId,
                eventType: eventType,
                nomeCliente: payload.Customer?.full_name || payload.Customer?.first_name || '',
                numeroCliente: payload.Customer?.mobile || '',
                statusEnvio: 'RECEBIDO',
                errorMessage: null
            }
        });
        // Buscar regra de notificação para o evento
        const rule = await prisma_1.prisma.notificationRule.findFirst({
            where: {
                accountId,
                event: eventType,
                active: true
            }
        });
        // Fallback para variáveis
        let variables = (rule && rule.variables) || {};
        // Mapeamento de variáveis dinâmicas do payload (exemplo simplificado)
        if (eventType === 'order.created' || payload.webhook_event_type === 'order.created') {
            variables = {
                ...variables,
                orderId: payload.orderId ?? payload.order_id ?? '',
                nomeCompleto: payload.Customer?.full_name ?? '',
                primeiroNome: payload.Customer?.first_name ?? '',
                telefone: payload.Customer?.mobile ?? '',
                email: payload.Customer?.email ?? ''
            };
        }
        else {
            variables = { ...variables, ...payload };
        }
        // Mensagem interpolada
        const template = rule?.message || 'Novo evento recebido!';
        const message = (0, interpolateMessage_1.interpolateMessage)(template, variables);
        await (0, sendMessageToClient_1.sendMessageToClient)(accountId, message);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Erro ao processar webhook da Kiwify:', err);
        res.status(500).json({ error: err.message });
    }
}
// Listar conexões Zappy (persistidas no banco)
async function listConnectionsController(req, res) {
    const { accountId } = req.query;
    if (!accountId || String(accountId).trim() === '') {
        return res.status(400).json({ error: 'O parâmetro accountId é obrigatório na query string.' });
    }
    console.log('Recebido accountId:', accountId);
    try {
        const where = { type: 'ZAPPY' };
        if (accountId) {
            where.accountId = String(accountId);
        }
        const connections = await prisma_1.prisma.integration.findMany({ where });
        console.log('Resposta connections:', connections);
        // Garante que o campo id é sempre o UUID da integração
        const connectionsWithUuid = connections.map(conn => ({
            ...conn,
            id: conn.id // já é o UUID correto
        }));
        res.status(200).json(connectionsWithUuid);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Listar conexões Zappy ativas via SDK
async function listZappyConnectionsController(req, res) {
    const { accountId } = req.query;
    if (!accountId || String(accountId).trim() === '') {
        return res.status(400).json({ error: 'O parâmetro accountId é obrigatório na query string.' });
    }
    console.log('Recebido accountId (Zappy):', accountId);
    try {
        const connections = await (0, zappyConnections_1.listZappyConnections)(accountId);
        const integrations = await prisma_1.prisma.integration.findMany({
            where: { accountId: String(accountId), type: 'ZAPPY' }
        });
        const connectionsWithUuid = connections.map(conn => {
            const integration = integrations.find(intg => {
                let number = undefined;
                if (intg.credentials && typeof intg.credentials === 'object' && !Array.isArray(intg.credentials)) {
                    number = intg.credentials.number;
                }
                return number === conn.phone;
            }) || integrations[0];
            return {
                ...conn,
                id: integration ? integration.id : conn.id, // prioriza o UUID da integração
                name: conn.name // sempre usa o nome real do SDK
            };
        });
        console.log('Resposta listZappyConnections (com UUID e nome do SDK):', connectionsWithUuid);
        res.status(200).json(connectionsWithUuid);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
async function getNotificationRuleByIdController(req, res) {
    const { id } = req.params;
    const { accountId } = req.query;
    console.log('[getNotificationRuleByIdController] id:', id, 'accountId:', accountId, 'typeof id:', typeof id, 'typeof accountId:', typeof accountId);
    if (!id || String(id).trim() === '') {
        return res.status(400).json({ error: 'O parâmetro id é obrigatório na URL.' });
    }
    if (!accountId || String(accountId).trim() === '') {
        return res.status(400).json({ error: 'O parâmetro accountId é obrigatório na query string.' });
    }
    try {
        const rule = await prisma_1.prisma.notificationRule.findFirst({ where: { id: String(id).trim(), accountId: String(accountId).trim() } });
        console.log('[getNotificationRuleByIdController] Resultado da query:', rule);
        if (!rule) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }
        res.status(200).json({ ...rule, name: rule.message || rule.event || rule.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
