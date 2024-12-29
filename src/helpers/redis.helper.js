import {redisClient} from '../database/redis.database.js';
import { config } from 'dotenv';
config();

const getFromCache = async (key,id) => {
    const cachedUser = await redisClient.get(`${key}:${id}`);
    return cachedUser ? JSON.parse(cachedUser) : null;
}

const getObjectsFromCacheFromKeys = async (key,ids) => {
    const pipeline = ids.map(id => ['GET', `${key}:${id}`]);
    const cachedObjects = await redisClient.pipeline(pipeline).exec();
    return cachedObjects.map(r => r[1] ? JSON.parse(r[1]) : null);
}
const setToCache = async (key,id,object) => {
    await redisClient.set(`${key}:${id}`, JSON.stringify(object), 'EX', process.env.CACHE_TTL);
}

const getPlayerZScore = async (userId) => {
    return await redisClient.zScore('leaderboard', userId);
}
const addPlayerToLeaderboard = async (score, userId) => {
    await redisClient.zAdd('leaderboard', {score, value: userId});
}

const getRank = async (userId) => {
    return await redisClient.zRevRank('leaderboard', userId) + 1;
}

const getLeaderboardRange = async (start, end) => {
    return await redisClient.zRangeWithScores('leaderboard', start, end, { REV: true });
}

const addPlayersToLeaderboard = async (redisEntries) => {
    await redisClient.zAdd('leaderboard', redisEntries);
}

const getLeaderboardCount = async () => {
    return await redisClient.zCard('leaderboard');
}


export { getRank,addPlayerToLeaderboard,addPlayersToLeaderboard,getPlayerZScore,setToCache,getFromCache,getLeaderboardRange,getLeaderboardCount ,getObjectsFromCacheFromKeys };