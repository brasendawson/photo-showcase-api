import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import { limiter } from './middleware/rateLimit.js';
import favicon from 'serve-favicon';
import path from 'path';
import { connectDB } from './config/db.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';
import logger from './utils/logger.js';

// Import route files
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/Photos.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import profileRoutes from './routes/profile.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js'; 
import aboutRouter from './routes/about.js';
import { fileURLToPath } from 'url';

// Import Swagger packages and configuration
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from './config/swagger.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config/.env' });

const app = express();
app.set('trust proxy', 1);
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Security middleware
app.use(helmet());
app.use(cors());
app.use(xss());

// Connect to database
connectDB();

app.use(limiter);
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Photography Studio API',
    description: 'API for managing photography studio bookings and gallery',
    version: '1.0.0'
  });
});

// Define PORT
const PORT = process.env.PORT || 3000;

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes); 
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRouter);


// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error Handler
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    logger.info('Server started', {
        event: 'server_start',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
        error: err.message,
        stack: err.stack,
        event: 'uncaught_exception'
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection', {
        error: err.message,
        stack: err.stack,
        event: 'unhandled_rejection'
    });
    process.exit(1);
});

export default app;