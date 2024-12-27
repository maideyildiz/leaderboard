import player from '../models/player.model.js';
import { getRank,addPlayerToLeaderboard,addPlayersToLeaderboard,getPlayerZScore,getFromCache,getLeaderboardRange,getLeaderboardCount   } from '../helpers/redis.helper.js';
import {getUserByIdFromDb} from '../services/user.service.js';
import { getPlayerByUserIdFromDb,addPlayerToDb,updatePlayerInDb,getPlayerRankFromDb } from '../services/player.service.js';
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

          let existingPlayer = getFromCache("player",userId)
          existingPlayer = !existingPlayer ? await getPlayerByUserIdFromDb(userId ) : existingPlayer
          if(!existingPlayer){
            let playerUser = await getFromCache("user",userId)
            playerUser= !playerUser ? await getUserByIdFromDb(userId) : playerUser
            if(!playerUser){
              return res.status(404).json({ message: 'User not found' });
            }
            var addedPlayer = await addPlayerToDb({ gameId, userId, score})
            await addPlayerToUser(playerUser._id,addedPlayer._id)
          }
          else if (existingPlayer && score > existingPlayer.score) {
              existingPlayer.score = score
              await updatePlayerInDb(existingPlayer._id, existingPlayer)
          }

        await addPlayerToLeaderboard(score, userId)
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
            let user = await getFromCache("user",entry.value);
            user = !user ? await getUserByIdFromDb(entry.value) : user
            let userName = !user ? `Unknown User` : user.userName
            return {
              rank: start + index + 1,
              username: userName,
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
        let userId = req.query?.userId;
        if (!userId) {
          userId=req.baseUserId
        }

        let rank, score;

        const cachedScore = await getPlayerZScore( userId);
        if (cachedScore !== null) {
          rank = await getRank(userId) + 1;
          score = cachedScore;
        } else {
          const playerData = await getPlayerByUserIdFromDb(userId);
          if (!playerData) {
            return res.status(404).json({ message: 'Player not found' });
          }

          score = playerData.score;

          rank = await getPlayerRankFromDb(playerData.score);

          await setPlayerZScore(playerData.score,userId);
        }

        res.status(200).json({ userId, rank, score });
    } catch (error) {
        next(error);
    }
};

export { submitScore ,getTopPlayers,getPlayerRank };
