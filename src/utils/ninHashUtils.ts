import crypto from 'crypto';

// Generate hash for NIN
export const generateNINHash = (nin: string): string => {
  const salt = process.env.NIN_HASH_SALT;
  if (!salt) {
    throw new Error('NIN_HASH_SALT is not configured');
  }
  
  const hash = crypto.createHash('sha256');
  hash.update(nin + salt);
  return hash.digest('hex');
};

// Verify NIN hash
export const verifyNINHash = (nin: string, hash: string): boolean => {
  const salt = process.env.NIN_HASH_SALT;
  if (!salt) {
    throw new Error('NIN_HASH_SALT is not configured');
  }
  
  const verifyHash = crypto.createHash('sha256');
  verifyHash.update(nin + salt);
  return verifyHash.digest('hex') === hash;
};

// Generate verification hash
export const generateVerificationHash = (data: string): string => {
  const salt = process.env.NIN_VERIFICATION_SALT;
  if (!salt) {
    throw new Error('NIN_VERIFICATION_SALT is not configured');
  }
  
  const hash = crypto.createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
};

// Verify verification hash
export const verifyVerificationHash = (data: string, hash: string): boolean => {
  const salt = process.env.NIN_VERIFICATION_SALT;
  if (!salt) {
    throw new Error('NIN_VERIFICATION_SALT is not configured');
  }
  
  const verifyHash = crypto.createHash('sha256');
  verifyHash.update(data + salt);
  return verifyHash.digest('hex') === hash;
};

/**
 * Validate NIN number format
 */
export const validateNinFormat = (ninNumber: string): boolean => {
  return /^\d{11}$/.test(ninNumber);
};

/**
 * Sanitize NIN number (remove spaces, dashes, etc.)
 */
export const sanitizeNinNumber = (ninNumber: string): string => {
  return ninNumber.replace(/[\s\-_]/g, '');
}; 