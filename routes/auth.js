import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { addToBlacklist } from '../utils/tokenBlacklist.js';
import { auth } from '../middleware/auth.js';
import { validateRegistration } from '../middleware/validateInput.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Strong password with at least 8 characters
 *               role:
 *                 type: string
 *                 enum: [admin, photographer, client]
 *                 description: User role (defaults to 'client' if not provided or invalid)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username or email already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token containing userId, username, and role
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */

// Register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { 
        [Op.or]: [{ username }, { email }] 
    }});

    if (existingUser) {
        logger.error('Registration failed - User exists', {
            username,
            email,
            event: 'registration_duplicate',
            duplicateField: existingUser.username === username ? 'username' : 'email'
        });
        return res.status(400).json({ 
            message: 'Username or email already exists'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Validate and set role (ensuring it's one of the allowed values)
    const validRole = role && ['admin', 'photographer', 'client'].includes(role) 
      ? role 
      : 'client';
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: validRole  // Make sure role is saved
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    logger.error('Registration failed', {
        username: req.body.username,
        error: err.message,
        event: 'registration_failed'
    });
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      logger.error('Authentication failed', {
        username,
        reason: 'Invalid credentials',
        event: 'auth_failure'
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.error('Authentication failed', {
        username,
        reason: 'Invalid credentials',
        event: 'auth_failure'
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Make sure to include the user's role in the token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${username}`);
    res.json({ token });
  } catch (err) {
    logger.error('Login error:', { error: err.message });
    res.status(500).json('Server Error');
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
    try {
        addToBlacklist(req.token);
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json('Server Error');
    }
});

// Test logging route
router.get('/test-log', (req, res) => {
    logger.info('Test log entry');
    logger.error('Test error entry');
    res.json({ message: 'Logging test complete' });
});

// Add this route to test error logging
router.get('/test-error', (req, res) => {
    try {
        throw new Error('Test error from API');
    } catch (error) {
        logger.error('API Error:', error);
        res.status(500).json({ message: 'Error logged' });
    }
});

export default router;