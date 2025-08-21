"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateMessage = interpolateMessage;
/**
 * Substitui os placeholders do template pelas variáveis fornecidas.
 * Exemplo: "Olá {{primeiroNome}}" => "Olá João"
 */
function interpolateMessage(template, variables) {
    return template.replace(/{{(\w+)}}/g, (match, key) => {
        const value = variables[key];
        return value !== undefined ? String(value) : match;
    });
}
