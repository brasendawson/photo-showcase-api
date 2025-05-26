import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';
import { UnauthenticatedError } from '../errors/index.js';

export const auth = async (req, res, next) => {
  // Check for token in headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];
  
  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    throw new UnauthenticatedError('Token is no longer valid');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    req.token = token;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

// Add the adminOnly middleware function
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};

// Add photographerOrAdmin middleware
export const photographerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'photographer' && req.user.role !== 'admin')) {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};

// Add additional role-based middleware for completeness
export const photographerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'photographer') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};

export const clientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'client') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};