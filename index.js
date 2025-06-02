import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import { limiter } from './middleware/rateLimit.js';
import { sequelize } from './config/db.js';
import favicon from 'serve-favicon';
import path from 'path';
import { connectDB } from './config/db.js';
import { errorHandlerMiddleware } from './middleware/error-handler.js';

// Import route files
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/Photos.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
import profileRoutes from './routes/profile.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js'; 
import aboutRouter from './routes/about.js';

// Import Swagger packages and configuration
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from './config/swagger.js'; 

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

// Error Handler
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

export default app;