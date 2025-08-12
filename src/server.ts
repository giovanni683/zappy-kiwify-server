
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import bodyParser from 'body-parser';
import webhookRoutes from './routes/webhookRoutes';
import notificationRoutes from './routes/notificationRoutes';
import * as notificationService from './services/notificationService';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

notificationService.setSocketIo(io);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/api/webhook', webhookRoutes);
app.use('/api/notifications', notificationRoutes);

io.on('connection', (socket: Socket) => {
  console.log('Cliente conectado:', socket.id);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
