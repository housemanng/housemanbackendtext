import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import CONFIG from './config/index';
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";



import { errorHandler } from "./middleware/errorHandler";
import { ErrorRequestHandler } from 'express';




dotenv.config();

// Validate required environment variables (allow default in development)
if (!process.env.JWT_SECRET) {
  if (CONFIG.isDevelopment) {
    process.env.JWT_SECRET = 'dev-secret';
    console.warn('⚠️ Using fallback JWT_SECRET in development. Set JWT_SECRET in .env for security.');
  } else {
    console.error("❌ ERROR: JWT_SECRET is not configured in environment variables.");
    process.exit(1);
  }
}

const app = express();
const server = createServer(app);

// Initialize Socket.IO with config CORS origins
const io = new Server(server, {
  cors: {
    origin: CONFIG.CORS_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join admin room for real-time updates
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  // Join user room for user-specific updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined user room`);
  });



  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for other modules
declare global {
  var io: any;
}
global.io = io;



app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CONFIG.CORS_ORIGINS.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    credentials: true, // Allow cookies and credentials
  })
);

app.use(express.json()); // Parse JSON request bodies


// Connect to Database
connectDB();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // User routes (including the new route)
app.use('/api/admin', adminRoutes);


app.use(errorHandler as ErrorRequestHandler);

// Start server with Socket.IO using environment PORT
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🔗 CORS Origins: ${CONFIG.CORS_ORIGINS.join(', ')}`);
});
