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
import photoRoutes from './routes/photos.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import profileRoutes from './routes/profile.js';
import healthRoutes from './routes/health.js';  // Add this line

// Import middleware
import errorHandlerMiddleware from './middleware/error-handler.js';

// Import Swagger packages
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

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

// Define PORT before using it in Swagger configuration
const PORT = process.env.PORT || 5000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Photography Studio API',
      version: '1.0.0',
      description: 'API for managing photography studio bookings and gallery',
      contact: {
        name: 'API Support',
        email: 'support@photostudio.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : `http://localhost:${PORT}`,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'] // Path to the API routes with JSDoc comments
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/profile', profileRoutes); 
app.use('/api/health', healthRoutes); // Fixed: use healthRoutes instead of undefined health

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