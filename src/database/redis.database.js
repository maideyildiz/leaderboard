import Redis from 'redis';
import { config } from 'dotenv';

config();

const redisClient = Redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
})

redisClient.on('error', (err) => {
  console.log('Redis connection error:', err);
})

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
}

export { redisClient, connectRedis }
