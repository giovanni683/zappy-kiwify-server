"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDynamicVariables = validateDynamicVariables;
exports.interpolateMessage = interpolateMessage;
/**
 * Valida se todos os placeholders do template existem em DynamicVariables.
 * Retorna um array com os nomes dos placeholders inválidos.
 */
function validateDynamicVariables(template) {
    const validKeys = [
        'nomeCompleto', 'primeiroNome',
        'urlBoleto', 'codigoBarrasBoleto', 'dataExpiracaoBoleto',
        'statusPagamento', 'codigoPix', 'dataExpiracaoPix',
        // Adicione aqui novas variáveis se necessário
        'checkoutLink', 'email', 'telefone', 'nomeProduto', 'idProduto', 'statusCarrinho', 'pais', 'cnpj', 'dataCriacao', 'lojaId',
        'motivoRecusa', 'metodoPagamento', 'tipoCartao', 'ultimosDigitosCartao', 'valorPedido', 'dataAprovacao', 'cpf', 'planoAssinatura', 'urlAcesso',
        'dataReembolso', 'statusAssinatura', 'dataProximaCobranca'
    ];
    const matches = template.match(/{{(\w+)}}/g) || [];
    const invalids = [];
    matches.forEach((match) => {
        const key = match.replace(/{{|}}/g, '');
        if (!validKeys.includes(key)) {
            invalids.push(key);
        }
    });
    return invalids;
}
/**
 * Substitui os placeholders do template pelas variáveis fornecidas.
 * Exemplo: "Olá {{primeiroNome}}" => "Olá João"
 */
function interpolateMessage(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
        const value = variables[key];
        return value !== undefined && value !== null ? String(value) : '';
    });
}
