// Arquivo principal do backend
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
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

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
