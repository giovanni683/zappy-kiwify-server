"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zappyController_1 = require("../controllers/zappyController");
const router = (0, express_1.Router)();
// Rotas para Account
router.post('/accounts', zappyController_1.createAccount);
router.get('/accounts', zappyController_1.listAccounts);
// Rotas para Integration
router.post('/integrations', zappyController_1.createIntegration);
router.get('/integrations', zappyController_1.listIntegrations);
// Rotas para NotificationRule
router.post('/notification-rules', zappyController_1.createNotificationRule);
router.get('/notification-rules', zappyController_1.listNotificationRules);
exports.default = router;
