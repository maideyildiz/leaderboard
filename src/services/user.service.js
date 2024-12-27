import  User  from '../models/user.model.js';
import { setToCache  } from '../helpers/redis.helper.js';
const getUserByIdFromDb = async (id) => {
    try {
        const user = await User.findById(id);
        setToCache("user",id,user)
        return user;
    } catch (error) {
        console.error('Error fetching user from DB:', error);
        return null;
    }
}

const addUserToDb = async (user) => {
    try {
        const newUser = new User(user);
        await newUser.save();
        setToCache("user",newUser._id,newUser)
        return newUser;
    } catch (error) {
        console.error('Error adding user to DB:', error);
        return null;
    }
}

const updateUserInDb = async (id, user) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        setToCache("user",id,updatedUser)
        return updatedUser;
    } catch (error) {
        console.error('Error updating user in DB:', error);
        return null;
    }
}

const addPlayerToUser = async (userId, playerId) => {
    try {
        const user = await User.findById(userId);
        user.players.push(playerId);
        await user.save();
        setToCache("user",userId,user)
        return user;
    } catch (error) {
        console.error('Error adding player to user:', error);
        return null;
    }
}

export { getUserByIdFromDb,addUserToDb,updateUserInDb ,addPlayerToUser};