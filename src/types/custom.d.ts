import { Request } from "express";
import { Types } from "mongoose"; // If you're using MongoDB

// Define the user object structure
export interface AuthenticatedUser {
  userId: string; // Required field
  _id: Types.ObjectId;
  feeAmount?: number;
  isSuperAdmin?: boolean;
}

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser; // Ensure it's exported
}
