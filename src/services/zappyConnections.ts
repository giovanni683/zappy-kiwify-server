import { Zdk } from 'zdk';
import { getZappyCredentials } from './sendMessage';
import { prisma } from '../config/prisma';

export async function listZappyConnections(accountId?: string) {
  const start = Date.now();
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) throw new Error('Credenciais Zappy não encontradas para a conta.');
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.connections?.list !== 'function') return [];
  const result = await zdk.connections.list();
  console.log('Resposta bruta do zdk.connections.list:', result);
  const elapsed = Date.now() - start;
  console.log(`[PERF] listZappyConnections demorou ${elapsed}ms`);
  if (!result || typeof result !== 'object') {
    throw new Error('Resposta inválida da API Zappy (connections.list)');
  }
  if ('error' in result) {
    throw new Error('Ocorreu um erro na sua autenticação, verifique se seus dados estão corretos e tente novamente');
  }
  if (Array.isArray(result.connections)) {
    return result.connections.map(conn => ({
      id: conn.id,
      name: conn.name,
      phone: conn.number,
      status: conn.status
    }));
  }
  return [];
}

// Sincroniza setores do SDK com o banco antes de retornar
export async function listZappySectors(accountId?: string) {
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) throw new Error('Credenciais Zappy não encontradas para a conta.');
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.queues?.list === 'function') {
    const apiSectors = await zdk.queues.list();
    let sectorNames: string[] = [];
    if (apiSectors && typeof apiSectors === 'object' && Array.isArray((apiSectors as any).queues)) {
      sectorNames = (apiSectors as any).queues.map((q: any) => q.name);
    } else if (Array.isArray(apiSectors)) {
      sectorNames = apiSectors.map((q: any) => q.name);
    }
    // Cria setores que não existem no banco
    for (const name of sectorNames) {
      const exists = await prisma.sector.findFirst({ where: { name } });
      if (!exists) {
        await prisma.sector.create({ data: { name } });
        console.log(`[SYNC] Setor criado automaticamente: ${name}`);
      }
    }
    // Busca setores sincronizados do banco
    const dbSectors = await prisma.sector.findMany();
    const result = dbSectors
      .filter(dbSector => sectorNames.includes(dbSector.name))
      .map(dbSector => ({ id: dbSector.id, name: dbSector.name }));
    return result;
  }
  throw new Error('Método de listagem de setores (queues) não disponível no SDK Zappy.');
}
