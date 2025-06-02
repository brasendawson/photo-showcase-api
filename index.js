import express from 'express';
import dotenv from 'dotenv';
// If you installed morgan, uncomment this line
// import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/db.js';
import 'express-async-errors';

// Import route files
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/Photos.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import profileRoutes from './routes/profile.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js'; 
import aboutRouter from './routes/about.js';

// Import middleware
import errorHandlerMiddleware from './middleware/error-handler.js';

// Import Swagger packages and configuration
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from './config/swagger.js';  // Changed from default import to named import

dotenv.config({ path: './config/.env' });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser and logging
app.use(express.json());
// If you installed morgan, uncomment this line
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Photography Studio API',
    description: 'API for managing photography studio bookings and gallery',
    version: '1.0.0'
  });
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes); 
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRouter);

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.originalUrl}` 
  });
});

// Use the error-handler.js middleware
app.use(errorHandlerMiddleware);

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // In development, you might want to sync the models with the database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

start();