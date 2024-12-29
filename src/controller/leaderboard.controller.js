import player from '../models/player.model.js';
import { getRank,addPlayersToLeaderboard,getLeaderboardRange,getLeaderboardCount ,addPlayerToLeaderboard  } from '../helpers/redis.helper.js';
import {getUserById,addPlayerToUser,updateUser} from '../services/user.service.js';
import { getPlayerByUserId,addPlayer,updatePlayer,getPlayerRankByUserId,getPlayerZScoreByUserId } from '../services/player.service.js';
const submitScore = async (req, res, next) => {
    try {
        const { score, gameId } = req.body
        let userId=req.baseUserId

        if (typeof score !== 'number' || !Number.isInteger(score)) {
            return res.status(400).json({ message: 'Score should be an integer' });
        }
        if (typeof gameId !== 'string') {
            return res.status(400).json({ message: 'GameId should be a string' });
        }

          const existingPlayer = await getPlayerByUserId(userId )
          const playerUser = await getUserById(userId)
          if(!playerUser){
            return res.status(404).json({ message: 'User not found' });
          }
          if (existingPlayer && score > existingPlayer.score) {
            existingPlayer.score = score
            await updatePlayer(existingPlayer)
            await updateUser(playerUser)
          }
          else if(!existingPlayer && playerUser){
            var addedPlayer = await addPlayer({ gameId, userId, score})
            await addPlayerToUser(playerUser._id,addedPlayer)
          }

        const rank = await getRank(userId)
        res.status(200).json({userId, gameId, score, rank: rank})

    } catch (error) {
        next(error);
    }
}

const getTopPlayers = async (req, res, next) => {
    try {
        let { limit = 10, page = 1 } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
          return res.status(400).json({ message: 'Invalid limit or page parameter' });
        }

        let start = (page - 1) * limit;
        let end = start + limit - 1;

        console.log(`start: ${start}, end: ${end}, limit: ${limit}, page: ${page}`);

        let leaderboard = await getLeaderboardRange(start, end);

        if (!leaderboard || leaderboard.length === 0) {
          const topPlayersFromDB = await player.find().sort({ score: -1 }).limit(limit);

          if (topPlayersFromDB.length > 0) {
            const redisEntries = topPlayersFromDB.map(player => ({
              score: player.score,
              value: player.userId,
            }));

            await addPlayersToLeaderboard( redisEntries);

            leaderboard = redisEntries;
          } else {
            return res.status(404).json({ message: 'No leaderboard data found in the database.' });
          }
        }

        const totalPlayers = await getLeaderboardCount('leaderboard');
        if(page > totalPlayers){
          page=totalPlayers
          start=(totalPlayers-1)*limit
          end = start + limit - 1;
        }
        const totalPages = Math.ceil(totalPlayers / limit);

        const leaderboardWithRank = await Promise.all(
          leaderboard.map(async (entry, index) => {
            console.log(entry);
            console.log(entry.value);
            console.log(index);
            const user = await getUserById(entry.value);
            let username = !user ? `Unknown User` : user.username
            return {
              rank: start + index + 1,
              username: username,
              score: entry.score,
            };
          })
        );

        res.status(200).json({
          leaderboard: leaderboardWithRank,
          total: totalPlayers,
          currentPage: page,
          totalPages,
        });
    } catch (error) {
        next(error);
    }
}


const getPlayerRank = async (req, res, next) => {
    try {
        let username = req.query?.username;
        let userId = 0;
        let rank, score;

        if(username){
          let rankUser = await await getUserByUsername(username)
          userId = rankUser._id
        }

        if (userId>0) {
          const playerData = await getPlayerByUserId(userId);
          if (!playerData) {
            return res.status(404).json({ message: 'Player not found' });
          }
          const cachedScore = await getPlayerZScoreByUserId(userId);
          if (cachedScore !== null) {
            rank = await getPlayerRankByUserId(userId);
            score = cachedScore;
          } else {
            score = playerData.score;
            rank = await getPlayerRankByUserId(playerData._id);

            await addPlayerToLeaderboard(playerData.score,userId);
          }
        }
        else{
          return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ userId, rank, score });
    } catch (error) {
        next(error);
    }
};

export { submitScore ,getTopPlayers,getPlayerRank };
