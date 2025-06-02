import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';

export const errorHandlerMiddleware = (err, req, res, next) => {
  // Create custom error response
  let customError = {
    success: false,
    message: err.message || 'Something went wrong',
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  };

  // Log authentication errors in the desired format
  if (err.message && (err.message.includes('Not authorized') || err.message.includes('Login required') || err.message.includes('Session expired'))) {
    // Already logged in auth middleware, no need to log again
  } else if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map(item => item.message)
      .join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST;
    
    logger.error(`Validation error: ${customError.message}`, {
      timestamp: new Date().toISOString()
    });
  } else if (err.name === 'CastError') {
    customError.message = `Resource not found`;
    customError.statusCode = StatusCodes.NOT_FOUND;
    
    logger.error(`Cast error: ${err.value}`, {
      timestamp: new Date().toISOString()
    });
  } else if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
    
    logger.error(`Duplicate error: ${JSON.stringify(err.keyValue)}`, {
      timestamp: new Date().toISOString()
    });
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT specific errors
    customError.message = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    
    logger.error(`Token error: ${customError.message}`, {
      timestamp: new Date().toISOString()
    });
  } else if (err.statusCode !== 401 && err.statusCode !== 403) {
    // Log other server errors but not auth errors (already logged)
    logger.error(`Server error: ${err.message || 'Unknown error'}`, {
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }

  // Send the error response
  return res.status(customError.statusCode).json({
    success: customError.success,
    message: customError.message
  });
};
