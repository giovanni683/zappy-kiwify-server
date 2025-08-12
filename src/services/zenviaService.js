// Serviço para comunicação com a API Zenvia
const axios = require('axios');

exports.sendZenviaMessage = async (notification) => {
  // Exemplo de chamada à API Zenvia
  // Substitua pelos dados reais da notificação e autenticação
  const response = await axios.post('https://api.zenvia.com/v2/messages', {
    to: notification.phone,
    contents: [{ type: 'text', text: notification.message }],
  }, {
    headers: {
      'X-API-TOKEN': process.env.ZENVIA_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
