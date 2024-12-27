import express from 'express';
const router = express.Router();
import { submitScore,getTopPlayers,getPlayerRank } from '../controller/leaderboard.controller.js';


router.post('/submit-score', (req, res, next) => submitScore(req, res, next));

router.get('/top', (req, res, next) => getTopPlayers(req, res, next));

router.get('/rank', (req, res, next) => getPlayerRank(req, res, next));

export default router;