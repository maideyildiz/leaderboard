import {redisClient} from '../database/redis.database.js';
import { config } from 'dotenv';
config();

const getFromCache = async (key) => {
    const cachedUser = await redisClient.get(key);
    return cachedUser ? JSON.parse(cachedUser) : null;
}

const getObjectsFromCacheFromKeys = async (key,ids) => {
    const pipeline = ids.map(id => ['GET', `${key}:${id}`]);
    const cachedObjects = await redisClient.pipeline(pipeline).exec();
    return cachedObjects.map(r => r[1] ? JSON.parse(r[1]) : null);
}
const setToCache = async (key,object) => {
    await redisClient.set(key, JSON.stringify(object), 'EX', process.env.CACHE_TTL);
}

const getPlayerZScore = async (userId) => {
    return await redisClient.zScore('leaderboard', userId);
}

const addPlayerToLeaderboard = async (gameId, score, userId) => {
    const leaderboardKey = `leaderboard:${gameId}`;
    await redisClient.zAdd(leaderboardKey, {score, value: userId});
};


const getPlayerRankByUserIdAndGameId = async (userId, gameId) => {
    const rank = await redisClient.zRevRank(`leaderboard:${gameId}`, userId);
    if (rank === null) {
        return null;
    }

    return rank + 1;
};

const getRanksByUserId = async (userId) => {
    const gameKeys = await getLeaderboardKeys();
    const ranks = {};

    for (const gameKey of gameKeys) {
        const gameId = gameKey.split(':')[1];
        const rank = await getPlayerRankByUserIdAndGameId(userId, gameId);
        ranks[gameId] = rank;
    }

    return ranks;
};

const getLeaderboardRange = async (key,start, end) => {
    return await redisClient.zRangeWithScores(key, start, end, { REV: true });
}

const addPlayersToLeaderboard = async (redisEntries) => {
    await redisClient.zAdd('leaderboard', redisEntries);
}

const getLeaderboardCount = async () => {
    return await redisClient.zCard('leaderboard');
}

const getLeaderboardKeys = async () => {
    return await redisClient.keys('leaderboard:*');
}


export { getPlayerRankByUserIdAndGameId,addPlayerToLeaderboard,addPlayersToLeaderboard,getPlayerZScore,setToCache,getFromCache,getLeaderboardRange,getLeaderboardCount ,getObjectsFromCacheFromKeys,getLeaderboardKeys,getRanksByUserId };