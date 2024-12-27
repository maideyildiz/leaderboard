import express from 'express';
import connectMongoDB from './src/database/Mongo.database.js';
import { connectRedis } from './src/database/redis.database.js';
import registerRoute from './src/routes/register.route.js';
import { authenticateToken } from './src/middlewares/authentication.js'; // Yeni middleware
import loginRoute from './src/routes/login.route.js';
import leaderboardRoute from './src/routes/leaderboard.route.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express()
app.use(express.json())
await connectMongoDB()
await connectRedis()

app.use(express.json());
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/leaderboard', authenticateToken, leaderboardRoute);
app.use(errorHandler)

export default app;





//await redisClient.flushAll();