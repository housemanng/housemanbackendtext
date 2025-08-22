import express from "express";
import {
  
  createAdmin,
  fetchAdmins,

  loginAdmin,
  logoutAdmin,

} from "../controllers/adminController";
import {  authMiddleware, isSuperAdmin } from "../middleware/authMiddleware"; // Assuming you have authentication middleware
import { RequestHandler } from 'express';
// import { getAllUsers } from "../controllers/userController";


const router = express.Router();

// Create an admin (only super admin can do this)
router.post("/create-admin", authMiddleware as RequestHandler, createAdmin as RequestHandler);

// Fetch all admins
router.get("/admins", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, fetchAdmins as RequestHandler);

// Admin login
router.post("/login", loginAdmin as RequestHandler);

// Get an admin by ID (only accessible to super admins or the admin themselves)
router.get("/logout", authMiddleware as RequestHandler, logoutAdmin as RequestHandler);


export default router;