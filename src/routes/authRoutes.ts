import express from 'express';
import { signup, login } from '../controllers/authController';
import { RequestHandler } from 'express';


const router = express.Router();

// Authentication Routes
router.post('/signup', signup as RequestHandler);
router.post('/login', login as RequestHandler);

export default router;
