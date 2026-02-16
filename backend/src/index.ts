import express from 'express';
import cors from 'cors';
import path from 'path';
import allRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { connectDatabase } from './database/connection';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Start Server Function ---
const startServer = async () => {
  try {
    // Connect to the database first
    await connectDatabase();
    console.log('Database connected successfully');

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve Static Files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // API Routes
    app.use('/api/v1', allRoutes);

    // Global Error Handler
    app.use(errorHandler);

    // Start Listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // Exit if DB connection fails
  }
};

// --- Execute Start ---
startServer();
