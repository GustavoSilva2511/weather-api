import fastify from 'fastify';
import dotenv from 'dotenv';


dotenv.config();

import { WeatherService } from './weather.service.js';
import { connectRedis, redisClient } from './redis/redis.client.js';


async function bootstrap() {
  await connectRedis();
  const port: number = Number(process.env.PORT) || 3000;
  const weatherService = new WeatherService(redisClient);
  const app = fastify();
  await app.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '15 minute'
  })

  app.get('/', async (request, reply) => {
    return { message: 'Hello, World!' };
  });

  app.get('/weather/:city', async (request, reply) => {
    const { city } = request.params as { city: string };
    try {
      const weatherData = await weatherService.getWeather(city);
      return weatherData;
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch weather data' });
    }
  });

  app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(`Server is running at ${address}`);
  });
}

bootstrap();