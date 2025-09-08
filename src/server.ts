import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import webhookRoutes from './routes/webhookRoutes';
import zappyRoutes from './routes/zappyRoutes';
import systemRoutes from './routes/systemRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { getZappyCredentials } from './services/sendMessage';
import { Zdk } from 'zdk';
import { prisma } from './config/prisma';

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: [
        /^https?:\/\/([a-z0-9]+\.)?localhost(:\d+)?$/,
        /^https?:\/\/([a-z0-9\-]+\.)?innovtech\.solutions(:\d+)?$/,
    ],
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/zappy', zappyRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/zappy', systemRoutes);
app.use('/api/zappy', settingsRoutes);

// Rota para servir a página de integração Kiwify
app.get('/api/integration/kiwify-ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/kiwify.html'));
});

// Sincroniza setores do Zappy ao iniciar o servidor
async function syncSectorsOnStartup() {
  const accountId = process.env.DEFAULT_ACCOUNT_ID;
  if (!accountId) {
    console.warn('DEFAULT_ACCOUNT_ID não definido. Pulei sincronização de setores.');
    return;
  }
  const { zappyUrl, zappyToken } = await getZappyCredentials(accountId);
  if (!zappyUrl || !zappyToken) {
    console.warn('Credenciais Zappy não encontradas para a conta padrão. Pulei sincronização de setores.');
    return;
  }
  const zdk = new Zdk(zappyUrl, zappyToken);
  if (typeof zdk.queues?.list !== 'function') {
    console.warn('Método de listagem de setores (queues) não disponível no SDK Zappy. Pulei sincronização.');
    return;
  }
  const apiSectors = await zdk.queues.list();
  let sectorNames: string[] = [];
  if (Array.isArray(apiSectors)) {
    sectorNames = apiSectors.map((q: any) => q.name);
  } else if (apiSectors && typeof apiSectors === 'object' && Array.isArray((apiSectors as any).queues)) {
    sectorNames = (apiSectors as any).queues.map((q: any) => q.name);
  }
  for (const name of sectorNames) {
    const exists = await prisma.sector.findFirst({ where: { name } });
    if (!exists) {
      await prisma.sector.create({ data: { name } });
      console.log(`[SYNC] Setor criado automaticamente: ${name}`);
    }
  }
  console.log('[SYNC] Sincronização de setores concluída.');
}

syncSectorsOnStartup();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
