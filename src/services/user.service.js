import  User  from '../models/user.model.js';
import { setToCache,getFromCache,addPlayerToLeaderboard } from '../helpers/redis.helper.js';
const getUserById = async (id) => {
    try {
        const cachedUser = await getFromCache(`userid - ${id}`);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await User.findById(id);
        if (user) {
            setToCache(`userid - ${id}`,user)
            setToCache(`username - ${user.username}`,user)
        }
        return user;
    } catch (error) {
        console.error('Error fetching user from DB:', error);
        return null;
    }
}

const getUserByUsername = async (username) => {
    try {
        const cachedUser = await getFromCache(`username - ${username}`);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await User.findOne({ username })
        if (user) {
            setToCache(`userid - ${user._id}`,user)
            setToCache(`username - ${user.username}`,user)
        }
        return user;
    } catch (error) {
        console.error('Error fetching user by username from DB:', error);
        return null;
    }
}

const addUser = async (user) => {
    try {
        const newUser = new User(user);
        await newUser.save();
        setToCache(`userid - ${newUser._id}`,newUser)
        setToCache(`username - ${newUser.username}`,newUser)
        return newUser;
    } catch (error) {
        console.error('Error adding user to DB:', error);
        return null;
    }
}

const updateUser = async (user) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, user, { new: true });
        setToCache(`userid - ${updatedUser._id}`,updatedUser)
        setToCache(`username - ${updatedUser.username}`,updatedUser)
        return updatedUser;
    } catch (error) {
        console.error('Error updating user in DB:', error);
        return null;
    }
}

const addPlayerToUser = async (userId, player) => {
    try {
        if (!userId || !player || !player._id) {
            throw new Error('Invalid userId or player data');
        }

        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!Array.isArray(user.players)) {
            user.players = [];
        }

        user.players.push(player._id);

        await updateUser(user);

        await addPlayerToLeaderboard(player.gameId, player.score, userId);

        return user;
    } catch (error) {
        console.error('Error adding player to user:', error);
        return null;
    }
}
export { getUserById,getUserByUsername,addUser,updateUser ,addPlayerToUser};