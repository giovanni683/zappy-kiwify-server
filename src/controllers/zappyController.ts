import { pool } from '../db';
import { Account, Integration, NotificationRule, IntegrationType } from '../models/zappyTypes';
import { Request, Response } from 'express';

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO accounts (id, name, status) VALUES (UUID(), ?, ?)',
      [name, status]
    );
    // Buscar o id gerado
    const [rows]: any = await pool.query('SELECT id FROM accounts WHERE name = ? ORDER BY created_at DESC LIMIT 1', [name]);
    const id = rows && rows.length > 0 ? rows[0].id : null;
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Listar contas
export async function listAccounts(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar integração
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO integrations (id, account_id, type, credentials) VALUES (UUID(), ?, ?, ?)',
      [accountId, type, JSON.stringify(credentials)]
    );
    const [rows]: any = await pool.query('SELECT id FROM integrations WHERE account_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1', [accountId, type]);
    const id = rows && rows.length > 0 ? rows[0].id : null;
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Listar integrações
export async function listIntegrations(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM integrations');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar regra de notificação
export async function createNotificationRule(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO notification_rules (id, integration_id, account_id, active, event, message, adjustments) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [integrationId, accountId, active, event, message, adjustments ? JSON.stringify(adjustments) : null]
    );
    const [rows]: any = await pool.query('SELECT id FROM notification_rules WHERE integration_id = ? AND account_id = ? ORDER BY created_at DESC LIMIT 1', [integrationId, accountId]);
    const id = rows && rows.length > 0 ? rows[0].id : null;
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Listar regras de notificação
export async function listNotificationRules(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM notification_rules');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
