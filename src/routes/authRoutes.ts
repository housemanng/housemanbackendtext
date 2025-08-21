import express from 'express';
import { signup, login } from '../controllers/authController';
import { RequestHandler } from 'express';

import { createAdmin, fetchSuperAdmins } from "../controllers/adminController";
import { authMiddleware, isSuperAdmin } from '../middleware/authMiddleware';



const router = express.Router();

// Authentication Routes
// Authentication Routes
router.post('/signup', signup as RequestHandler);
router.post('/login', login as RequestHandler);



// Only super admins can create admins
router.post("/admins", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, createAdmin as RequestHandler);

// Fetch all admins
// router.get("/admins", authMiddleware as RequestHandler, fetchAdmins as RequestHandler);

// Fetch all super admins
router.get("/super-admins", authMiddleware as RequestHandler, fetchSuperAdmins as RequestHandler);


export default router;
