import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';

// Add JWT utility functions
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || '1d',
  });
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach the user to the routes
    req.user = { 
      userId: payload.userId, 
      name: payload.name,
      role: payload.role 
    };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};

const photographerOrAdmin = async (req, res, next) => {
  if (req.user.role !== 'photographer' && req.user.role !== 'admin') {
    throw new UnauthenticatedError('Not authorized to access this route');
  }
  next();
};

export { auth, adminOnly, photographerOrAdmin, createJWT, isTokenValid };