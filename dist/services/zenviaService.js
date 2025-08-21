"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendZenviaNotification = sendZenviaNotification;
const interpolateMessage_1 = require("../utils/interpolateMessage");
const zdk_1 = require("zdk");
const zdk = new zdk_1.Zdk();
async function sendZenviaNotification(notification) {
    try {
        const templates = {
            boleto_gerado: 'Olá {{primeiroNome}}, seu boleto está disponível em {{urlBoleto}}.',
            pix_gerado: 'Olá {{primeiroNome}}, seu PIX foi gerado! Código: {{codigoPix}}.',
            compra_aprovada: 'Parabéns {{primeiroNome}}, sua compra foi aprovada!',
            compra_recusada: 'Olá {{primeiroNome}}, infelizmente sua compra foi recusada.',
            carrinho_abandonado: 'Olá {{primeiroNome}}, você deixou produtos no carrinho! Aproveite antes que acabe.',
            subscription_late: 'Olá {{primeiroNome}}, sua assinatura está atrasada. Regularize para continuar aproveitando.',
            subscription_canceled: 'Olá {{primeiroNome}}, sua assinatura foi cancelada.',
            compra_reembolsada: 'Olá {{primeiroNome}}, sua compra foi reembolsada.',
            chargeback: 'Olá {{primeiroNome}}, ocorreu um chargeback em sua compra.',
            subscription_renewed: 'Olá {{primeiroNome}}, sua assinatura foi renovada com sucesso!'
        };
        const template = templates[notification.eventType] || 'Nova notificação do Kiwify!';
        const variables = notification.variables || {};
        const message = (0, interpolateMessage_1.interpolateMessage)(template, variables);
        let zappyUrl = notification.zappyUrl;
        let zappyToken = notification.zappyToken;
        if (!zappyUrl || !zappyToken) {
            const { pool } = require('../db');
            const [rows] = await pool.query('SELECT credentials FROM integrations WHERE accountId = ? AND type = 1 LIMIT 1', [notification.account_id]);
            if (rows && rows.length > 0) {
                try {
                    const creds = typeof rows[0].credentials === 'string' ? JSON.parse(rows[0].credentials) : rows[0].credentials;
                    zappyUrl = zappyUrl || creds.url;
                    zappyToken = zappyToken || creds.token;
                }
                catch (e) {
                    console.error('Erro ao parsear credenciais Zappy:', e);
                }
            }
            zappyUrl = zappyUrl || process.env.ZAPPY_URL;
            zappyToken = zappyToken || process.env.ZAPPY_TOKEN;
        }
        const zdk = new zdk_1.Zdk(zappyUrl, zappyToken);
        const response = await zdk.messages.send(notification.phone || notification.to, {
            body: message,
            connectionFrom: notification.connectionFrom || 'default',
            ticketStrategy: 'create'
        });
        return response;
    }
    catch (error) {
        console.error('Erro ao enviar mensagem Zappy:', error);
        throw error;
    }
}
