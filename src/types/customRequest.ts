
import { Types } from "mongoose"; // If you're using MongoDB ObjectIds

// Define the structure of the user object
export interface AuthenticatedUser {
  userId: string; // Ensure this exists, as your error indicated it was missing
  _id: Types.ObjectId;
  feeAmount?: number;
  isSuperAdmin?: boolean;
}

