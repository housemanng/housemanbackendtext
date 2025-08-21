import express from "express";
import {
  changeAdminPassword,
  createAdmin,
  fetchAdmins,
  getAdmin,
  getAdminLoginHistory,
  loginAdmin,
  logoutAdmin,
  removeAdmin,
  updateAdmin,
} from "../controllers/adminController";
import {  authMiddleware, isAdmin, isSuperAdmin } from "../middleware/authMiddleware"; // Assuming you have authentication middleware
import { RequestHandler } from 'express';
// import { getAllUsers } from "../controllers/userController";


const router = express.Router();

// Create an admin (only super admin can do this)
router.post("/create-admin", authMiddleware as RequestHandler, createAdmin as RequestHandler);

// Fetch all admins
router.get("/admins", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, fetchAdmins as RequestHandler);

// Remove an admin (only super admin can do this)
router.delete("/remove-admin/:id", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, removeAdmin as RequestHandler);

// Get admin login history by ID endpoint
router.get("/:id/login-history", getAdminLoginHistory as RequestHandler, isSuperAdmin as RequestHandler,isAdmin as RequestHandler);


// Admin login
router.post("/login", loginAdmin as RequestHandler);

// Update an admin (only super admin can do this)
router.put("/update-admin/:id", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, updateAdmin as RequestHandler);

// Get an admin by ID (only accessible to super admins or the admin themselves)
router.get("/get-admin/:id", authMiddleware as RequestHandler, getAdmin as RequestHandler);

// Get an admin by ID (only accessible to super admins or the admin themselves)
router.get("/logout", authMiddleware as RequestHandler, logoutAdmin as RequestHandler);

// Routes accessible only to super admins
// router.post("/users", isAdmin as RequestHandler, isSuperAdmin as RequestHandler, getAllUsers as RequestHandler); // Create a user
router.put("/channge-admin-password/:id", authMiddleware as RequestHandler, isSuperAdmin as RequestHandler, changeAdminPassword as RequestHandler);



export default router;