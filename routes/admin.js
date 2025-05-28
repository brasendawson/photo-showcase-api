import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               users:
 *                 - id: 1
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   createdAt: "2024-05-22T10:30:00Z"
 */
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'] 
    });
    
    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching users' 
    });
  }
});

/**
 * @swagger
 * /api/admin/users/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - newRole
 *             properties:
 *               username:
 *                 type: string
 *               newRole:
 *                 type: string
 *                 enum: [client, photographer, admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized
 */
router.put('/users/role', auth, adminOnly, async (req, res) => {
  try {
    const { username, newRole } = req.body;
    
    if (!username || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and newRole'
      });
    }
    
    // Validate role
    if (!['client', 'photographer', 'admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be one of: client, photographer, admin'
      });
    }
    
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.role = newRole;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating user role' 
    });
  }
});

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    // Count users by role
    const users = await User.findAll();
    const userStats = {
      total: users.length,
      photographers: users.filter(user => user.role === 'photographer').length,
      clients: users.filter(user => user.role === 'client').length,
      admins: users.filter(user => user.role === 'admin').length
    };
    
    // You can add more stats here as needed
    const stats = {
      users: userStats,
      photos: {
        total: 25,
        featured: 5
      },
      bookings: {
        total: 15,
        pending: 5,
        confirmed: 8,
        completed: 2
      },
      services: {
        total: 4
      }
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching dashboard stats' 
    });
  }
});

export default router;