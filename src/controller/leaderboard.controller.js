import { getPlayerRankByUserIdAndGameId  } from '../helpers/redis.helper.js';
import { getUserById,addPlayerToUser,updateUser,getUserByUsername} from '../services/user.service.js';
import { getPlayerByUserIdAndGameId,getPlayersRanksByUserId,addPlayer,updatePlayer,getLeaderboardWithRank} from '../services/player.service.js';
import { getGameIds } from '../services/game.service.js';
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

    const gameIds = await getGameIds('leaderboard:*');
    const totalPlayers = gameIds.length;

    const leaderboardWithRank = await getLeaderboardWithRank(limit);

    const totalPages = Math.ceil(totalPlayers / limit);

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
        const playerData = await getPlayersRanksByUserId(userId);
        if (!playerData) {
          return res.status(404).json({ message: ERRORS.PLAYER_NOT_FOUND });
        }

        return res.status(200).json(playerData);
    } catch (error) {
        next(error);
    }
};

export { submitScore ,getTopPlayers,getPlayerRank };
