import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import webhookRoutes from './routes/webhookRoutes';
import zappyRoutes from './routes/zappyRoutes';
import systemRoutes from './routes/systemRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();
const server = http.createServer(app);

app.use(cors());
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

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
