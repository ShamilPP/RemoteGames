import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { config } from './config';
import { initializeSocket } from './sockets/socket';
import apiRoutes from './api';
import { gameService } from './services/gameService';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// REST API
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Game Monitor Server' });
});

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize default games
    await gameService.initializeGames();
    console.log('Games initialized');

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export { io };

