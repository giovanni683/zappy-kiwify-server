import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// PATCH /notification-rules/:id
export const updateNotificationRuleController = async (req: Request, res: Response) => {
  const { id } = req.params;
  let data = { ...req.body };

  console.log('[PATCH] updateNotificationRuleController - sectorId recebido:', data.sectorId);

  // Só faz connect se sectorId for string não vazia e existir no banco
  if (typeof data.sectorId === 'string' && data.sectorId.trim() !== '') {
    const sectorExists = await prisma.sector.findUnique({ where: { id: data.sectorId } });
    if (!sectorExists) {
      return res.status(400).json({ error: 'Setor não encontrado no banco.' });
    }
    data.sector = { connect: { id: data.sectorId } };
    console.log('[PATCH] Conectando sectorId:', data.sectorId);
  } else {
    console.log('[PATCH] sectorId vazio, nulo ou não enviado:', data.sectorId);
    data.sector = { disconnect: true };
  }
  delete data.sectorId;

  // Se o frontend enviar integrationId, converte para o formato Prisma
  if (data.integrationId) {
    data.integration = { connect: { id: data.integrationId } };
    delete data.integrationId;
  }

  // Garante que active seja boolean se enviado como string
  if (typeof data.active === 'string') {
    data.active = data.active === 'true';
  }

  try {
    console.log('[PATCH] Payload final do update:', data);
    const updated = await prisma.notificationRule.update({
      where: { id },
      data,
    });
    return res.json(updated);
  } catch (error: any) {
    console.error('[PATCH] Erro ao atualizar notification rule:', error);
    return res.status(400).json({ error: error.message || 'Failed to update notification rule' });
  }
};
