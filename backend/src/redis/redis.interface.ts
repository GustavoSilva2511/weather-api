// src/infra/redis/redis.interface.ts (ou direto no arquivo)
export interface ICacheRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}