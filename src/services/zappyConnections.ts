import { Zdk } from 'zdk';
import { getZappyCredentials } from './sendMessage';

// Lista conexões ativas do Zappy via SDK
export async function listZappyConnections(accountId?: string) {
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) {
    throw new Error('Credenciais Zappy não encontradas para a conta.');
  }
  // Instancia Zdk conforme padrão: url, token
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.connections?.list === 'function') {
    const result = await zdk.connections.list();
    console.log('Retorno bruto do SDK:', result); // DEBUG
    if (result && typeof result === 'object' && 'error' in result) {
      throw new Error('Ocorreu um erro na sua autenticação, verifique se seus dados estão corretos e tente novamente');
    }
    if (result && Array.isArray(result.connections)) {
      const connections = result.connections.map(conn => ({
        id: conn.id,
        name: conn.name,
        phone: conn.number,
        status: conn.status
      }));
      console.log('Conexões mapeadas:', connections); // DEBUG
      return connections;
    }
    return [];
  }
  return [];
}

// Lista setores (filas) do Zappy via SDK
export async function listZappySectors(accountId?: string) {
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) {
    throw new Error('Credenciais Zappy não encontradas para a conta.');
  }
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.queues?.list === 'function') {
    return await zdk.queues.list();
  }
  throw new Error('Método de listagem de setores (queues) não disponível no SDK Zappy.');
}
