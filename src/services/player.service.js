import Player from '../models/player.model.js';
import { setToCache,getFromCache,getRank ,getPlayerZScore ,getLeaderboardRange,addPlayersToLeaderboard,addPlayerToLeaderboard } from '../helpers/redis.helper.js';

const getPlayerByUserId = async (userId) => {
    try {
        const cachedPlayer = await getFromCache("playerbyuserid",userId);
        if (cachedPlayer) {
            return cachedPlayer;
        }
        const player = await Player.findOne({ userId });
        setToCache("playerbyuserid",userId,player)
        setToCache("playerbyusername",player.username,player)
        return player;
    } catch (error) {
        console.error('Error fetching player from DB:', error);
        return null;
    }
}

const addPlayer = async (player) => {
    try {
        const newPlayer = new Player(player);
        await newPlayer.save();
        setToCache("playerbyuserid",newPlayer.userId,newPlayer)
        setToCache("playerbyusername",newPlayer.username,newPlayer)
        return newPlayer;
    } catch (error) {
        console.error('Error adding player to DB:', error);
        return null;
    }
}

const updatePlayer = async (player) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(player._id, player, { new: true });
        setToCache("playerbyuserid",updatedPlayer.userId,updatedPlayer)
        setToCache("playerbyusername",updatedPlayer.username,updatedPlayer)
        await addPlayerToLeaderboard(player.score,player.userId)
        return updatedPlayer;
    } catch (error) {
        console.error('Error updating player in DB:', error);
        return null;
    }
}

const getPlayerRankByUserId = async (id) => {
    try {
        const cachedRank = await getRank(id);
        if (cachedRank) {
            return cachedRank;
        }
        const player = await getPlayerByUserId(id);
        const score = player.score;
        const count = await Player.countDocuments({ score: { $gt: score } });
        return count + 1;
    } catch (error) {
        console.error('Error getting player rank from DB:', error);
        return null;
    }
}

const getPlayerZScoreByUserId = async (userId) => {
    try {
    const score = await getPlayerZScore(userId);
    if (score) {
        return score;
    }
    const player = await getPlayerByUserId(userId);
    return player.score;
    } catch (error) {
        console.error('Error getting player rank from DB:', error);
        return null;
    }
}

const getTopPlayerList = async (start,end,limit) => {
    try {
    const cachedTopPlayers= await getLeaderboardRange(start,end);
    if (cachedTopPlayers) {
        return cachedTopPlayers;
    }
    const topPlayers = await Player.find().sort({ score: -1 }).limit(limit);
    const topPlayerEntries = topPlayers.map(player => ({
        score: player.score,
        value: player.userId,
      }));

    await addPlayersToLeaderboard(topPlayerEntries);
    return topPlayerEntries;
    } catch (error) {
        console.error('Error getting top players from DB:', error);
        return null;
    }
}

export { getPlayerByUserId,addPlayer,updatePlayer,getPlayerRankByUserId ,getPlayerZScoreByUserId,getTopPlayerList};