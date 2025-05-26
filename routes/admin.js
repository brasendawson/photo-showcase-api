import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  updateUserRole
} from '../controllers/adminController.js';

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
 *               data:
 *                 - id: 1
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   role: "user"
 *                   isActive: true
 *                   createdAt: "2024-05-22T10:30:00Z"
 */
router.get('/users', auth, isAdmin, getAllUsers);

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
 *           examples:
 *             make_photographer:
 *               summary: Make user a photographer
 *               value:
 *                 username: "johndoe"
 *                 newRole: "photographer"
 *             make_admin:
 *               summary: Make user an admin
 *               value:
 *                 username: "janedoe"
 *                 newRole: "admin"
 *             remove_photographer:
 *               summary: Remove photographer role
 *               value:
 *                 username: "bobsmith"
 *                 newRole: "client"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "User role updated successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "User not found"
 *       403:
 *         description: Not authorized
 */
router.put('/users/role', auth, isAdmin, updateUserRole);

export default router;