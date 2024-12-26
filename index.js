import express from 'express';
import connectMongoDB from './src/database/Mongo.database.js';
import { redisClient,connectRedis } from './src/database/redis.database.js';
import player from './src/models/player.model.js';

const app = express()
app.use(express.json())

await connectMongoDB()
await connectRedis()
await redisClient.flushAll();


app.post('/leaderboard/submit-score', async (req, res) => {
  try {
    const { userId, score, gameId } = req.body
    let updateScore = true
    const cachedScore = await redisClient.zScore('leaderboard', userId)
    if (cachedScore) {
      if (score > cachedScore) {
        const result = await player.updateOne({ userId }, { score })
        if (result.modifiedCount === 1) {
          const cachedPlayer = await redisClient.get(`player:${userId}`)
          if(cachedPlayer){
            await redisClient.set(`player:${userId}`, JSON.stringify({ userId, userName: cachedPlayer.userName, score, gameId }))
          }
        }
      }else{
        updateScore = false
      }
    } else {
      const existingPlayer = await player.findOne({ userId })
      if (existingPlayer && score > existingPlayer.score) {
          await player.updateOne({ userId, gameId }, { score })
          await redisClient.set(`player:${userId}`, JSON.stringify({ userId, userName: existingPlayer.userName, score, gameId }))
      } else {
        const playerCountFromRedis = await redisClient.get('player:count')
        const playerCount = playerCountFromRedis ? parseInt(playerCountFromRedis) : await player.countDocuments({})
        const userName = `player${playerCount + 1}`

        await player.create({ userId, userName, score, gameId })
        await redisClient.set(`player:${userId}`, JSON.stringify({ userId, userName, score, gameId }));
      }
    }
    if(updateScore){
    await redisClient.zAdd('leaderboard', {
      score,
      value: userId,
    })}

    const rank = await redisClient.zRevRank('leaderboard', userId) + 1
    res.status(200).json({userId,gameId, score,rank: rank})

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

async function getPlayerName(userId) {
  const cachedPlayer = await redisClient.hGet('playerNames', userId);
  if (cachedPlayer) {
    return cachedPlayer;
  }

  const player = await redisClient.get(`player:${userId}`);
  const playerName = player ? JSON.parse(player).userName : `Unknown User`;

  await redisClient.hSet('playerNames', userId, playerName)
  await redisClient.expire('playerNames', 7200)

  return playerName;
}

app.get('/leaderboard/top', async (req, res) => {
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

    let leaderboard = await redisClient.zRangeWithScores('leaderboard', start, end, { REV: true });

    if (!leaderboard || leaderboard.length === 0) {
      const topPlayersFromDB = await player.find().sort({ score: -1 }).limit(limit);

      if (topPlayersFromDB.length > 0) {
        const redisEntries = topPlayersFromDB.map(player => ({
          score: player.score,
          value: player.userId,
        }));

        await redisClient.zAdd('leaderboard', redisEntries);

        leaderboard = redisEntries;
      } else {
        return res.status(404).json({ message: 'No leaderboard data found in the database.' });
      }
    }

    const totalPlayers = await redisClient.zCard('leaderboard');
    if(page > totalPlayers){
      page=totalPlayers
      start=(totalPlayers-1)*limit
      end = start + limit - 1;
    }
    const totalPages = Math.ceil(totalPlayers / limit);

    const leaderboardWithRank = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const userName = await getPlayerName(entry.value);
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
    res.status(500).json({ message: error.message });
  }
});


app.get('/leaderboard/rank', async (req, res) => {
  try {
    const userId = req.query?.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let rank, score;

    const cachedScore = await redisClient.zScore('leaderboard', userId);
    if (cachedScore !== null) {
      rank = await redisClient.zRevRank('leaderboard', userId) + 1;
      score = cachedScore;
    } else {
      const playerData = await player.findOne({ userId });
      if (!playerData) {
        return res.status(404).json({ message: 'Player not found' });
      }

      score = playerData.score;

      rank = (await player.countDocuments({ score: { $gt: playerData.score } })) + 1;

      await redisClient.zAdd('leaderboard', { score: playerData.score, value: userId });
    }

    res.status(200).json({ userId, rank, score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.listen(3000)