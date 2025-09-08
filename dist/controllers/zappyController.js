"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = createAccount;
exports.listAccounts = listAccounts;
exports.createIntegration = createIntegration;
exports.listIntegrations = listIntegrations;
exports.createNotificationRule = createNotificationRule;
exports.listNotificationRules = listNotificationRules;
exports.kiwifyWebhookHandler = kiwifyWebhookHandler;
const interpolateMessage_1 = require("../utils/interpolateMessage");
const prisma_1 = require("../config/prisma");
const uuidv7_1 = require("uuidv7");
const sendMessageToClient_1 = require("../utils/sendMessageToClient");
const kiwifyPayloads_1 = require("../utils/kiwifyPayloads");
// Criar uma conta
async function createAccount(req, res) {
    const { name, status, ZappyUrl, zappyUrl, zappyToken } = req.body;
    // Aceita tanto 'ZappyUrl' quanto 'zappyUrl' no payload
    const url = ZappyUrl || zappyUrl;
    if (!name || typeof status !== 'number' || String(name).trim() === '' || !url || String(url).trim() === '' || !zappyToken || String(zappyToken).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), zappyUrl, zappyToken.' });
    }
    try {
        const id = (0, uuidv7_1.uuidv7)();
        const result = await prisma_1.prisma.account.create({
            data: {
                id,
                name,
                status,
                credentials: {
                    zappyUrl: url,
                    zappyToken
                }
            }
        });
        res.status(201).json({ success: true, id: result.id, result });
    }
    catch (err) {
        console.error('Erro ao criar conta:', err);
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
// Criar integração
async function createIntegration(req, res) {
    const { accountId, type, credentials, zappyToken, zappyUrl } = req.body;
    // Validação dos campos obrigatórios
    if (!accountId || type !== 'ZAPPY' || !credentials || !credentials.client_id || !credentials.client_secret || !zappyToken || !zappyUrl ||
        String(accountId).trim() === '' || String(credentials.client_id).trim() === '' || String(credentials.client_secret).trim() === '' || String(zappyToken).trim() === '' || String(zappyUrl).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: accountId, type (deve ser ZAPPY), credentials (client_id, client_secret), zappyToken, zappyUrl.' });
    }
    // Verifica se o accountId existe
    const account = await prisma_1.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
        return res.status(404).json({ error: 'accountId não encontrado. Crie a conta antes de integrar.' });
    }
    try {
        const id = (0, uuidv7_1.uuidv7)();
        // Salva todos os dados no campo credentials (incluindo zappyToken e zappyUrl)
        const fullCredentials = {
            ...credentials,
            zappyToken,
            zappyUrl
        };
        const result = await prisma_1.prisma.integration.create({
            data: {
                id,
                accountId,
                type: 'ZAPPY',
                credentials: fullCredentials
            }
        });
        res.status(201).json({ success: true, result });
    }
    catch (err) {
        console.error('Erro ao criar integração:', err);
        res.status(500).json({ error: err.message });
    }
}
// Listar integrações
async function listIntegrations(req, res) {
    try {
        const integrations = await prisma_1.prisma.integration.findMany();
        res.json(integrations);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Criar regra de notificação
async function createNotificationRule(req, res) {
    const { integrationId, accountId, active, event, message, adjustments } = req.body;
    if (!integrationId || !accountId || typeof active !== 'boolean' || typeof event !== 'string' || !message ||
        String(integrationId).trim() === '' || String(accountId).trim() === '' || String(message).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId (string), accountId (string), active (boolean), event (number), message (string).' });
    }
    // Validação dos placeholders da mensagem
    const invalidVars = (0, interpolateMessage_1.validateDynamicVariables)(message);
    if (invalidVars.length > 0) {
        return res.status(400).json({
            error: 'Mensagem contém variáveis dinâmicas inválidas.',
            invalidVariables: invalidVars
        });
    }
    try {
        const id = (0, uuidv7_1.uuidv7)();
        const result = await prisma_1.prisma.notificationRule.create({
            data: {
                id,
                integrationId,
                accountId,
                active,
                event,
                message,
                adjustments: adjustments || null,
                variables: {}
            }
        });
        res.status(201).json({ success: true, result });
    }
    catch (err) {
        console.error('Erro ao criar regra de notificação:', err);
        res.status(500).json({ error: err.message });
    }
}
// Listar regras de notificação
async function listNotificationRules(req, res) {
    try {
        const rules = await prisma_1.prisma.notificationRule.findMany();
        res.json(rules);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// Novo handler para receber webhooks da Kiwify (sem dependência de regra no banco)
async function kiwifyWebhookHandler(req, res) {
    const eventType = req.body?.event || req.body?.webhook_event_type;
    const accountId = req.body?.account_id;
    const payload = req.body;
    if (!eventType || !accountId) {
        return res.status(400).json({ error: 'Payload inválido.' });
    }
    const { payloads, template } = (0, kiwifyPayloads_1.getKiwifyPayloadAndTemplate)(eventType, payload);
    const message = (0, interpolateMessage_1.interpolateMessage)(template, payloads);
    let statusEnvio = 'success';
    let errorMessage = null;
    try {
        await (0, sendMessageToClient_1.sendMessageToClient)(accountId, message);
    }
    catch (err) {
        statusEnvio = 'error';
        errorMessage = err?.message || String(err);
    }
    // Salva log do disparo
    await prisma_1.prisma.notificationLog.create({
        data: {
            accountId,
            eventType,
            nomeCliente: payloads.nomeCompleto || payloads.primeiroNome || '',
            numeroCliente: payloads.telefone || payloads.numeroCliente || '',
            statusEnvio,
            errorMessage
        }
    });
    res.status(200).json({ success: true, statusEnvio, errorMessage });
}
