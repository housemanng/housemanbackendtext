// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

// Extend the Error interface to include a status property
interface CustomError extends Error {
    status?: number;
}

// Define the errorHandler with the proper ErrorRequestHandler type
export const errorHandler = (
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("❌ ERROR:", err.message);
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
