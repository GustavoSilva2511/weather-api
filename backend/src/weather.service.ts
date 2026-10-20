import axios from 'axios';
import type { RedisClientType } from 'redis';

export class WeatherService {
  constructor(private readonly redisClient: RedisClientType) {}
  
  async getCachedWeather(city: string): Promise<any | null> {
    const cachedData = await this.redisClient.get(city);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  async cacheWeather(city: string, data: any): Promise<void> {
    await this.redisClient.set(city, JSON.stringify(data), {
      EX: 3600 // Cache for 1 hour
    });
  }
  
  async getWeather(city: string): Promise<any> {
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
      const cachedWeather = await this.getCachedWeather(city);
      if (cachedWeather) {
        console.log('Returning cached weather data');
        return cachedWeather;
      }
      
      const response = await axios.get(url);
      await this.cacheWeather(city, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}

