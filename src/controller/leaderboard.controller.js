import { getPlayerRankByUserIdAndGameId ,getLeaderboardKeys ,getLeaderboardRange } from '../helpers/redis.helper.js';
import {getUserById,addPlayerToUser,updateUser,getUserByUsername} from '../services/user.service.js';
import { getPlayerByUserIdAndGameId,getPlayersByUserId,addPlayer,updatePlayer} from '../services/player.service.js';
import { ERRORS, SUCCESS } from '../constants/response.js';
const submitScore = async (req, res, next) => {
    try {
        const { score, gameId } = req.body
        let userId=req.baseUserId

        if (!userId) {
          return res.status(400).json({ message: ERRORS.USER_ID_REQUIRED });
        }
        if (typeof score !== 'number' || !Number.isInteger(score)) {
            return res.status(400).json({ message: ERRORS.SCORE_INVALID });
        }
        if (typeof gameId !== 'string') {
            return res.status(400).json({ message: ERRORS.GAME_ID_INVALID });
        }

          const existingPlayer = await getPlayerByUserIdAndGameId(userId,gameId)
          const playerUser = await getUserById(userId)
          if(!playerUser){
            return res.status(404).json({ message: ERRORS.USER_NOT_FOUND });
          }
          if (existingPlayer) {
            if (score <= existingPlayer.score) {
              return res.status(200).json({ message: SUCCESS.SCORE_SAME });
            }
            else if (score > existingPlayer.score) {
              existingPlayer.score = score
              await updatePlayer(existingPlayer)
              await updateUser(playerUser)
            }
          }
          else{
            var addedPlayer = await addPlayer({ gameId, userId, score})
            if(!addedPlayer){
              return res.status(404).json({ message: ERRORS.PLAYER_NOT_FOUND });
            }else {
              await addPlayerToUser(userId,addedPlayer)
            }
          }

        return res.status(200).json({
          userId,
          gameId,
          score,
          rank: await getPlayerRankByUserIdAndGameId(userId,gameId),
          message: existingPlayer ? SUCCESS.SCORE_UPDATED : SUCCESS.PLAYER_ADDED,
        });
    } catch (error) {
        next(error);
    }
}


const getTopPlayers = async (req, res, next) => {
  try {
      let { limit = 3, page = 1 } = req.query;

      limit = parseInt(limit);
      page = parseInt(page);

      if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
        return res.status(400).json({ message: ERRORS.INVALID_LIMIT_OR_PAGE });
      }

      const gameIds = await getLeaderboardKeys('leaderboard:*');

      const leaderboardWithRank = {};

      for (const gameIdKey of gameIds) {
        const gameId = gameIdKey.split(':')[1];

        const leaderboard = await getLeaderboardRange(gameIdKey, 0, limit - 1, 'WITHSCORES');

        leaderboardWithRank[gameId] = await Promise.all(
          leaderboard.map(async (entry, index) => {
            const user = await getUserById(entry.value);
            const username = user ? user.username : 'Unknown User';
            return {
              rank: index + 1,
              username: username,
              score: entry.score,
            };
          })
        );
      }

      const totalPlayers = gameIds.length;
      const totalPages = 1;  // Since we are only showing top 3, totalPages would be 1

      res.status(200).json({
        leaderboard: leaderboardWithRank,
        total: totalPlayers,
        currentPage: page,
        totalPages,
      });
  } catch (error) {
      next(error);
  }
};



const getPlayerRank = async (req, res, next) => {
    try {
        let username = req.query?.username;

        if (!username) {
          return res.status(400).json({ message: ERRORS.USERNAME_REQUIRED });
        }

        const rankUser = await getUserByUsername(username)
        if (!rankUser) {
          return res.status(404).json({ message: ERRORS.USER_NOT_FOUND });
        }
        const userId = rankUser._id
        const playerData = await getPlayersByUserId(userId);
        if (!playerData) {
          return res.status(404).json({ message: ERRORS.PLAYER_NOT_FOUND });
        }

        return res.status(200).json(playerData);
    } catch (error) {
        next(error);
    }
};

export { submitScore ,getTopPlayers,getPlayerRank };
