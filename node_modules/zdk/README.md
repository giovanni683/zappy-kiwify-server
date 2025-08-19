# ZDK (Kit de Desenvolvimento Zappy)

[![NPM Version](https://img.shields.io/npm/v/zdk)](https://www.npmjs.com/package/zdk)
[![License](https://img.shields.io/npm/l/zdk)](https://github.com/username/zdk/blob/main/LICENSE)

ZDK é um SDK poderoso projetado para simplificar interações com a API da Zappy, permitindo gerenciar conexões, contatos, mensagens, filas, tags, tickets e usuários.

## Instalação

Instale o ZDK via npm:

```sh
npm install zdk
```

Ou usando Yarn:

```sh
yarn add zdk
```

## Configuração
Para inicializar o `Zdk`, você pode fornecer **rootUrl** e **token** como argumentos ou configurá-los como variáveis de ambiente. Ambos rootUrl e token são argumentos opcionais se as variáveis de ambiente **ZAPPY_URL** e **ZAPPY_TOKEN** estiverem configuradas.

### Usando argumentos
```js
const { Zdk } = require('zdk');

const zdk = new Zdk("https://api-example.chat", "TOKEN");
```

### Usando variáveis de ambiente
Alternativamente, você pode configurar as variáveis de ambiente para evitar passar rootUrl e token diretamente no seu código:

```sh
export ZAPPY_URL="https://api-example.chat"
export ZAPPY_TOKEN="TOKEN"
```

Com as variáveis de ambiente configuradas, você pode inicializar a classe `Zdk` sem argumentos:

```js
const { Zdk } = require('zdk');

const zdk = new Zdk();
```

## Visão Geral
### ZappyApi
A classe `ZappyApi` é a classe base para realizar solicitações de API de baixo nível. Ela inclui o método makeRequest para solicitações HTTP gerais.

makeRequest(método, endpoint, corpo?, tipoDeConteúdo?): Envia uma solicitação para o endpoint especificado com corpo e tipoDeConteúdo opcionais.
Parâmetros:
método: Método HTTP (GET, POST, etc.).
endpoint: Endpoint da API (string).
corpo (opcional): Payload da solicitação.
tipoDeConteúdo (opcional): Tipo MIME, por exemplo, application/json.

## Zdk

A classe `Zdk` estende `ZapApi` e inclui propriedades para gerenciar recursos principais da API Zappy. Cada propriedade é uma instância de uma classe especializada que fornece métodos específicos para manipulação de dados e operações.

### Propriedades

| Propriedade | Descrição                                              |
| ----------- | ------------------------------------------------------ |
| connections | Gerencia conexões da instância                         |
| contacts    | Gerencia contatos, como buscar e criar novos contatos. |
| messages    | Gerencia operações relacionadas a mensagens.           |
| queues      | Gerencia filas para organização de atendimento.        |
| tags        | Gerencia funcionalidade de tags para categorização.    |
| tickets     | Gerencia tickets de atendimento.                       |
| users       | Acessa métodos relacionados a usuários do sistema.     |

[Documentação completa](./docs/modules/index.md)
