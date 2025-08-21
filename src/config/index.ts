// backend/src/config/index.ts - SIMPLIFIED CONFIGURATION
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const CONFIG = {
  // CORS origins (centralized) - Complex array with fallbacks
  CORS_ORIGINS: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.COMPANY_FRONTEND_URL || 'http://localhost:5174',
    process.env.ADMIN_FRONTEND_URL || 'http://localhost:5175',
    'http://localhost:3000', // Backup for Create React App
    'http://localhost:3001', // Backup
    'http://localhost:3002', // Backup
    ...(isProduction ? ['https://www.houseman.app', 'https://houseman.app'] : [])
  ],
  
  // Environment info
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment,
  isProduction,
};

// Helper functions
export const generateFormShareableLink = (propertyCode: string): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/form/${propertyCode}`;
};

export const generateQRCode = async (): Promise<string> => {
  // QR Code generation logic here
  return '';
};

export default CONFIG;