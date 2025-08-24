import { Request, Response } from "express";
import User, { IUser } from "../models/User"; // Import the IUser interface
import { generateToken } from "../utils/jwtUtils";
import asyncHandler from "../utils/asyncHandler";

// Function to generate a UVC Code in the format ABC123456


// Signup a new user
export const signup = asyncHandler(async (req: Request, res: Response) => {
  try {
    let { phone_number, email, password, occupation, sex } = req.body;

    // Validate phone_number
    if (!phone_number || typeof phone_number !== "string") {
      return res.status(400).json({ error: "Phone number is required and must be a string." });
    }
    phone_number = phone_number.trim().replace(/\s/g, ""); // Remove all spaces
    if (!phone_number.match(/^\d{10}$/)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits with no spaces." });
    }

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required and must be a string." });
    }
    email = email.trim();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Validate password
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required and must be a string." });
    }
    password = password.trim();
    if (!password) {
      return res.status(400).json({ error: "Password cannot be empty." });
    }
    if (password.length > 10) {
      return res.status(400).json({ error: "Password must not be more than 10 characters." });
    }

    

    // Validate occupation (optional)
    if (occupation && typeof occupation !== "string") {
      return res.status(400).json({ error: "Occupation must be a string." });
    }
    if (occupation && occupation.length > 15) {
      return res.status(400).json({ error: "Occupation must not be more than 15 characters." });
    }

    // Validate sex (optional)
    const allowedSexValues = ["male", "female"];
    if (sex && (typeof sex !== "string" || !allowedSexValues.includes(sex))) {
      return res.status(400).json({ error: "Sex must be one of: male, female, other." });
    }

    // Check if phone number is blacklisted
    const blacklistedUser = await User.findOne({
      $or: [
        { phone_number, isBlacklist: true },
        { email, isBlacklist: true }
      ]
    });

    if (blacklistedUser) {
      return res.status(403).json({
        error: "This account is blacklisted",
     
       
      });
    }

    // Check if the user already exists (by email or phone number)
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const existingPhoneUser = await User.findOne({ phone_number });
    if (existingPhoneUser) {
      return res.status(400).json({ error: "User with this phone number already exists." });
    }



    // Create a new user with the generated UVC Code, role, occupation, and sex
    const user: IUser = new User({ phone_number, email, password, occupation, sex });
    await user.save();

  
   

    // Generate a JWT token
    const token = generateToken(user._id.toString());

    // Return the user and token (excluding sensitive data like password)
    const userResponse = { ...user.toObject(), password: undefined };
    res.status(201).json({ user: userResponse, token });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Handle duplicate key error explicitly
      if (error.message.includes("E11000 duplicate key error")) {
        if (error.message.includes("email_1")) {
          return res.status(400).json({ error: "Email is already in use." });
        }
        if (error.message.includes("phone_number_1")) {
          return res.status(400).json({ error: "Phone number is already in use." });
        }
        return res.status(400).json({ error: "Duplicate key error. Please check your input" });
      }
      // Handle other errors
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred." });
    }
  }
});










// Login an existing user with phone number and password
export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { phone_number, password } = req.body;

    // Validate phone number and password
    if (!phone_number || typeof phone_number !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    // Check if the user exists
    const user = await User.findOne({ phone_number });
    if (!user) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

  

    // Ensure comparePassword function exists
    if (typeof user.comparePassword !== "function") {
      return res.status(500).json({ error: "Password validation function missing." });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    // Generate a JWT token
    const token = generateToken(user._id.toString());

    // Return the user and token (excluding sensitive data like password)
    const userResponse = { ...user.toObject(), password: undefined };
    res.status(200).json({ 
      user: userResponse, 
      token, 
      userId: user._id,
     
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred." });
    }
  }
});