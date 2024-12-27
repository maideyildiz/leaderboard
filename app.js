import express from 'express';
import connectMongoDB from './src/database/Mongo.database.js';
import { connectRedis } from './src/database/redis.database.js';
import { limiter } from './src/middlewares/ratelimit.js';
import registerRoute from './src/routes/register.route.js';
import { authenticateToken } from './src/middlewares/authentication.js'; // Yeni middleware
import loginRoute from './src/routes/login.route.js';
import leaderboardRoute from './src/routes/leaderboard.route.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

try {
  await connectMongoDB();
  await connectRedis();
} catch (error) {
  console.error('Failed to connect to databases:', error);
  process.exit(1);
}

app.use(express.json());
app.use(limiter);

app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/leaderboard', authenticateToken, leaderboardRoute);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use(errorHandler);

export default app;





//await redisClient.flushAll();