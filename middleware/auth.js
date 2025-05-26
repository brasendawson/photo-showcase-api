import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';
import { UnauthenticatedError } from '../errors/index.js';
import logger from '../utils/logger.js';

export const auth = async (req, res, next) => {
  // Check for token in headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error(`Authentication failed: No valid token provided`, { timestamp: new Date().toISOString() });
    throw new UnauthenticatedError('Login required');
  }

  const token = authHeader.split(' ')[1];
  
  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    logger.error(`Authentication failed: Token is blacklisted`, { timestamp: new Date().toISOString() });
    throw new UnauthenticatedError('Session expired');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = { 
      userId: decoded.userId, 
      username: decoded.username, 
      role: decoded.role || 'client' // Default to client if role is missing
    };
    req.token = token;
    next();
  } catch (error) {
    logger.error(`Authentication failed: Invalid token`, { timestamp: new Date().toISOString() });
    throw new UnauthenticatedError('Login required');
  }
};

// Add the adminOnly middleware function
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.error(`Access denied: User ${req.user?.username || 'unknown'} attempted to access admin route`, { 
      username: req.user?.username || 'unknown',
      role: req.user?.role || 'unknown',
      timestamp: new Date().toISOString()
    });
    throw new UnauthenticatedError(`Not authorized to access this route: ${req.user?.username || 'unknown'}`);
  }
  next();
};

// Add photographerOrAdmin middleware
export const photographerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'photographer' && req.user.role !== 'admin')) {
    logger.error(`Access denied: User ${req.user?.username || 'unknown'} attempted to access photographer/admin route`, { 
      username: req.user?.username || 'unknown',
      role: req.user?.role || 'unknown',
      timestamp: new Date().toISOString()
    });
    throw new UnauthenticatedError(`Not authorized to access this route: ${req.user?.username || 'unknown'}`);
  }
  next();
};

// Add additional role-based middleware for completeness
export const photographerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'photographer') {
    logger.error(`Access denied: User ${req.user?.username || 'unknown'} attempted to access photographer route`, { 
      username: req.user?.username || 'unknown',
      role: req.user?.role || 'unknown',
      timestamp: new Date().toISOString()
    });
    throw new UnauthenticatedError(`Not authorized to access this route: ${req.user?.username || 'unknown'}`);
  }
  next();
};

export const clientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'client') {
    logger.error(`Access denied: User ${req.user?.username || 'unknown'} attempted to access client route`, { 
      username: req.user?.username || 'unknown',
      role: req.user?.role || 'unknown',
      timestamp: new Date().toISOString()
    });
    throw new UnauthenticatedError(`Not authorized to access this route: ${req.user?.username || 'unknown'}`);
  }
  next();
};