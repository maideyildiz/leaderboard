import express from 'express';
const router = express.Router();
import { register } from '../controller/register.controller.js';


router.post('/', (req, res, next) => register(req, res, next));

export default router;