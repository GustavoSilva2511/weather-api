// src/infra/redis/redis.client.ts
import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Erro no Redis Client', err));

// Opcional: função para conectar globalmente se necessário
export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('📦 Redis conectado com sucesso!');
  }
}