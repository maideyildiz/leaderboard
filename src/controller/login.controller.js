import { ERRORS } from '../constants/response.js';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import {getUserByUsername} from '../services/user.service.js';
import { getJwtToken } from '../helpers/jwt.helper.js';
config();
export async function login(req, res,next) {
    try{
        const { username, password } = req.body;
        if(!username || !password){
            return res.status(400).json({ error: ERRORS.USERNAME_PASSWORD_REQUIRED });
        }

        const existingUser = await getUserByUsername( username );
        if (!existingUser) {
            return res.status(404).json({ message: ERRORS.USER_NOT_FOUND });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: ERRORS.INVALID_CREDENTIALS });
        }

        const token = getJwtToken(existingUser._id);

        res.status(200).json({ token });
    }
    catch (error) {
        next(error);
    }
}