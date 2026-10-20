# Weather API

Solução do desafio [Weather API](https://roadmap.sh/projects/weather-api-wrapper-service).

Monorepo com **backend** em TypeScript + Fastify e **frontend** em React + Vite. O backend consulta a [OpenWeatherMap](https://openweathermap.org/api) e faz cache das respostas no **Redis** por 1 hora, com rate limit de 100 requisições a cada 15 minutos por IP. O frontend é servido por Nginx, que também faz proxy de `/api` para o backend.

## Stack

- [Node.js](https://nodejs.org/) (22+)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/)
- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Redis](https://redis.io/)
- [Axios](https://axios-http.com/)
- [Docker](https://www.docker.com/) / Docker Compose

## Estrutura do projeto

```text
weather-api/
├── backend/
│   ├── src/
│   │   ├── main.ts                  # Bootstrap do Fastify, rotas e rate limit
│   │   ├── weather.service.ts       # Regra de negócio e cache da previsão
│   │   └── redis/
│   │       ├── redis.client.ts      # Conexão com o Redis
│   │       └── redis.interface.ts   # Contrato de cache
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Interface de busca do clima
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── Dockerfile
│   ├── nginx.conf                   # Serve o SPA e faz proxy de /api
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

## Como funciona

1. O usuário busca uma cidade no frontend.
2. O frontend chama `GET /api/weather/:city`.
3. O Nginx encaminha `/api/*` para o backend (`/weather/:city`).
4. O backend procura a cidade no Redis.
5. Se houver cache, retorna imediatamente.
6. Caso contrário, consulta a OpenWeatherMap, salva a resposta no Redis com TTL de 1 hora e retorna os dados.

## Pré-requisitos

Para rodar com Docker:

- Docker
- Docker Compose

Para rodar localmente:

- Node.js 22 ou superior
- npm
- Redis em execução (local ou container)

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha sua chave:

```bash
cp .env.example .env
```

```env
PORT=3000
REDIS_URL=redis://localhost:6379
WEATHER_API_KEY=sua_chave_da_openweathermap
```

| Variável          | Descrição                                    | Padrão                   |
| ----------------- | -------------------------------------------- | ------------------------ |
| `PORT`            | Porta em que o backend escuta                | `3000`                   |
| `REDIS_URL`       | URL de conexão com o Redis                   | `redis://localhost:6379` |
| `WEATHER_API_KEY` | Chave da API da OpenWeatherMap (obrigatória) | —                        |

> Obtenha uma chave gratuita em <https://home.openweathermap.org/users/sign_up>. O arquivo `.env` está no `.gitignore` e não deve ser versionado.

## Rodando com Docker Compose (recomendado)

Sobe backend, frontend e Redis juntos:

```bash
docker compose up --build
```

Serviços disponíveis:

| Serviço  | URL                     |
| -------- | ----------------------- |
| Frontend | <http://localhost:8080> |
| Backend  | <http://localhost:8001> |
| Redis    | `localhost:6379`        |

Para rodar em background:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

> No Compose, o backend usa `REDIS_URL=redis://redis:6379`. O frontend chama `/api/*`, e o Nginx encaminha para o serviço `backend` na porta `3000`.

## Rodando localmente (sem Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

O backend lê o `.env` da raiz do projeto e fica disponível em <http://localhost:3000>.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em <http://localhost:5173>. O Vite faz proxy de `/api` para `http://localhost:3000`.

> É necessário ter um Redis em execução. Se ainda não tiver:

```bash
docker run -d -p 6379:6379 --name weather-redis redis:alpine
```

## Endpoints

### `GET /`

Health check simples.

```bash
curl http://localhost:8001/
```

Resposta:

```json
{ "message": "Hello, World!" }
```

### `GET /weather/:city`

Retorna os dados climáticos atuais da cidade informada.

```bash
curl http://localhost:8001/weather/Sao%20Paulo
```

Via frontend (proxy Nginx):

```bash
curl http://localhost:8080/api/weather/Sao%20Paulo
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

### Backend

| Script          | Descrição                                   |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Executa com `tsx watch` (reload automático) |
| `npm run build` | Compila o TypeScript para `dist/`           |
| `npm start`     | Executa o build compilado (`dist/main.js`)  |

### Frontend

| Script          | Descrição                              |
| --------------- | -------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento do Vite    |
| `npm run build` | Build de produção em `dist/`           |
| `npm run preview` | Pré-visualiza o build de produção    |

## Licença

MIT
