import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser";
import asyncHandler from "../utils/asyncHandler";
// import User from "../models/User";
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from "mongoose";







// Extend Express Request type to include user (loose typing to support Admin docs and JWT payloads)
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Update the global namespace to include company
declare global {
  namespace Express {
    interface Request {
      company?: {
        _id: mongoose.Types.ObjectId;
        name: string;
        type: string;
        isVerified: boolean;
        [key: string]: any;
      };
    }
  }
}

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: any; // We'll keep this as 'any' since we're storing the whole user document
}


// Middleware to verify JWT token
export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  
  
  
  
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; isSuperAdmin: boolean };
    const admin = await AdminUser.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: "You are not permitted to use this route." });
    }

    // Attach the admin object to the request
    req.user = admin as any;
    next();
  } catch (error: any) {
    console.error("Error in authMiddleware:", error.message);
    res.status(500).json({ message: "Error verifying token", error: error.message });
  }
});

// Middleware to check if the user is a super admin
export const isSuperAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: "Access denied. Only super admins can perform this action." });
    }
    next();
  } catch (error: any) {
    console.error("Error in isSuperAdmin middleware:", error.message);
    res.status(500).json({ message: "Error verifying super admin access", error: error.message });
  }
});

// Middleware to check if the user is an admin (regular or super admin)
export const isAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

  try {

    if (!req.user?.isAdmin && !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: "Access denied. You are not authorized to perform this action." });
    }
    next();
  } catch (error: any) {
    console.error("Error in isAdmin middleware:", error.message);
    res.status(500).json({ message: "Error verifying admin access", error: error.message });
  }
});

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔒 PROTECT MIDDLEWARE CALLED for:', req.path);
  console.log('🔒 Request method:', req.method);
  
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔒 Token found, length:', token.length);

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      console.log('🔒 Token decoded successfully:', { userId: decoded.userId });

      // Fetch the complete user data from database
      try {
        console.log('🔒 Importing models...');
        
        // Try different import approaches
        let User: any;
        
        try {
          User = require('../models/User');
          console.log('🔒 User model imported:', typeof User);
          
          // Handle ES6 default export
          if (User && User.default) {
            User = User.default;
            console.log('🔒 User model accessed via default export');
          }
        } catch (userImportError) {
          console.error('🔒 Failed to import User model:', userImportError);
          User = null;
        }
        
        if (!User) {
          console.error('🔒 Both User and Company models failed to import');
          return res.status(500).json({ 
            success: false, 
            message: 'Database models not available' 
          });
        }
        
        let user = null;
        
        // Try to find user first
        if (decoded.userId && User) {
          console.log('🔒 Looking for user with ID:', decoded.userId);
          try {
            user = await User.findById(decoded.userId);
            console.log('🔒 User found:', user ? 'Yes' : 'No');
          } catch (userError) {
            console.error('🔒 Error finding user:', userError);
          }
        }
        
        // If not found as user, return unauthorized
        
        if (!user) {
          console.log('🔒 No user or company found in database');
          return res.status(401).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        console.log('🔒 User object from database:', {
          id: user._id,
          type: user.type,
          userType: user.userType,
          name: user.name || user.companyName || 'Unknown'
        });

        // Set the complete user object in req.user
        req.user = user;
        console.log('🔒 === PROTECT MIDDLEWARE SUCCESS ===');
        next();
      } catch (dbError) {
        console.error('🔒 Database error in protect middleware:', dbError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error while fetching user' 
        });
      }
    } catch (error) {
      console.error('🔒 JWT verification error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    console.log('🔒 No authorization header found');
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export { protect };
















export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload & {
      _id: mongoose.Types.ObjectId;
      feeAmount?: number;
      isSuperAdmin?: boolean;
    };
    req.user = decoded as any;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 


// export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       throw new Error("Authentication required.");
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET) as { _id: string };
//     const user = await User.findById(decoded._id);

//     if (!user) {
//       throw new Error("User not found.");
//     }

//     req.user = user; // Attach the user to the request object
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Please authenticate.", error: error.message });
//   }
// };

// // Extend Express Request type to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         _id: mongoose.Types.ObjectId;
//         email: string;
//         role: string;
//         isVerified: boolean;
//         isSuperAdmin?: boolean;
//         isAdmin?: boolean;
//         [key: string]: any;
//       };
//     }
//   }
// }

// /**
//  * Middleware to verify JWT token and authenticate user
//  */
// export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   let token: string | undefined;

//   // Check if token exists in the authorization header
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

//     // Find the user in the database
//     const user = await AdminUser.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found." });
//     }

//     // Attach the user object to the request
//     req.user = user;
//     next();
//   } catch (error: any) {
//     console.error("Error in authMiddleware:", error.message);
//     res.status(401).json({ success: false, message: "Not authorized, invalid token." });
//   }
// });

// /**
//  * Middleware to check if the user is a super admin
//  */
// export const isSuperAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user?.isSuperAdmin) {
//     return res.status(403).json({ success: false, message: "Access denied. Only super admins can perform this action." });
//   }
//   next();
// });

// /**
//  * Middleware to check if the user is an admin (regular or super admin)
//  */
// export const isAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   if (!req.user?.isAdmin && !req.user?.isSuperAdmin) {
//     return res.status(403).json({ success: false, message: "Access denied. You are not authorized to perform this action." });
//   }
//   next();
// });

// /**
//  * Middleware to check if the user is logged in (general authentication)
//  */
// export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   let token: string | undefined;

//   // Check if token exists in the authorization header
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

//     // Find the user in the database
//     const user = await AdminUser.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found." });
//     }

//     // Attach the user object to the request
//     req.user = user;
//     next();
//   } catch (error: any) {
//     console.error("Error in protect middleware:", error.message);
//     res.status(401).json({ success: false, message: "Not authorized, invalid token." });
//   }
// });
// });