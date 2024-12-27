import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import user from '../models/user.model.js';
import { getJwtToken } from '../helpers/jwt.helper.js';
config();
export async function login(req, res,next) {
    try{
        const { userName, password } = req.body;
        const existingUser = await user.findOne({ userName });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = getJwtToken(existingUser._id);

        res.status(200).json({ token });
    }
    catch (error) {
        next(error);
    }
}