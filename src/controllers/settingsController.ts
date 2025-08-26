import { Request, Response } from 'express';

export const getSettings = (req: Request, res: Response) => {
  // Exemplo: retornar configurações estáticas
  res.json({ token: 'xxxx', param: 'value' });
};

export const updateSettings = (req: Request, res: Response) => {
  const { token, param } = req.body;
  if (!token || String(token).trim() === '' || !param || String(param).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: token, param.' });
  }
  res.json({ success: true, updated: req.body });
};
