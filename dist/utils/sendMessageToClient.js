"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToClient = sendMessageToClient;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../config/prisma");
const channelKey_1 = require("../types/channelKey");
async function sendMessageToClient(accountId, message) {
    const integration = await prisma_1.prisma.integration.findFirst({
        where: { accountId, type: String(channelKey_1.ChannelKey.ZAPPY) }
    });
    if (!integration)
        throw new Error('Integração Zappy não encontrada.');
    const { zappyToken, zappyUrl } = integration.credentials;
    await axios_1.default.post(`${zappyUrl}/send-message`, { message }, {
        headers: {
            Authorization: `Bearer ${zappyToken}`,
            'Content-Type': 'application/json'
        }
    });
}
