import { getRank,getLeaderboardCount ,addPlayerToLeaderboard  } from '../helpers/redis.helper.js';
import {getUserById,addPlayerToUser,updateUser,getUserByUsername} from '../services/user.service.js';
import { getPlayerByUserId,addPlayer,updatePlayer,getPlayerRankByUserId,getPlayerZScoreByUserId ,getTopPlayerList} from '../services/player.service.js';
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

          const existingPlayer = await getPlayerByUserId(userId )
          const playerUser = await getUserById(userId)
          if(!playerUser){
            return res.status(404).json({ message: ERRORS.USER_NOT_FOUND });
          }
          if (existingPlayer) {
            if (score <= existingPlayer.score) {
              return res.status(204).json({ message: ERRORS.SCORE_SAME });
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
              await addPlayerToUser(playerUser._id,addedPlayer)
            }
          }

        return res.status(200).json({
          userId,
          gameId,
          score,
          rank: await getRank(userId),
          message: existingPlayer ? SUCCESS.SCORE_UPDATED : SUCCESS.PLAYER_ADDED,
        });
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
        return res.status(400).json({ message: ERRORS.INVALID_LIMIT_OR_PAGE });
      }

      let start = (page - 1) * limit;
      let end = start + limit - 1;

      let leaderboard = await getTopPlayerList(start, end,limit);

      if (!leaderboard || leaderboard.length === 0) {
        return res.status(404).json({ message: ERRORS.NO_LEADERBOARD_DATA });
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
          const user = await getUserById(entry.value);
          let username = !user ? 'Unknown User' : user.username
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
        let rank,score;

        if (!username) {
          return res.status(400).json({ message: ERRORS.USERNAME_REQUIRED });
        }

        const rankUser = await getUserByUsername(username)
        if (!rankUser) {
          return res.status(404).json({ message: ERRORS.USER_NOT_FOUND });
        }
        const userId = rankUser._id
        const playerData = await getPlayerByUserId(userId);
        if (!playerData) {
          return res.status(404).json({ message: ERRORS.PLAYER_NOT_FOUND });
        }
        const cachedScore = await getPlayerZScoreByUserId(userId);
        if (!cachedScore) {
          score = playerData.score
          await addPlayerToLeaderboard(playerData.score,userId)
        } else {
          score = cachedScore;
        }
        rank = await getPlayerRankByUserId(userId);
        if(!rank){
          return res.status(404).json({ message: ERRORS.PLAYER_RANK_NOT_FOUND });
        }

        return res.status(200).json({ userId, rank, score });
    } catch (error) {
        next(error);
    }
};

export { submitScore ,getTopPlayers,getPlayerRank };
