import { PrismaClient } from '@prisma/client';
import { Account, Integration, NotificationRule, IntegrationType } from '../models/zappyTypes';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status } = req.body;
  // Validação dos dados
  if (!name || typeof name !== 'string') {
    console.error('Erro de validação: nome inválido');
    return res.status(400).json({ error: 'Nome é obrigatório e deve ser string.' });
  }
  if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
    console.error('Erro de validação: status inválido');
    return res.status(400).json({ error: 'Status deve ser 0 (inativa) ou 1 (ativa).' });
  }
  try {
    const account = await prisma.account.create({
      data: { name, status }
    });
    console.log(`Conta criada: ${account.id}`);
    res.status(201).json({ success: true, id: account.id });
  } catch (err: any) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar contas
export async function listAccounts(req: Request, res: Response) {
  try {
    const accounts = await prisma.account.findMany();
    console.log(`Listando contas: ${accounts.length} encontradas.`);
    res.json(accounts);
  } catch (err: any) {
    console.error('Erro ao listar contas:', err);
    res.status(500).json({ error: err.message });
  }
}

// Criar integração
export async function createIntegration(req: Request, res: Response) {
  // Validação dos headers obrigatórios
  const authHeader = req.headers['authorization'];
  const accountHeader = req.headers['x-kiwify-account-id'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Authorization header (Bearer token) obrigatório.' });
  }
  if (!accountHeader || typeof accountHeader !== 'string') {
    return res.status(401).json({ error: 'x-kiwify-account-id header obrigatório.' });
  }
  const { accountId, type, credentials } = req.body;
  // Validação dos dados
  if (!accountId || typeof accountId !== 'string') {
    console.error('Erro de validação: accountId inválido');
    return res.status(400).json({ error: 'accountId é obrigatório e deve ser string.' });
  }
  if (typeof type !== 'number' || (type !== 1 && type !== 2)) {
    console.error('Erro de validação: type inválido');
    return res.status(400).json({ error: 'type deve ser 1 (ZAPPY) ou 2 (KIWIFY).' });
  }
  if (!credentials || typeof credentials !== 'object') {
    console.error('Erro de validação: credentials inválido');
    return res.status(400).json({ error: 'credentials é obrigatório e deve ser objeto.' });
  }
  try {
    const integration = await prisma.integration.create({
      data: { accountId, type, credentials }
    });
    res.status(201).json({ success: true, id: integration.id });
  } catch (err: any) {
    console.error('Erro ao criar integração:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar integrações
export async function listIntegrations(req: Request, res: Response) {
  // Validação dos headers obrigatórios
  const authHeader = req.headers['authorization'];
  const accountHeader = req.headers['x-kiwify-account-id'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Authorization header (Bearer token) obrigatório.' });
  }
  if (!accountHeader || typeof accountHeader !== 'string') {
    return res.status(401).json({ error: 'x-kiwify-account-id header obrigatório.' });
  }
  try {
    const integrations = await prisma.integration.findMany();
    console.log(`Listando integrações: ${integrations.length} encontradas.`);
    res.json(integrations);
  } catch (err: any) {
    console.error('Erro ao listar integrações:', err);
    res.status(500).json({ error: err.message });
  }
}

// Criar regra de notificação
export async function createNotificationRule(req: Request, res: Response) {
  // Validação dos headers obrigatórios
  const authHeader = req.headers['authorization'];
  const accountHeader = req.headers['x-kiwify-account-id'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Authorization header (Bearer token) obrigatório.' });
  }
  if (!accountHeader || typeof accountHeader !== 'string') {
    return res.status(401).json({ error: 'x-kiwify-account-id header obrigatório.' });
  }
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  // Validação dos dados
  if (!integrationId || typeof integrationId !== 'string') {
    console.error('Erro de validação: integrationId inválido');
    return res.status(400).json({ error: 'integrationId é obrigatório e deve ser string.' });
  }
  if (!accountId || typeof accountId !== 'string') {
    console.error('Erro de validação: accountId inválido');
    return res.status(400).json({ error: 'accountId é obrigatório e deve ser string.' });
  }
  if (typeof active !== 'boolean') {
    console.error('Erro de validação: active inválido');
    return res.status(400).json({ error: 'active é obrigatório e deve ser boolean.' });
  }
  if (typeof event !== 'number') {
    console.error('Erro de validação: event inválido');
    return res.status(400).json({ error: 'event é obrigatório e deve ser number.' });
  }
  if (!message || typeof message !== 'string') {
    console.error('Erro de validação: message inválido');
    return res.status(400).json({ error: 'message é obrigatório e deve ser string.' });
  }
  if (adjustments && typeof adjustments !== 'object') {
    console.error('Erro de validação: adjustments inválido');
    return res.status(400).json({ error: 'adjustments deve ser objeto se fornecido.' });
  }
  try {
    const notificationRule = await prisma.notificationRule.create({
      data: { integrationId, accountId, active, event, message }
    });
    res.status(201).json({ success: true, id: notificationRule.id });
  } catch (err: any) {
    console.error('Erro ao criar regra de notificação:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function listNotificationRules(req: Request, res: Response) {
  // Validação dos headers obrigatórios
  const authHeader = req.headers['authorization'];
  const accountHeader = req.headers['x-kiwify-account-id'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Authorization header (Bearer token) obrigatório.' });
  }
  if (!accountHeader || typeof accountHeader !== 'string') {
    return res.status(401).json({ error: 'x-kiwify-account-id header obrigatório.' });
  }
  try {
    const notificationRules = await prisma.notificationRule.findMany();
    console.log(`Listando regras de notificação: ${notificationRules.length} encontradas.`);
    res.json(notificationRules);
  } catch (err: any) {
    console.error('Erro ao listar regras de notificação:', err);
    res.status(500).json({ error: err.message });
  }
}
