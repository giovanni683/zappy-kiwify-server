
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import bodyParser from 'body-parser';
import path from 'path';
import webhookRoutes from './routes/webhookRoutes';
import notificationRoutes from './routes/notificationRoutes';
import * as notificationService from './services/notificationService';
import logRoutes from './routes/logRoutes';
import healthRoutes from './routes/healthRoutes';
import statsRoutes from './routes/statsRoutes';
import settingsRoutes from './routes/settingsRoutes';



const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

notificationService.setSocketIo(io);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

import zappyRoutes from './routes/zappyRoutes';
app.use('/api/zappy', zappyRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/zappy', logRoutes);
app.use('/api/zappy', healthRoutes);
app.use('/api/zappy', statsRoutes);
app.use('/api/zappy', settingsRoutes);

// Rota para servir a página de integração Kiwify
app.get('/api/integration/kiwify-ui', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/kiwify.html'));
});

io.on('connection', (socket: Socket) => {
  console.log('Cliente conectado:', socket.id);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
