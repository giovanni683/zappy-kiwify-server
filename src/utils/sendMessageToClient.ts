import axios from 'axios';
import { prisma } from '../config/prisma';
import { ChannelKey } from '../types/channelKey';

// Exemplo de envio via Zappy API
export async function sendMessageToClient(accountId: string, message: string) {
  // Buscar integração Zappy para a conta
  // ...busque no banco de dados as credenciais necessárias...
  // Exemplo fictício:
  const integration = await prisma.integration.findFirst({
    where: { accountId, type: String(ChannelKey.ZAPPY) }
  });
  if (!integration) throw new Error('Integração Zappy não encontrada.');

  const { zappyToken, zappyUrl } = integration.credentials as { zappyToken: string, zappyUrl: string };

  // Enviar mensagem via Zappy API
  await axios.post(
    `${zappyUrl}/send-message`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${zappyToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
