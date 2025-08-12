import axios from 'axios';

export interface ZenviaNotification {
  phone: string;
  message: string;
}

export async function sendZenviaNotification(notification: ZenviaNotification): Promise<any> {
  // Exemplo de chamada à API Zenvia
  // Substitua pelos dados reais da notificação e autenticação
  const response = await axios.post('https://api.zenvia.com/v2/messages', {
    to: notification.phone,
    contents: [ { type: 'text', text: notification.message } ],
  }, {
    headers: {
      'X-API-TOKEN': process.env.ZENVIA_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}
