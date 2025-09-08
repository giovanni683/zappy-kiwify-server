"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const webhookRoutes_1 = __importDefault(require("./routes/webhookRoutes"));
const zappyRoutes_1 = __importDefault(require("./routes/zappyRoutes"));
const systemRoutes_1 = __importDefault(require("./routes/systemRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: [
        /^https?:\/\/([a-z0-9]+\.)?localhost(:\d+)?$/,
        /^https?:\/\/([a-z0-9\-]+\.)?innovtech\.solutions(:\d+)?$/,
    ],
}));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/api/zappy', zappyRoutes_1.default);
app.use('/api/webhook', webhookRoutes_1.default);
app.use('/api/zappy', systemRoutes_1.default);
app.use('/api/zappy', settingsRoutes_1.default);
// Rota para servir a página de integração Kiwify
app.get('/api/integration/kiwify-ui', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/kiwify.html'));
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
