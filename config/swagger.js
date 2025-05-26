import swaggerJsdoc from 'swagger-jsdoc';

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

export const swaggerDocs = swaggerJsdoc(swaggerOptions);