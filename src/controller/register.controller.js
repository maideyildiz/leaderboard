import { ERRORS, SUCCESS } from '../constants/response.js';
import bcrypt from 'bcrypt';
import user from '../models/user.model.js';
import {getUserByUsername,addUser} from '../services/user.service.js';
export async function register(req, res,next) {
    try{
        const { username, password } = req.body;
        if(!username || !password){
            return res.status(400).json({ error: ERRORS.USERNAME_PASSWORD_REQUIRED });
        }

        const existingUser = await getUserByUsername( username );
        if (existingUser) {
          return res.status(400).json({ error: ERRORS.USERNAME_ALREADY_IN_USE });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({ username: username, password: hashedPassword });
        await addUser(newUser)

        res.status(201).json({ message: SUCCESS.USER_REGISTERED });

    }
    catch (error) {
        next(error);
    }
}