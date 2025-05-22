import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Token has been invalidated, Log in Again' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Add role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Not authorized to access this route'
            });
        }
        next();
    };
};

// Add admin check middleware
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access restricted to admin users'
        });
    }
    next();
};