"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listZappyConnections = listZappyConnections;
exports.listZappySectors = listZappySectors;
const zdk_1 = require("zdk");
const sendMessage_1 = require("./sendMessage");
async function listZappyConnections(accountId) {
    const { zappyUrl, zappyToken } = await (0, sendMessage_1.getZappyCredentials)(accountId);
    if (!zappyUrl || !zappyToken)
        throw new Error('Credenciais Zappy não encontradas para a conta.');
    const zdk = new zdk_1.Zdk(zappyUrl, zappyToken);
    if (typeof zdk.connections?.list !== 'function')
        return [];
    const result = await zdk.connections.list();
    if (result && typeof result === 'object' && 'error' in result) {
        throw new Error('Ocorreu um erro na sua autenticação, verifique se seus dados estão corretos e tente novamente');
    }
    if (result && Array.isArray(result.connections)) {
        return result.connections.map(conn => ({
            id: conn.id,
            name: conn.name,
            phone: conn.number,
            status: conn.status
        }));
    }
    return [];
}
async function listZappySectors(accountId) {
    const { zappyUrl, zappyToken } = await (0, sendMessage_1.getZappyCredentials)(accountId);
    if (!zappyUrl || !zappyToken)
        throw new Error('Credenciais Zappy não encontradas para a conta.');
    const zdk = new zdk_1.Zdk(zappyUrl, zappyToken);
    if (typeof zdk.queues?.list === 'function') {
        return await zdk.queues.list();
    }
    throw new Error('Método de listagem de setores (queues) não disponível no SDK Zappy.');
}
