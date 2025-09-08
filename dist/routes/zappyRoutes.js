"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integrationController_1 = require("../controllers/integrationController");
const updateNotificationRuleController_1 = require("../controllers/updateNotificationRuleController");
const zappyConnections_1 = require("../services/zappyConnections");
const router = (0, express_1.Router)();
router.post('/accounts', integrationController_1.createAccount);
router.get('/accounts', integrationController_1.listAccounts);
router.post('/integrations', integrationController_1.createIntegration);
router.get('/integrations', integrationController_1.listIntegrations);
router.post('/notification-rules', integrationController_1.createNotificationRuleController);
router.get('/notification-rules', integrationController_1.getNotificationRulesController);
router.get('/notification-rules/:id', integrationController_1.getNotificationRuleByIdController);
router.patch('/notification-rules/:id', updateNotificationRuleController_1.updateNotificationRuleController);
router.post('/webhook/kiwify', integrationController_1.kiwifyWebhookHandler);
router.get('/connections', integrationController_1.listConnectionsController);
router.get('/connections/active', integrationController_1.listZappyConnectionsController);
router.get('/queues', async (req, res) => {
    try {
        const queues = await (0, zappyConnections_1.listZappySectors)(req.query.accountId);
        res.status(200).json(queues);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
