import { Request, Response } from 'express';

export function getLogs(req: Request, res: Response) {
  res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
}

