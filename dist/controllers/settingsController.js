"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const getSettings = (req, res) => {
    // Exemplo: retornar configurações estáticas
    res.json({ token: 'xxxx', param: 'value' });
};
exports.getSettings = getSettings;
const updateSettings = (req, res) => {
    const { token, param } = req.body;
    if (!token || String(token).trim() === '' || !param || String(param).trim() === '') {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: token, param.' });
    }
    res.json({ success: true, updated: req.body });
};
exports.updateSettings = updateSettings;
