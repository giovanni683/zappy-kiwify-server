"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleKiwifyWebhook = handleKiwifyWebhook;
exports.processKiwifyEvent = processKiwifyEvent;
const sendMessage_1 = require("./sendMessage");
function formatPhoneNumber(phone) {
    if (!phone)
        return '';
    const cleaned = phone.replace(/^"+/, '').replace(/\D/g, '');
    return cleaned.startsWith('55') ? `+${cleaned}` : `+55${cleaned.replace(/^0+/, '')}`;
}
async function handleKiwifyWebhook(payload) {
    const { webhook_event_type, account_id, accountId, accountID, accountid, Customer = {}, boleto_URL, boleto_barcode, pix_code, order_status, valor_boleto, name, phone } = payload;
    const eventType = webhook_event_type;
    const accId = account_id || accountId || accountID || accountid;
    const mobile = formatPhoneNumber(Customer.mobile || phone);
    if (!accId || typeof accId !== 'string' || accId.trim() === '') {
        throw new Error('account_id é obrigatório, deve ser string e não pode ser vazio.');
    }
    const notification = {
        ...payload,
        accountId: accId,
        eventType,
        phone: mobile,
        variables: {
            primeiroNome: Customer.first_name || Customer.full_name || name,
            urlBoleto: boleto_URL,
            codigoBoleto: boleto_barcode,
            codigoPix: pix_code,
            statusPedido: order_status,
            valorBoleto: valor_boleto,
            pixCode: pix_code
        },
        Customer: {
            ...Customer,
            mobile
        }
    };
    await (0, sendMessage_1.sendMessage)(notification);
}
async function processKiwifyEvent(payload) {
    const { webhook_event_type: eventType, boleto_URL, Customer, phone, pix_code } = payload;
    if (!eventType)
        throw new Error('Evento não informado.');
    switch (eventType) {
        case 'boleto_gerado':
            if (!boleto_URL)
                throw new Error('URL do boleto obrigatória.');
            if (!Customer?.mobile && !phone)
                throw new Error('Telefone obrigatório.');
            break;
        case 'pix_gerado':
            if (!pix_code)
                throw new Error('Código PIX obrigatório.');
            break;
        case 'compra_aprovada':
        case 'compra_recusada':
        case 'carrinho_abandonado':
        case 'compra_reembolsada':
        case 'chargeback':
        case 'subscription_canceled':
        case 'subscription_late':
        case 'subscription_renewed':
            break;
        default:
            throw new Error('Evento não suportado.');
    }
    await handleKiwifyWebhook(payload);
}
