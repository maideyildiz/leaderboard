import {redisClient} from '../database/redis.database.js';
export async function getPlayerName(userId) {
    const cachedPlayer = await redisClient.hGet('playerNames', userId);
    if (cachedPlayer) {
      return cachedPlayer;
    }

    const player = await redisClient.get(`player:${userId}`);
    const playerName = player ? JSON.parse(player).userName : `Unknown User`;

    await redisClient.hSet('playerNames', userId, playerName)
    await redisClient.expire('playerNames', 7200)

    return playerName;
  }

