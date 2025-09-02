import { validateDynamicVariables, interpolateMessage } from '../utils/interpolateMessage';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { uuidv7 } from 'uuidv7';
import axios from 'axios';
import { sendMessageToClient } from '../utils/sendMessageToClient';

// Criar uma conta
export async function createAccount(req: Request, res: Response) {
  const { name, status, ZappyUrl, zappyUrl, zappyToken } = req.body;
  // Aceita tanto 'ZappyUrl' quanto 'zappyUrl' no payload
  const url = ZappyUrl || zappyUrl;
  if (!name || typeof status !== 'number' || String(name).trim() === '' || !url || String(url).trim() === '' || !zappyToken || String(zappyToken).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: name (string), status (number), zappyUrl, zappyToken.' });
  }
  try {
    const id = uuidv7();
    const result = await prisma.account.create({
      data: {
        id,
        name,
        status,
        credentials: {
          zappyUrl: url,
          zappyToken
        }
      }
    });
    res.status(201).json({ success: true, id: result.id, result });
  } catch (err: any) {
    console.error('Erro ao criar conta:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar contas
export async function listAccounts(req: Request, res: Response) {
  try {
    const accounts = await prisma.account.findMany();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar integração
export async function createIntegration(req: Request, res: Response) {
  const { accountId, type, credentials, zappyToken, zappyUrl } = req.body;
  // Validação dos campos obrigatórios
  if (!accountId || type !== 'ZAPPY' || !credentials || !credentials.client_id || !credentials.client_secret || !zappyToken || !zappyUrl ||
      String(accountId).trim() === '' || String(credentials.client_id).trim() === '' || String(credentials.client_secret).trim() === '' || String(zappyToken).trim() === '' || String(zappyUrl).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: accountId, type (deve ser ZAPPY), credentials (client_id, client_secret), zappyToken, zappyUrl.' });
  }
  // Verifica se o accountId existe
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return res.status(404).json({ error: 'accountId não encontrado. Crie a conta antes de integrar.' });
  }
  try {
    const id = uuidv7();
    // Salva todos os dados no campo credentials (incluindo zappyToken e zappyUrl)
    const fullCredentials = {
      ...credentials,
      zappyToken,
      zappyUrl
    };
    const result = await prisma.integration.create({
      data: {
        id,
        accountId,
        type: 'ZAPPY', 
        credentials: fullCredentials
      }
    });
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar integração:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar integrações
export async function listIntegrations(req: Request, res: Response) {
  try {
    const integrations = await prisma.integration.findMany();
    res.json(integrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Criar regra de notificação
export async function createNotificationRule(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || !accountId || typeof active !== 'boolean' || typeof event !== 'number' || !message ||
      String(integrationId).trim() === '' || String(accountId).trim() === '' || String(message).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId (string), accountId (string), active (boolean), event (number), message (string).' });
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
    const id = uuidv7();
    const result = await prisma.notificationRule.create({
      data: {
        id,
        integrationId,
        accountId,
        active,
        event,
        message,
        adjustments: adjustments || null,
        variables: {}
      }
    });
    res.status(201).json({ success: true, result });
  } catch (err: any) {
    console.error('Erro ao criar regra de notificação:', err);
    res.status(500).json({ error: err.message });
  }
}

// Listar regras de notificação
export async function listNotificationRules(req: Request, res: Response) {
  try {
    const rules = await prisma.notificationRule.findMany();
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Novo handler para receber webhooks da Kiwify
export async function kiwifyWebhookHandler(req: Request, res: Response) {
  // Normaliza o evento para buscar a regra corretamente
  const eventType = req.body?.event || req.body?.webhook_event_type;
  const accountId = req.body?.account_id;

  if (!eventType || !accountId) {
    return res.status(400).json({ error: 'Payload inválido.' });
  }

  try {
    const rule = await prisma.notificationRule.findFirst({
      where: {
        accountId,
        event: eventType,
        active: true
      }
    });

    if (!rule) {
      return res.status(200).json({ message: 'Nenhuma regra de notificação configurada para este evento.' });
    }

    // Garante que variables nunca seja nulo ou indefinido
    type NotificationRuleWithVariables = typeof rule & { variables: Record<string, any> };
    const ruleWithVariables = rule as NotificationRuleWithVariables;
    let variables: Record<string, any> = ruleWithVariables.variables ?? {};
    const payload = req.body;

    // Mapeamento seguro para todos os eventos suportados
    if (eventType === 'boleto_gerado' || payload.webhook_event_type === 'billet_created') {
      variables = {
        ...variables,
        urlBoleto: payload.boleto_URL ?? '',
        codigoBarrasBoleto: payload.boleto_barcode ?? '',
        dataExpiracaoBoleto: payload.boleto_expiry_date ?? '',
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? ''
      };
    } else if (eventType === 'pix_gerado' || payload.webhook_event_type === 'pix_created') {
      variables = {
        ...variables,
        codigoPix: payload.pix_code ?? '',
        dataExpiracaoPix: payload.pix_expiration ?? '',
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? ''
      };
    } else if (eventType === 'carrinho_abandonado' || payload.status === 'abandoned') {
      variables = {
        ...variables,
        checkoutLink: payload.checkout_link ?? '',
        nomeCompleto: payload.name ?? '',
        email: payload.email ?? '',
        telefone: payload.phone ?? '',
        nomeProduto: payload.product_name ?? '',
        idProduto: payload.product_id ?? '',
        statusCarrinho: payload.status ?? '',
        pais: payload.country ?? '',
        cnpj: payload.cnpj ?? '',
        dataCriacao: payload.created_at ?? '',
        lojaId: payload.store_id ?? ''
      };
    } else if (eventType === 'compra_recusada' || payload.webhook_event_type === 'order_rejected') {
      variables = {
        ...variables,
        motivoRecusa: payload.card_rejection_reason ?? '',
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? ''
      };
    } else if (eventType === 'compra_aprovada' || payload.webhook_event_type === 'order_approved') {
      variables = {
        ...variables,
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? '',
        dataAprovacao: payload.approved_date ?? '',
        cpf: payload.Customer?.CPF ?? '',
        planoAssinatura: payload.Subscription?.plan?.name ?? '',
        urlAcesso: payload.access_url ?? ''
      };
    } else if (eventType === 'compra_reembolsada' || payload.webhook_event_type === 'order_refunded') {
      variables = {
        ...variables,
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? '',
        dataReembolso: payload.refunded_at ?? '',
        cpf: payload.Customer?.CPF ?? '',
        planoAssinatura: payload.Subscription?.plan?.name ?? ''
      };
    } else if (eventType === 'chargeback' || payload.webhook_event_type === 'chargeback') {
      variables = {
        ...variables,
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? '',
        cpf: payload.Customer?.CPF ?? '',
        planoAssinatura: payload.Subscription?.plan?.name ?? ''
      };
    } else if (
      eventType === 'subscription_late' ||
      payload.webhook_event_type === 'subscription_late'
    ) {
      variables = {
        ...variables,
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? '',
        cpf: payload.Customer?.CPF ?? '',
        planoAssinatura: payload.Subscription?.plan?.name ?? '',
        statusAssinatura: payload.Subscription?.status ?? '',
        dataProximaCobranca: payload.Subscription?.charges?.future?.[0]?.charge_date ?? ''
      };
    } else if (
      eventType === 'subscription_renewed' ||
      payload.webhook_event_type === 'subscription_renewed'
    ) {
      variables = {
        ...variables,
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? '',
        telefone: payload.Customer?.mobile ?? '',
        email: payload.Customer?.email ?? '',
        nomeProduto: payload.Product?.product_name ?? '',
        idPedido: payload.order_id ?? '',
        referenciaPedido: payload.order_ref ?? '',
        metodoPagamento: payload.payment_method ?? '',
        tipoCartao: payload.card_type ?? '',
        ultimosDigitosCartao: payload.card_last4digits ?? '',
        lojaId: payload.store_id ?? '',
        valorPedido: payload.Commissions?.charge_amount ?? '',
        cpf: payload.Customer?.CPF ?? '',
        planoAssinatura: payload.Subscription?.plan?.name ?? '',
        statusAssinatura: payload.Subscription?.status ?? '',
        dataProximaCobranca: payload.Subscription?.charges?.future?.[0]?.charge_date ?? ''
      };
    } else {
      variables = { ...variables, ...payload };
    }

    const message = interpolateMessage(rule.message, variables);
    await sendMessageToClient(accountId, message);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ error: err.message });
  }
}


