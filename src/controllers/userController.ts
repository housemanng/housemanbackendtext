import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from "../utils/asyncHandler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import JWT for token generation



// Error Handling Helper Function
const handleError = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  res.status(400).json({ error: message });
};



// First, let's modify the getUserById function to include housemate history
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Find the user and populate all necessary fields
    const user = await User.findById(id)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .select("-password") // Exclude password field
      

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }


   // Return the user, populated fields, and review statistics
   res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
   
      
    },
    });
  } catch (error) {
    handleError(res, error);
  }
});





export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide all fields: currentPassword, newPassword, confirmPassword");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("New password and confirm password do not match");
  }

  // Find the user
  // const user = await User.findById(userId);
  // if (!user) {
  //   res.status(404);
  //   throw new Error("User not found");
  // }


  const user = await User.findById(userId);
if (!user) {
  console.log("User not found!");
  res.status(404);
  throw new Error("User not found");
}
  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }



  // Hash new password (DO NOT rely on pre("save"))
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  console.log("New Password:", newPassword);
  console.log("Hashed Password:", hashedPassword);
// ✅ Log before saving
console.log("Before Saving - Password in DB:", user.password);

  // Update user password
  user.password = newPassword; // ✅ Just assign the plain password
  await user.save(); // ✅ Mongoose will hash it in pre("save")
// ✅ Log after saving
console.log("After Saving - Password in DB:", user.password);


  const updatedUser = await User.findById(userId);
  console.log("Stored Password Hash:", updatedUser?.password);
  console.log("Checking with bcrypt:", await bcrypt.compare(newPassword, updatedUser?.password!));



  // Verify new password
  const isNewPasswordValid = await bcrypt.compare(newPassword, user.password);
  console.log("Is New Password Valid?", isNewPasswordValid); // Should return true

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }

  // Generate new token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRE || '30d') as any });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token,
  });
});


  
  export const updatePhoneNumber = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { phone_number } = req.body;
  
    if (!phone_number) {
      return res.status(400).json({ message: "Phone number is required." });
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { phone_number: phone_number }, // Use the correct field name
        { new: true } // Return the updated user
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ message: "Phone number updated successfully.", user: updatedUser });
    } catch (error) {
      console.error("Failed to update phone number:", error);
      res.status(500).json({ message: "Failed to update phone number." });
    }
  });



export const updateEmail = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Email updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Failed to update email:", error);
    res.status(500).json({ message: "Failed to update email." });
  }
});



// Get all users
export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
      .select('-password') // Exclude password field
      .lean(); // Convert to plain JavaScript objects for better performance

    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: "Error fetching users", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});





export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};









