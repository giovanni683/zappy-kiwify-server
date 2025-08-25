/**
 * Valida se todos os placeholders do template existem em DynamicVariables.
 * Retorna um array com os nomes dos placeholders inválidos.
 */
export function validateDynamicVariables(template: string): string[] {
  const validKeys = [
    'nomeCompleto', 'primeiroNome',
    'urlBoleto', 'codigoBarrasBoleto', 'dataExpiracaoBoleto',
    'statusPagamento', 'codigoPix', 'dataExpiracaoPix'
  ];
  const matches = template.match(/{{(\w+)}}/g) || [];
  const invalids: string[] = [];
  matches.forEach((match) => {
    const key = match.replace(/{{|}}/g, '');
    if (!validKeys.includes(key)) {
      invalids.push(key);
    }
  });
  return invalids;
}
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
