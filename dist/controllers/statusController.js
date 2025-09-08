"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamicVariables = exports.getSupportedEvents = exports.getLogs = exports.getStats = exports.healthCheck = void 0;
exports.getLogsFunction = getLogsFunction;
const healthCheck = (req, res) => {
    res.status(200).json({ status: 'ok' });
};
exports.healthCheck = healthCheck;
const getStats = (req, res) => {
    // Exemplo: retornar estatísticas estáticas
    res.json({ notificationsSent: 123, integrationsActive: 4 });
};
exports.getStats = getStats;
const getLogs = (req, res) => {
    // Exemplo: retornar logs estáticos
    res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
};
exports.getLogs = getLogs;
// Função alternativa para logs (caso algum endpoint use a versão function)
function getLogsFunction(req, res) {
    res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
}
const getSupportedEvents = (req, res) => {
    const events = [
        'boleto_gerado',
        'pix_gerado',
        'compra_aprovada',
        'compra_recusada',
        'carrinho_abandonado',
        'subscription_late',
        'subscription_canceled',
        'compra_reembolsada',
        'chargeback',
        'subscription_renewed'
    ];
    res.json({ events });
};
exports.getSupportedEvents = getSupportedEvents;
const getDynamicVariables = (req, res) => {
    const variables = [
        'nomeCompleto',
        'primeiroNome',
        'urlBoleto',
        'codigoBarrasBoleto',
        'dataExpiracaoBoleto',
        'statusPagamento',
        'codigoPix',
        'dataExpiracaoPix'
    ];
    res.json({ variables });
};
exports.getDynamicVariables = getDynamicVariables;
