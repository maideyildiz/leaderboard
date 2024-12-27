import bcrypt from 'bcrypt';
import user from '../models/user.model.js';
export async function register(req, res,next) {
    try{
        const { userName, password } = req.body;

        const existingUser = await user.findOne({ userName });
        if (existingUser) {
          return res.status(400).json({ error: 'Username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({ userName: userName, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });

    }
    catch (error) {
        next(error);
    }
}