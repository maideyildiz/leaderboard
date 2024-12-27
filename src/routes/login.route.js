import express from 'express';
const router = express.Router();
import { login } from '../controller/login.controller.js';


router.post('/', (req, res, next) => login(req, res, next));

export default router;