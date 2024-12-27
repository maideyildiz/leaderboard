import {redisClient} from '../database/redis.database.js';

const getFromCache = async (key,id) => {
    const cachedUser = await redisClient.get(`${key}:${id}`);
    return cachedUser ? JSON.parse(cachedUser) : null;
}
const setToCache = async (key,id,object) => {
    await redisClient.set(`${key}:${id}`, JSON.stringify(object));
}

const getPlayerZScore = async (userId) => {
    return await redisClient.zScore('leaderboard', userId);
}
const setPlayerZScore = async (score, userId) => {
    await redisClient.zAdd('leaderboard', {score, value: userId});
}

const getRank = async (userId) => {
    return await redisClient.zRevRank('leaderboard', userId) + 1;
}


export { getRank,setPlayerZScore,getPlayerZScore,setToCache,getFromCache };