"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.post('/', webhookController_1.handleWebhook);
router.post('/kiwify/:accountId', webhookController_1.handleKiwifyWebhook);
router.post('/kiwify', webhookController_1.handleKiwifyWebhook);
exports.default = router;
