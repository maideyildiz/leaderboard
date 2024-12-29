import Player from '../models/player.model.js';
import { setToCache,getFromCache ,getPlayerZScore ,getLeaderboardRange,addPlayersToLeaderboard,addPlayerToLeaderboard } from '../helpers/redis.helper.js';

const getPlayersByUserId = async (userId) => {
    try {
        const cachedPlayers = await getFromCache(`playersbyuserid - ${userId}`);
        if (cachedPlayers) {
            return cachedPlayers;
        }
        const players = await Player.find({ userId });
        const playerRanks = {};
        for (const player of players) {
            const rank = await getPlayerRankByPlayerId(player._id);
            const score = player.score;
            playerRanks[player.gameId] = { userId, rank, score };
        }
        setToCache(`playersbyuserid - ${userId}`,playerRanks)
        return playerRanks;

    } catch (error) {
        console.error('Error fetching player from DB:', error);
        return null;
    }
}
const getPlayerRankByPlayerId = async (playerId) => {
    try {
        const player = await Player.findById(playerId);
        if (!player) {
            return null;
        }
        const count = await Player.countDocuments({ score: { $gt: player.score }, gameId: player.gameId });
        return count + 1;
    } catch (error) {
        console.error('Error fetching player rank from DB:', error);
        return null;
    }
}
const getPlayerByUserIdAndGameId = async (userId,gameId) => {
    try {
        const cachedPlayer = await getFromCache(`playerbyuseridandgameid - ${userId} - ${gameId}`);
        if (cachedPlayer) {
            return cachedPlayer;
        }
        const player = await Player.findOne({ userId, gameId });
        setToCache(`playerbyuseridandgameid - ${userId} - ${gameId}`,player)
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
        setToCache(`playerbyuseridandgameid - ${newPlayer.userId} - ${newPlayer.gameId}`,newPlayer)
        //setToCache("playerbyusername",newPlayer.username,newPlayer)
        return newPlayer;
    } catch (error) {
        console.error('Error adding player to DB:', error);
        return null;
    }
}

const updatePlayer = async (player) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(player._id, player, { new: true });
        setToCache(`playerbyuseridandgameid - ${updatedPlayer.userId} - ${updatedPlayer.gameId}`,updatedPlayer)
        //setToCache("playerbyusername",updatedPlayer.username,updatedPlayer)
        await addPlayerToLeaderboard(player.gameId,player.score,player.userId)
        return updatedPlayer;
    } catch (error) {
        console.error('Error updating player in DB:', error);
        return null;
    }
}

const getPlayerRankByUserId = async (id) => {
    try {
        const cachedRanks = await getRanksByUserId(id);
        if (cachedRanks) {
            return cachedRanks;
        }
        const ranks = {};
        const gameIds = await getGameIds();
        for (const gameIdKey of gameIds) {
            const gameId = gameIdKey.split(':')[1];
            const player = await getPlayerByUserIdAndGameId(id, gameId);
            if (player) {
                const score = player.score;
                const count = await Player.countDocuments({ score: { $gt: score }, gameId: gameId });
                ranks[gameId] = count + 1;
            }
        }
        return ranks;
    } catch (error) {
        console.error('Error getting player rank from DB:', error);
        return null;
    }
}

const getGameIds = async () => {
    try {
        const keys = await Player.distinct('gameId');
        return keys.map(key => `leaderboard:${key}`);
    } catch (error) {
        console.error('Error getting leaderboard keys from DB:', error);
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

export { getPlayerByUserIdAndGameId,addPlayer,updatePlayer,getPlayerRankByUserId ,getPlayerZScoreByUserId,getTopPlayerList,getPlayersByUserId};