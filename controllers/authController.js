import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate role explicitly
        if (!['user', 'photographer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role specified'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with explicit role setting
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role // Explicitly set role
        });

        // Log the created user for debugging
        logger.info('User created:', {
            username: user.username,
            role: user.role
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Registration failed:', {
            error: error.message,
            requestBody: req.body
        });
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};