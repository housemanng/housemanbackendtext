import { Request, Response } from "express";
import AdminUser from "../models/AdminUser";
import bcrypt from "bcryptjs";
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


    // Get the user's IP address and device info
    const ip = req.ip || req.socket.remoteAddress || "::1";
    const device = req.headers['user-agent'] || 'Unknown Device';

    // Add login history entry (without geolocation)
    admin.loginHistory.push({
      timestamp: new Date(),
      device,
      ip,
      country: "Unknown",
      state: "Unknown", 
      city: "Unknown",
      location: "Unknown", // Simplified location tracking
    });
    await admin.save();

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








export const getAdminLoginHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // Get the admin ID from the request parameters

  try {
    // Validate the admin ID
    if (!id) {
      return res.status(400).json({ message: "Admin ID is required." });
    }

    // Find the admin by ID
    const admin = await AdminUser.findById(id).select("loginHistory"); // Only fetch the loginHistory field
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Return the login history
    res.status(200).json({
      message: "Login history retrieved successfully",
      loginHistory: admin.loginHistory,
    });
  } catch (error: any) {
    console.error("Error fetching login history:", error.message);
    res.status(500).json({ message: "Error fetching login history", error: error.message });
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












// Remove an admin (only super admin can do this)
export const removeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Ensure user is authenticated and is a super admin
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: "Only super admins can remove admins." });
    }

    // Find and delete the admin
    const deletedAdmin = await AdminUser.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    res.status(200).json({ message: "Admin removed successfully", deletedAdmin });
  } catch (error: any) {
    console.error("Error removing admin:", error.message);
    res.status(500).json({ message: "Error removing admin", error: error.message });
  }
});













// Fetch all super admins
export const fetchSuperAdmins = asyncHandler(async (_: Request, res: Response) => {
  try {
    const superAdmins = await AdminUser.find({ isSuperAdmin: true });
    res.status(200).json({ superAdmins });
  } catch (error: any) {
    console.error("Error fetching super admins:", error.message);
    res.status(500).json({ message: "Error fetching super admins", error: error.message });
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





export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // ID of the admin to update
  const { first_name, middle_name, surname, phone_number, password, role } = req.body;

  try {
    // Ensure the requester is authenticated and is a super admin
    if (!req.user || !req.user.isSuperAdmin) {
      return res.status(403).json({ message: "Only super admins can update admins." });
    }

    // Find the admin to update
    const adminToUpdate = await AdminUser.findById(id);
    if (!adminToUpdate) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Update the admin's details
    if (first_name) adminToUpdate.first_name = first_name;
    if (middle_name) adminToUpdate.middle_name = middle_name;
    if (surname) adminToUpdate.surname = surname;
    if (phone_number) adminToUpdate.phone_number = phone_number;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      adminToUpdate.password = hashedPassword;
    }
    if (role) {
      adminToUpdate.isAdmin = role === "admin";
      adminToUpdate.isSuperAdmin = role === "superadmin";
    }

    // Save the updated admin
    await adminToUpdate.save();
    res.status(200).json({ message: "Admin updated successfully", admin: adminToUpdate });
  } catch (error: any) {
    console.error("Error updating admin:", error.message);
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
});












export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // ID of the admin to fetch

  try {
    // Ensure the requester is authenticated (either admin or super admin)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Find the admin by ID
    const admin = await AdminUser.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // // Ensure the requester is either a super admin or the admin themselves
    // if (!req.user.isSuperAdmin && req.user._id.toString() !== admin._id.toString()) {
    //   return res.status(403).json({ message: "You do not have permission to view this admin." });
    // }

    // Return the admin's details (excluding sensitive information like password)
    const adminDetails = {
      _id: admin._id,
      first_name: admin.first_name,
      middle_name: admin.middle_name,
      surname: admin.surname,
      phone_number: admin.phone_number,
      isAdmin: admin.isAdmin,
      isSuperAdmin: admin.isSuperAdmin,
      // createdBy: admin.createdBy,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };

    res.status(200).json({ message: "Admin fetched successfully", admin: adminDetails });
  } catch (error: any) {
    console.error("Error fetching admin:", error.message);
    res.status(500).json({ message: "Error fetching admin", error: error.message });
  }
});

export const changeAdminPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    // Ensure the requester is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Find the admin and explicitly type it
    const admin = await AdminUser.findById(id).exec() as any;
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // If the requester is not a super admin, they can only change their own password
    if (!req.user.isSuperAdmin && req.user._id.toString() !== admin._id.toString()) {
      return res.status(403).json({ message: "You can only change your own password." });
    }

    // If current password is provided, verify it
    if (currentPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect." });
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }


    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    console.log("New Password:", newPassword);
    console.log("Hashed Password:", hashedPassword);
    // Hash and update the new password
    
    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error changing admin password:", error.message);
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
});