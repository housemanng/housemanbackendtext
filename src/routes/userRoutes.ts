import express from 'express';
import { RequestHandler } from 'express';
import {

  changePassword,
  deleteUser,
  getAllUsers,
  getUserById,
  updateEmail,
  updatePhoneNumber,

} from '../controllers/userController';

import { authMiddleware, isAdmin, isSuperAdmin, protect } from "../middleware/authMiddleware";


const router = express.Router();
router.get('/:id', getUserById as RequestHandler);
router.get("/", authMiddleware as RequestHandler, isAdmin as RequestHandler, isSuperAdmin as RequestHandler, getAllUsers as RequestHandler); // Create a user
router.put("/:userId/change-password", protect as RequestHandler, changePassword as RequestHandler);
router.put('/:userId/phone', updatePhoneNumber as RequestHandler);
router.put('/:userId/email', updateEmail as RequestHandler);
router.delete('/:userId', deleteUser as RequestHandler);




export default router;


