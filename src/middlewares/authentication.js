import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'] || '';
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.baseUserId = decoded._id;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        next(err);
    }
};
