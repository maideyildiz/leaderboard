import express from 'express';
import connectMongoDB from './src/database/mongo.database.js';
import { connectRedis,redisClient } from './src/database/redis.database.js';
import { limiter } from './src/middlewares/ratelimit.js';
import registerRoute from './src/routes/register.route.js';
import { authenticateToken } from './src/middlewares/authentication.js'; // Yeni middleware
import loginRoute from './src/routes/login.route.js';
import leaderboardRoute from './src/routes/leaderboard.route.js';
import homeRoute from './src/routes/home.route.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { ERRORS } from './src/constants/response.js';

const app = express();

try {
  await connectMongoDB();
  await connectRedis();
} catch (error) {
  console.error(ERRORS.FAILED_TO_CONNECT, error);
  process.exit(1);
}
//await redisClient.flushAll();
app.use(express.json());
app.use(limiter);

app.use('/',homeRoute)
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/leaderboard', authenticateToken, leaderboardRoute);

app.use((req, res, next) => {
  res.status(404).json({ message: ERRORS.ENDPOINT_NOT_FOUND });
});

app.use(errorHandler);

export default app;