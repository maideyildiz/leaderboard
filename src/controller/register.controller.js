import bcrypt from 'bcrypt';
import user from '../models/user.model.js';
import {getUserByUsername,addUser} from '../services/user.service.js';
export async function register(req, res,next) {
    try{
        const { username, password } = req.body;
        if(!username || !password){
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await getUserByUsername( username );
        if (existingUser) {
          return res.status(400).json({ error: 'Username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new user({ username: username, password: hashedPassword });
        await addUser(newUser)

        res.status(201).json({ message: 'User registered successfully' });

    }
    catch (error) {
        next(error);
    }
}