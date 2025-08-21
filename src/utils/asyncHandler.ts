import { Request, Response, NextFunction } from "express";

// Define the asyncHandler function
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); // Catch any errors and pass them to the error-handling middleware
  };
};

export default asyncHandler;