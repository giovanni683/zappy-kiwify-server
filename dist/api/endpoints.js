"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATIONS = exports.WEBHOOK = exports.NOTIFICATION_RULES = exports.INTEGRATIONS = exports.ACCOUNTS = exports.API_BASE = void 0;
exports.API_BASE = process.env.NEXT_PUBLIC_API_URL;
exports.ACCOUNTS = `${exports.API_BASE}/api/zappy/accounts`;
exports.INTEGRATIONS = `${exports.API_BASE}/api/zappy/integrations`;
exports.NOTIFICATION_RULES = `${exports.API_BASE}/api/zappy/notification-rules`;
exports.WEBHOOK = `${exports.API_BASE}/api/webhook`;
exports.NOTIFICATIONS = `${exports.API_BASE}/api/notifications`;
