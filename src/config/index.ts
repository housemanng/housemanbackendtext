// backend/src/config/index.ts - SIMPLIFIED CONFIGURATION
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

function parseOrigins(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

const envCorsOrigins = parseOrigins(process.env.CORS_ORIGINS);

export const CONFIG = {
  // CORS origins (centralized) - supports env override, with dev fallbacks
  CORS_ORIGINS: envCorsOrigins.length > 0 ? envCorsOrigins : [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    // Common Vite alt port for second app during dev
    'http://localhost:5174',
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



export default CONFIG;