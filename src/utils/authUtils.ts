//import jwt from 'jsonwebtoken';

// Check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const currentTime = Date.now() / 1000;
    
    // Check if token has expired
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token expired at:', new Date(payload.exp * 1000));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't decode
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

// Check if token will expire soon (within 5 minutes)
export const isTokenExpiringSoon = (token: string, minutes: number = 5): boolean => {
  try {
    const expiration = getTokenExpiration(token);
    if (!expiration) return true;
    
    const currentTime = new Date();
    const timeUntilExpiration = expiration.getTime() - currentTime.getTime();
    const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
    
    return minutesUntilExpiration <= minutes;
  } catch (error) {
    console.error('Error checking if token expires soon:', error);
    return true;
  }
};
