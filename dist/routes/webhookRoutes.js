"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.post('/', webhookController_1.handleWebhook);
// Rota específica para o webhook do Kiwify
const webhookController_2 = require("../controllers/webhookController");
router.post('/kiwify', webhookController_2.handleKiwifyWebhook);
exports.default = router;
