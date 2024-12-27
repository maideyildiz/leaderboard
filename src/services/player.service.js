import Player from '../models/player.model.js';

const getPlayerByUserIdFromDb = async (userId) => {
    try {
        const player = await Player.findById({ userId });
        return player;
    } catch (error) {
        console.error('Error fetching player from DB:', error);
        return null;
    }
}

const addPlayerToDb = async (player) => {
    try {
        const newPlayer = new Player(player);
        await newPlayer.save();
        return newPlayer;
    } catch (error) {
        console.error('Error adding player to DB:', error);
        return null;
    }
}

const updatePlayerInDb = async (id, player) => {
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(id, player, { new: true });
        return updatedPlayer;
    } catch (error) {
        console.error('Error updating player in DB:', error);
        return null;
    }
}

const getPlayerRankFromDb = async (score) => {
    try {
        const count = await Player.countDocuments({ score: { $gt: score } });
        return count + 1;
    } catch (error) {
        console.error('Error getting player rank from DB:', error);
        return null;
    }
}

export { getPlayerByUserIdFromDb,addPlayerToDb,updatePlayerInDb,getPlayerRankFromDb };