import jwt from 'jsonwebtoken';

export const generateToken = (payload: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  // If payload is a string, convert it to an object with userId property
  const tokenPayload = typeof payload === 'string' ? { userId: payload } : payload;
  
  return jwt.sign(tokenPayload, secret, { expiresIn: (process.env.JWT_EXPIRE || '30d') as any });
};


export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret);
};


