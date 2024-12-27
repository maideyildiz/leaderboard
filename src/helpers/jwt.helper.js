import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();
export const getJwtToken = (_id) => {
    const token = jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    return token;
};