# API Contract - Zappy Kiwify Server

Documentação dos contratos dos principais endpoints REST para facilitar manutenção e integração.

---

## 1. Account

### POST `/api/zappy/accounts`
Cria uma nova conta.

**Payload:**
```json
{
  "name": "string",      // obrigatório
  "status": "number"     // obrigatório (0=inativa, 1=ativa)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"         // UUID da conta criada
}
```

### GET `/api/zappy/accounts`
Lista todas as contas.

**Resposta:**
```json
[
  {
    "id": "string",
    "name": "string",
    "status": "number"
  }
]
```

---

## 2. Integration

### POST `/api/zappy/integrations`
Cria uma integração para uma conta.

**Payload:**
```json
{
  "accountId": "string",     // obrigatório (UUID)
  "type": "number",          // obrigatório (1=ZAPPY, 2=KIWIFY)
  "credentials": { ... }      // obrigatório (JSON)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"             // UUID da integração criada
}
```

### GET `/api/zappy/integrations`
Lista todas as integrações.

**Resposta:**
```json
[
  {
    "id": "string",
    "accountId": "string",
    "type": "number",
    "credentials": { ... }
  }
]
```

---

## 3. Notification Rule

### POST `/api/zappy/notification-rules`
Cria uma regra de notificação.

**Payload:**
```json
{
  "integrationId": "string",   // obrigatório (UUID)
  "accountId": "string",       // obrigatório (UUID)
  "active": "boolean",         // obrigatório
  "event": "number",           // obrigatório (código do evento)
  "message": "string",         // obrigatório
  "adjustments": { ... }        // opcional (JSON)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"               // UUID da regra criada
}
```

### GET `/api/zappy/notification-rules`
Lista todas as regras de notificação.

**Resposta:**
```json
[
  {
    "id": "string",
    "integrationId": "string",
    "accountId": "string",
    "active": "boolean",
    "event": "number",
    "message": "string",
    "adjustments": { ... }
  }
]
```

---

## 4. Webhook

### POST `/api/webhook/kiwify`
Recebe eventos do Kiwify.

**Payload:**
```json
{
  // Estrutura do evento conforme integração Kiwify
}
```
**Resposta:**
```json
{
  "success": true
}
```

---

## 5. Notificações via Socket.IO

- Evento: `notification`
- Payload:
```json
{
  "title": "string",
  "message": "string"
}
```

---

## Observações
- Todos os endpoints retornam erro padrão:
```json
{
  "error": "Mensagem do erro"
}
```
- Os tipos e enums estão definidos em `src/models/zappyTypes.ts`.
- Para detalhes de eventos e variáveis dinâmicas, consulte o `README.md`.
# API Contract - Zappy Kiwify Server

Documentação dos contratos dos principais endpoints REST para facilitar manutenção e integração.

---

## 1. Account

### POST `/api/zappy/accounts`
Cria uma nova conta.

**Payload:**
```json
{
  "name": "string",      // obrigatório
  "status": "number"     // obrigatório (0=inativa, 1=ativa)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"         // UUID da conta criada
}
```

### GET `/api/zappy/accounts`
Lista todas as contas.

**Resposta:**
```json
[
  {
    "id": "string",
    "name": "string",
    "status": "number"
  }
]
```

---

## 2. Integration

### POST `/api/zappy/integrations`
Cria uma integração para uma conta.

**Payload:**
```json
{
  "accountId": "string",     // obrigatório (UUID)
  "type": "number",          // obrigatório (1=ZAPPY, 2=KIWIFY)
  "credentials": { ... }      // obrigatório (JSON)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"             // UUID da integração criada
}
```

### GET `/api/zappy/integrations`
Lista todas as integrações.

**Resposta:**
```json
[
  {
    "id": "string",
    "accountId": "string",
    "type": "number",
    "credentials": { ... }
  }
]
```

---

## 3. Notification Rule

### POST `/api/zappy/notification-rules`
Cria uma regra de notificação.

**Payload:**
```json
{
  "integrationId": "string",   // obrigatório (UUID)
  "accountId": "string",       // obrigatório (UUID)
  "active": "boolean",         // obrigatório
  "event": "number",           // obrigatório (código do evento)
  "message": "string",         // obrigatório
  "adjustments": { ... }        // opcional (JSON)
}
```
**Resposta:**
```json
{
  "success": true,
  "id": "string"               // UUID da regra criada
}
```

### GET `/api/zappy/notification-rules`
Lista todas as regras de notificação.

**Resposta:**
```json
[
  {
    "id": "string",
    "integrationId": "string",
    "accountId": "string",
    "active": "boolean",
    "event": "number",
    "message": "string",
    "adjustments": { ... }
  }
]
```

---

## 4. Webhook

### POST `/api/webhook/kiwify`
Recebe eventos do Kiwify.

**Payload:**
```json
{
  // Estrutura do evento conforme integração Kiwify
}
```
**Resposta:**
```json
{
  "success": true
}
```

---

## 5. Notificações via Socket.IO

- Evento: `notification`
- Payload:
```json
{
  "title": "string",
  "message": "string"
}
```

---

## Observações
- Todos os endpoints retornam erro padrão:
```json
{
  "error": "Mensagem do erro"
}
```
- Os tipos e enums estão definidos em `src/models/zappyTypes.ts`.
- Para detalhes de eventos e variáveis dinâmicas, consulte o `README.md`.
