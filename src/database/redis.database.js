import Redis from 'redis';
import { config } from 'dotenv';
config();

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;

const redisClient = Redis.createClient({ host: REDIS_HOST, port: REDIS_PORT });

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.log('Redis connection error:', err);
});


redisClient.connect();
