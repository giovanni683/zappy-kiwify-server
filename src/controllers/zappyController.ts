import { pool } from '../db';
import { Account, Integration, NotificationRule, IntegrationType } from '../models/zappyTypes';
import { validateDynamicVariables } from '../utils/interpolateMessage';
import { Request, Response } from 'express';

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status } = req.body;
  if (!name || typeof status !== 'number') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: name (string), status (number).' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Account (id, name, status) VALUES (UUID(), ?, ?)',
      [name, status]
    );
    // Retorna o id gerado para uso em integrações
    const [rows]: any = await pool.query('SELECT id FROM Account WHERE name = ? ORDER BY createdAt DESC LIMIT 1', [name]);
    res.status(201).json({ success: true, id: rows[0]?.id, result });
  } catch (err: any) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar contas
export async function listAccounts(req: Request, res: Response) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM Account');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar integração
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials, zappyToken, zappyUrl } = req.body;
  // Validação dos campos obrigatórios
  if (!accountId || typeof type !== 'number' || !credentials || !credentials.client_id || !credentials.client_secret || !zappyToken || !zappyUrl) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: accountId, type, credentials (client_id, client_secret), zappyToken, zappyUrl.' });
  }
  // Verifica se o accountId existe
  const [accounts]: any = await pool.query('SELECT id FROM Account WHERE id = ?', [accountId]);
  if (!accounts.length) {
    return res.status(404).json({ error: 'accountId não encontrado. Crie a conta antes de integrar.' });
  }
  try {
    // Salva todos os dados no campo credentials (incluindo zappyToken e zappyUrl)
    const fullCredentials = {
      ...credentials,
      zappyToken,
      zappyUrl
    };
    const [result] = await pool.query(
      'INSERT INTO Integration (id, accountId, type, credentials) VALUES (UUID(), ?, ?, ?)',
      [accountId, type, JSON.stringify(fullCredentials)]
    );
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar integração:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar integrações
export async function listIntegrations(req: Request, res: Response) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM Integration');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar regra de notificação
export async function createNotificationRule(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || !accountId || typeof active !== 'boolean' || typeof event !== 'number' || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: integrationId (string), accountId (string), active (boolean), event (number), message (string).' });
  }
  // Validação dos placeholders da mensagem
  const invalidVars = validateDynamicVariables(message);
  if (invalidVars.length > 0) {
    return res.status(400).json({
      error: 'Mensagem contém variáveis dinâmicas inválidas.',
      invalidVariables: invalidVars
    });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO NotificationRule (id, integrationId, accountId, active, event, message, adjustments) VALUES (UUID(), ?, ?, ?, ?, ?, ?)',
      [integrationId, accountId, active, event, message, adjustments ? JSON.stringify(adjustments) : null]
    );
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar regra de notificação:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar regras de notificação
export async function listNotificationRules(req: Request, res: Response) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM NotificationRule');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
