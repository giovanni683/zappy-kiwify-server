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

## Exemplos de Mensagem

```text
Olá {{primeiroNome}}, seu boleto está disponível em {{urlBoleto}}.
Olá {{primeiroNome}}, seu PIX foi gerado! Código: {{codigoPix}}.
Parabéns {{primeiroNome}}, sua compra foi aprovada!
```
# Zappy Kiwify Server

Este projeto é o backend (Express + Socket.IO) para o sistema de notificações Zappy Kiwify.

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
