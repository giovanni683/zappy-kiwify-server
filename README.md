## Eventos Suportados

Os seguintes eventos podem ser usados para disparar notificações automáticas:

- **Transacionais**
   - boleto_gerado
   - pix_gerado
   - compra_aprovada
   - compra_recusada
- **Recuperação / Follow-Up**
   - carrinho_abandonado
   - subscription_late
   - subscription_canceled
- **Pós-venda / Suporte**
   - compra_reembolsada
   - chargeback
   - subscription_renewed

## Variáveis Dinâmicas

As mensagens podem conter variáveis dinâmicas, que serão substituídas automaticamente:

- nomeCompleto
- primeiroNome
- urlBoleto
- codigoBarrasBoleto
- dataExpiracaoBoleto
- statusPagamento
- codigoPix
- dataExpiracaoPix
- checkoutLink
- email
- telefone
- nomeProduto
- idProduto
- statusCarrinho
- pais
- cnpj
- dataCriacao
- lojaId
- motivoRecusa
- metodoPagamento
- tipoCartao
- ultimosDigitosCartao
- valorPedido
- dataAprovacao
- cpf
- planoAssinatura
- urlAcesso
- dataReembolso
- statusAssinatura
- dataProximaCobranca

## Exemplos de Mensagem

```text
Olá {{primeiroNome}}, seu boleto está disponível em {{urlBoleto}}.
Olá {{primeiroNome}}, seu PIX foi gerado! Código: {{codigoPix}}.
Parabéns {{primeiroNome}}, sua compra foi aprovada!
Seu pedido {{idPedido}} foi reembolsado em {{dataReembolso}}.
```
# Zappy Kiwify Server

Este projeto é o backend (Express + Socket.IO + Prisma) para o sistema de notificações Zappy Kiwify.
Todos os controllers e modelos usam Prisma para acesso seguro ao banco (sem pool.query).
Os IDs das entidades principais (Account, Integration, NotificationRule) são gerados como UUID v7.
Os endpoints REST aceitam e retornam dados em JSON, com tipagem correta dos campos (ex: event aceita number ou string).
O frontend deve consumir os endpoints usando os IDs retornados e enviar os campos obrigatórios conforme exemplos abaixo.

## Como rodar

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Configure o arquivo `.env` com as variáveis necessárias:
   ```env
   DB_HOST=localhost
   DB_USER=...
   DB_PASS=...
   DB_NAME=...
   PORT=3001
   ```
3. Inicie o servidor:
   ```sh
   npm start
   ```
## Endpoints principais

- `POST /api/zappy/accounts` — Cria uma conta
- `POST /api/zappy/integrations` — Cria uma integração
- `POST /api/zappy/notification-rules` — Cria uma regra de notificação
- `GET /api/zappy/notification-rules` — Lista regras de notificação

## Exemplo de payload para criação

### Conta
```json
{
  "name": "Conta Teste",
  "status": 1
}
```

### Integração
```json
{
  "accountId": "<id da conta>",
  "type": 1,
  "credentials": { "client_id": "abc", "client_secret": "xyz" },
  "zappyToken": "token",
  "zappyUrl": "https://api.zappy.chat"
}
```

### Regra de notificação
```json
{
  "integrationId": "<id da integração>",
  "accountId": "<id da conta>",
  "active": true,
  "event": 1,
  "message": "Mensagem de teste",
  "adjustments": {}
}
```

## Observações
- IDs são UUID v7 (alfanuméricos e longos).
- Campos obrigatórios devem ser enviados conforme exemplos.
- O frontend deve tratar os retornos e erros do backend.

## Docker

Para rodar com Docker:
```sh
docker build -t zappy-kiwify-server .
docker run -p 3001:3001 --env-file .env zappy-kiwify-server
```

## Estrutura
- `src/` - Código fonte do backend

## Integração
- O client deve acessar o backend pela URL configurada.
