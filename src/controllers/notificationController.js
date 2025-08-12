// notificationController.js

const notificationService = require('../services/notificationService');

exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    await notificationService.sendNotification({ title, message });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
