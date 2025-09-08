import { Zdk } from 'zdk';
import { prisma } from '../config/prisma';
import { getZappyCredentials } from '../services/sendMessage';

async function main() {
  const accountId = process.argv[2];
  if (!accountId) {
    console.error('Uso: ts-node src/scripts/syncSectorsFromZappy.ts <accountId>');
    process.exit(1);
  }
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) {
    console.error('Credenciais Zappy não encontradas para a conta.');
    process.exit(1);
  }
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.queues?.list !== 'function') {
    console.error('Método de listagem de setores (queues) não disponível no SDK Zappy.');
    process.exit(1);
  }
  const apiSectors = await zdk.queues.list();
  let sectorNames: string[] = [];
  if (apiSectors && typeof apiSectors === 'object' && Array.isArray((apiSectors as any).queues)) {
    sectorNames = (apiSectors as any).queues.map((q: any) => q.name);
  } else if (Array.isArray(apiSectors)) {
    sectorNames = apiSectors.map((q: any) => q.name);
  } else {
    console.error('Resposta inesperada do SDK Zappy. Não foi possível obter a lista de setores.');
    process.exit(1);
  }
  for (const name of sectorNames) {
    const exists = await prisma.sector.findFirst({ where: { name } });
    if (!exists) {
      await prisma.sector.create({ data: { name } });
      console.log(`Setor criado: ${name}`);
    } else {
      console.log(`Setor já existe: ${name}`);
    }
  }
  console.log('Sincronização concluída.');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
