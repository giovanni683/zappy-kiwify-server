"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const notificationService = __importStar(require("./services/notificationService"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
});
notificationService.setSocketIo(io);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
const zappyRoutes_1 = __importDefault(require("./routes/zappyRoutes"));
app.use('/api/zappy', zappyRoutes_1.default);
app.use('/api/webhook', webhookRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
