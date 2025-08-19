// Utilitário para interpolar variáveis dinâmicas em templates de mensagem
import { DynamicVariables } from '../models/zappyTypes';

/**
 * Substitui os placeholders do template pelas variáveis fornecidas.
 * Exemplo: "Olá {{primeiroNome}}" => "Olá João"
 */
export function interpolateMessage(template: string, variables: DynamicVariables): string {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    const value = variables[key as keyof DynamicVariables];
    return value !== undefined ? String(value) : match;
  });
}
