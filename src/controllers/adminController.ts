import { Request, Response } from "express";
import AdminUser from "../models/AdminUser";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
//===================================================================================================================================================

// Admin login
export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { phone_number, password } = req.body;

  try {
    // Validate required fields
    if (!phone_number || !password) {
      return res.status(400).json({ message: "Phone number and password are required." });
    }

    // Find the admin by phone number
    const admin = await AdminUser.findOne({ phone_number });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }


    // Debug: Log the admin and password
    console.log("Admin found:", admin);
    console.log("Provided password:", password);
    console.log("Stored hashed password:", admin.password);

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: admin._id, isSuperAdmin: admin.isSuperAdmin },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRE || '30d') as any } // Use environment variable for expiration
    );



    // Return the token and admin details
    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        phone_number: admin.phone_number,
        isSuperAdmin: admin.isSuperAdmin,
        first_name: admin.first_name,
        middle_name: admin.middle_name,
        surname: admin.surname,
      },
    });
  } catch (error: any) {
    console.error("Error logging in admin:", error.message);
    res.status(500).json({ message: "Error logging in admin", error: error.message });
  }
});





export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, middle_name, surname, phone_number, password, role } = req.body;

  try {
    // Ensure the requester is authenticated and is a super admin
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: "Only super admins can create admins." });
    }

    // Validate required fields
    if (!first_name || !surname || !phone_number || !password || !role) {
      return res.status(400).json({ message: "First name, surname, phone number, password, and role are required." });
    }

    // Validate role
    if (role !== "admin" && role !== "superadmin") {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'super_admin'." });
    }

    // Check if the phone number already exists
    const existingAdmin = await AdminUser.findOne({ phone_number });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this phone number already exists." });
    }

    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Determine the role and set the appropriate boolean fields
    const isAdmin = role === "admin";
    const isSuperAdmin = role === "superadmin";

    // Create the admin user
    const adminUser = new AdminUser({
      first_name,
      middle_name,
      surname,
      phone_number,
      password,
      isAdmin,
      isSuperAdmin,
      createdBy: req.user._id, // ID of the super admin who created this admin
      // createdBy: req.user._id, // ID of the admin who created this admin
    });

    await adminUser.save();
    res.status(201).json({ message: "Admin user created successfully", adminUser });
  } catch (error: any) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ message: "Error creating admin user", error: error.message });
  }
});




// Fetch all admins
export const fetchAdmins = asyncHandler(async (_: Request, res: Response) => {
  try {
    const admins = await AdminUser.find({});
    res.status(200).json({ admins });
  } catch (error: any) {
    console.error("Error fetching admins:", error.message);
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
});



// Admin logout
export const logoutAdmin = asyncHandler(async (_: Request, res: Response) => {

  try {
    // const { id } = req.user as { id: string }; // Explicitly type `req.user`
    // Optionally, you can invalidate the token on the server side if needed
    // For example, by maintaining a blacklist of tokens (advanced implementation)
    // await AdminUser.findByIdAndUpdate(id, { lastLogin: new Date() });
    // For now, just send a success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    console.error("Error logging out admin:", error.message);
    res.status(500).json({ message: "Error logging out admin", error: error.message });
  }
});

















