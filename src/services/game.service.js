import Player from '../models/player.model.js';
import { getLeaderboardKeys } from '../helpers/redis.helper.js';

export const getGameIds = async () => {
    try {
        const keys = await getLeaderboardKeys();
        if (keys.length !== 0) {
            return keys.map(key => key.split(':')[1]);
        }
        const players = await Player.distinct('gameId');
        return players;
    } catch (error) {
        console.error('Error getting leaderboard keys from Redis:', error);
        return null;
    }
}
