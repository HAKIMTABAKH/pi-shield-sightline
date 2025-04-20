
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './utils/logger.js';
import authMiddleware from './middleware/auth.js';

// Routes
import authRoutes from './routes/auth.js';
import alertsRoutes from './routes/alerts.js';
import dashboardRoutes from './routes/dashboard.js';
import actionsRoutes from './routes/actions.js';
import devicesRoutes from './routes/devices.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', authMiddleware, alertsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/actions', authMiddleware, actionsRoutes);
app.use('/api/devices', authMiddleware, devicesRoutes);

// WebSocket setup for real-time updates
import { createServer } from 'http';
import { setupWebSocket } from './services/websocket.js';

const server = createServer(app);
setupWebSocket(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default server;
