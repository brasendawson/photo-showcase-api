import express from 'express';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { createJWT } from '../middleware/auth.js';

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
 *     description: Register as a client or photographer (admin registration restricted)
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
 *                 description: User's username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 6 characters)
 *               role:
 *                 type: string
 *                 enum: [client, photographer]
 *                 description: User role (defaults to client if not specified)
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', async (req, res) => {
  const user = await User.create({ ...req.body });
  
  const token = createJWT({ 
    payload: { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    }
  });
  
  res.status(StatusCodes.CREATED).json({ 
    user: { 
      username: user.username, 
      email: user.email,
      role: user.role,
      id: user.id 
    }, 
    token 
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user and return a JWT token
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
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError('Please provide username and password');
  }
  
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  
  const token = createJWT({ 
    payload: { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    }
  });
  
  res.status(StatusCodes.OK).json({ 
    user: { 
      username: user.username, 
      email: user.email,
      role: user.role,
      id: user.id 
    }, 
    token 
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     description: Client-side logout (JWT tokens are stateless, this endpoint is for consistency)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
});

export default router;