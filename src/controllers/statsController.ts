import { Request, Response } from 'express';

export const getStats = (req: Request, res: Response) => {
  // Exemplo: retornar estatísticas estáticas
  res.json({ notificationsSent: 123, integrationsActive: 4 });
};
