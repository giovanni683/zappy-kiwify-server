import { Request, Response } from 'express';

export const getLogs = (req: Request, res: Response) => {
  // Exemplo: retornar logs estáticos
  res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
};
