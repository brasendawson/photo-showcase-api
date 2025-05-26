import express from 'express';
import { sequelize } from '../config/db.js';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: Photography Showcase Api
 *                 database:
 *                   type: string
 *                   example: Connected
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *       503:
 *         description: API is down or experiencing issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: DOWN
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: Photography Showcase Api
 *                 database:
 *                   type: string
 *                   example: Disconnected
 *                 error:
 *                   type: string
 */

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    const healthCheck = {
      status: 'UP',
      timestamp: new Date(),
      service: 'Photography Showcase Api',
      database: 'Connected',
      uptime: process.uptime()
    };
    
    res.json(healthCheck);
  } catch (error) {
    const healthCheck = {
      status: 'DOWN',
      timestamp: new Date(),
      service: 'Photography Showcase Api',
      database: 'Disconnected',
      error: error.message
    };
    
    res.status(503).json(healthCheck);
  }
});

export default router;