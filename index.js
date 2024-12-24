import express from 'express';
import connectMongoDB from './src/database/Mongo.database.js';
import player from './src/models/player.model.js';

const app = express()
app.use(express.json())

await connectMongoDB()


app.post('/leaderboard/submit-score', async (req, res) => {
  try {
    const {userId,score,gameId}=req.body
    const existingPlayer = await player.findOne({ userId, gameId });
    if (existingPlayer) {
      if (score > existingPlayer.score) {
        await player.updateOne({ userId, gameId }, { score });
      }
      const playerData = await player.findOne({ userId, gameId });
      return res.status(200).json({ playerData })
    } else {
      const newPlayer = await player.create({ userId, score, gameId });
      return res.status(200).json({ playerData: newPlayer })
    }

  } catch (error) {
    res.status(500).json({message:error.message})
  }
})

app.get('/leaderboard/top', async (req, res) => {
  try {
    console.log(req.params);
    const { limit, page } = req.query;
    const offset = (page - 1) * limit;
    const playerData = await player.find({ })
      .sort({ score: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    res.status(200).json({ playerData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/leaderboard/rank', async (req, res) => {
  try {
    const userId=req.query?.userId
    const playerData = await player.find({userId})
    res.status(200).json({ playerData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.listen(3000)