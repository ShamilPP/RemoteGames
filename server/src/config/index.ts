import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gamemonitor',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL,
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  gameTickRate: 20, // 20Hz server tick
  stateUpdateInterval: 3, // Emit state every 3 ticks
};

