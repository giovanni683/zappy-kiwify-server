// Controller do webhook
const { sendZenviaMessage } = require('../services/zenviaService');

exports.handleWebhook = async (req, res) => {
  try {
    const notification = req.body;
    // Lógica de negócio: disparar mensagem via Zenvia
    await sendZenviaMessage(notification);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
