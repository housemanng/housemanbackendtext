import express from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: Types.ObjectId; // Ensure this matches the type of `_id` in your User model
      feeAmount?: number; // Add the feeAmount property
      isSuperAdmin?: boolean;
      [key: string]: any; // Add any additional properties as needed
    };
  }
}
