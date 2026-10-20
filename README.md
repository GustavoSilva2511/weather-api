# Weather API

Solução do desafio [Weather API](https://roadmap.sh/projects/weather-api-wrapper-service).

API em **TypeScript + Fastify** que consulta a [OpenWeatherMap](https://openweathermap.org/api) e faz cache das respostas no **Redis** por 1 hora, reduzindo chamadas à API externa. Possui também rate limit de 100 requisições a cada 15 minutos por IP.

## Stack

- [Node.js](https://nodejs.org/) (22+)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/)
- [Redis](https://redis.io/)
- [Axios](https://axios-http.com/)
- [Docker](https://www.docker.com/) / Docker Compose

## Como funciona

1. A requisição chega em `GET /weather/:city`.
2. O serviço procura a cidade no Redis.
3. Se houver cache, retorna imediatamente.
4. Caso contrário, consulta a OpenWeatherMap, salva a resposta no Redis com TTL de 1 hora e retorna os dados.

## Pré-requisitos

Para rodar localmente:

- Node.js 22 ou superior
- npm
- Redis em execução (local ou container)

Para rodar com Docker:

- Docker
- Docker Compose

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
WEATHER_API_KEY=sua_chave_da_openweathermap
```

| Variável          | Descrição                                          | Padrão                      |
| ----------------- | -------------------------------------------------- | --------------------------- |
| `PORT`            | Porta em que a API escuta                          | `3000`                      |
| `REDIS_URL`       | URL de conexão com o Redis                         | `redis://localhost:6379`    |
| `WEATHER_API_KEY` | Chave da API da OpenWeatherMap (obrigatória)       | —                           |

> Obtenha uma chave gratuita em <https://home.openweathermap.org/users/sign_up>. O arquivo `.env` já está no `.gitignore` e não deve ser versionado.

## Rodando com Docker Compose (recomendado)

Sobe a API e o Redis juntos:

```bash
docker compose up --build
```

A API ficará disponível em <http://localhost:8000> e o Redis em `localhost:6379`.

Para rodar em background:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

> No Compose, o `env_file` carrega o `.env` e as variáveis `PORT=3000` e `REDIS_URL=redis://redis:6379` são sobrescritas para usar o serviço `redis`.

## Rodando localmente (sem Docker)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Suba um Redis local (se ainda não tiver um):

   ```bash
   docker run -d -p 6379:6379 --name weather-redis redis:alpine
   ```

3. Configure o `.env` com `REDIS_URL=redis://localhost:6379` e sua `WEATHER_API_KEY`.

4. Inicie em modo desenvolvimento (com reload automático):

   ```bash
   npm run dev
   ```

5. Ou compile e rode a versão de produção:

   ```bash
   npm run build
   npm start
   ```

## Endpoints

### `GET /`

Health check simples.

```bash
curl http://localhost:3000/
```

Resposta:

```json
{ "message": "Hello, World!" }
```

### `GET /weather/:city`

Retorna os dados climáticos atuais da cidade informada.

```bash
curl http://localhost:3000/weather/Sao%20Paulo
```

Exemplo de resposta (resumida):

```json
{
  "name": "São Paulo",
  "main": {
    "temp": 295.15,
    "humidity": 70
  },
  "weather": [
    { "description": "nublado" }
  ]
}
```

- A primeira requisição consulta a OpenWeatherMap.
- Requisições seguintes para a mesma cidade (dentro de 1 hora) retornam do cache Redis.
- Erros na consulta externa retornam HTTP `500` com `{ "error": "Failed to fetch weather data" }`.

## Scripts

| Script          | Descrição                                      |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Executa com `tsx watch` (reload automático)    |
| `npm run build` | Compila o TypeScript para `dist/`              |
| `npm start`     | Executa o build compilado (`dist/main.js`)     |

## Estrutura do projeto

```text
src/
├── main.ts                  # Bootstrap do Fastify, rotas e rate limit
├── weather.service.ts       # Regra de negócio e cache da previsão
└── redis/
    ├── redis.client.ts      # Conexão com o Redis
    └── redis.interface.ts   # Contrato de cache
```

## Licença

MIT
