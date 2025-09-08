"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZappyCredentials = getZappyCredentials;
exports.sendMessage = sendMessage;
exports.sendMessageDebug = sendMessageDebug;
const prisma_1 = require("../config/prisma");
const interpolateMessage_1 = require("../utils/interpolateMessage");
const zdk_1 = require("zdk");
const notificationTemplates_1 = __importDefault(require("../utils/notificationTemplates"));
// Busca credenciais Zappy para um accountId
async function getZappyCredentials(accountId) {
    if (accountId) {
        const integration = await prisma_1.prisma.integration.findFirst({
            where: { accountId, type: 'ZAPPY' }
        });
        if (integration && integration.credentials) {
            const { zappyUrl, zappyToken } = integration.credentials;
            if (zappyUrl && zappyToken)
                return { zappyUrl, zappyToken };
        }
    }
    return {
        zappyUrl: process.env.ZAPPY_URL || 'https://api.zappy.chat',
        zappyToken: process.env.ZAPPY_TOKEN || ''
    };
}
// Função utilitária para validar número de telefone (precisa ter DDD/DDI e formato internacional)
function isValidPhoneNumber(phone) {
    // Aceita formato internacional: +[código país][DDD][número], ex: +5511999999999
    return /^\+\d{12,15}$/.test(phone);
}
// Envia mensagem usando credenciais Zappy da conta
async function sendMessage(notification) {
    const template = notificationTemplates_1.default[notification.eventType] || notificationTemplates_1.default.default;
    const variables = notification.variables || {};
    // Mapeia variáveis do payload para os templates
    const mappedVariables = {
        ...notification,
        ...variables,
        primeiroNome: variables.primeiroNome || notification.Customer?.first_name || notification.customer?.first_name || notification.Customer?.full_name || notification.customer?.full_name || notification.name,
        urlBoleto: variables.urlBoleto || notification.boleto_URL || notification.urlBoleto,
        codigoBoleto: variables.codigoBoleto || notification.boleto_barcode || notification.codigoBoleto,
        statusPedido: variables.statusPedido || notification.order_status || notification.statusPedido,
        codigoPix: variables.codigoPix || notification.pix_code || notification.codigoPix,
        nome: notification.nome || notification.Customer?.full_name || notification.customer?.full_name || notification.name,
        telefone: notification.telefone || notification.Customer?.mobile || notification.customer?.mobile || notification.phone
    };
    const message = (0, interpolateMessage_1.interpolateMessage)(template, mappedVariables);
    // Captura o número de telefone de diferentes fontes e variações
    let phone = notification.telefone || notification.phone || notification.to;
    // Garante que Customer.mobile sobrescreva qualquer valor anterior
    if (notification.Customer && notification.Customer.mobile) {
        phone = notification.Customer.mobile;
    }
    else if (notification.customer && notification.customer.mobile) {
        phone = notification.customer.mobile;
    }
    // Normaliza número para formato internacional
    if (phone && !phone.startsWith('+')) {
        // Se já começa com 55, só prefixa +
        if (phone.startsWith('55')) {
            phone = '+' + phone;
        }
        else {
            // Se não, prefixa +55
            phone = '+55' + phone.replace(/^0+/, '');
        }
    }
    if (!phone || !isValidPhoneNumber(phone)) {
        return {
            success: false,
            error: 'Número de telefone inválido. Certifique-se de que possui DDD/DDI e está no formato internacional (+5511999999999).',
            feedback: {
                zappyConnection: false,
                usedDefaultConnection: false,
                transferredToSector: notification.sector || null
            }
        };
    }
    // Busca credenciais Zappy corretas
    const { zappyUrl, zappyToken } = await getZappyCredentials(notification.accountId);
    // Instancia Zdk com credenciais da conta
    // Ajuste conforme documentação do Zdk: se espera string, passe apenas o token
    const zdk = new zdk_1.Zdk(zappyUrl, zappyToken);
    const hasZappyConnection = !!notification.connectionFrom;
    const usedDefaultConnection = !notification.connectionFrom;
    let transferredToSector = notification.sector || null;
    // Se notificationRuleId for informado, busca a regra e setor associado
    if (notification.notificationRuleId && !notification.sector) {
        const rule = await prisma_1.prisma.notificationRule.findUnique({
            where: { id: notification.notificationRuleId },
            select: { sector: { select: { name: true } } }
        });
        if (rule && rule.sector && rule.sector.name) {
            notification.sector = rule.sector.name;
        }
    }
    // Remove o + do início antes de enviar para o Zappy
    const phoneToSend = phone.startsWith('+') ? phone.slice(1) : phone;
    const response = await zdk.messages.send(phoneToSend, {
        body: message,
        connectionFrom: notification.connectionFrom ? Number(notification.connectionFrom) : 0,
        ticketStrategy: 'create'
    });
    return {
        success: true,
        response,
        feedback: {
            zappyConnection: hasZappyConnection,
            usedDefaultConnection,
            transferredToSector
        }
    };
}
// Envia mensagem usando credenciais Zappy da conta (exemplo simplificado para depuração)
async function sendMessageDebug(data) {
    return { success: true, info: 'Envio simulado. Ajuste conforme necessário.' };
}
