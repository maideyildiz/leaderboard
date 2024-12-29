import { ERRORS, SUCCESS } from '../constants/response.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'] || '';
        if (!token) {
            return res.status(401).json({ message: ERRORS.ACCESS_DENIED });
        }
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.baseUserId = decoded._id;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: ERRORS.INVALID_TOKEN });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: ERRORS.TOKEN_EXPIRED });
        }
        next(err);
    }
};
