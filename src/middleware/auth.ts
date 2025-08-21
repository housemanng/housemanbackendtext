// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { config } from '../config';

// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, config.jwt.secret);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: 'Invalid token' });
//   }
// }; 