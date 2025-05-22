import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {
  getAllUsers,
  updateUserRole,
  moderateContent,
  updateContentStatus
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
 *                 enum: [user, photographer, admin]
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
 *                 newRole: "user"
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

/**
 * @swagger
 * /api/admin/moderate:
 *   post:
 *     summary: Moderate content (photos or reviews)
 *     description: Delete content, flag for review, or restore flagged content. When flagging, content becomes invisible and pending review. When restoring, content becomes visible and approved.
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
 *               - id
 *               - contentType
 *               - action
 *             properties:
 *               id:
 *                 type: integer
 *               contentType:
 *                 type: string
 *                 enum: [review, photo]
 *               action:
 *                 type: string
 *                 enum: [delete, flag, restore]
 *           examples:
 *             delete_photo:
 *               summary: Delete a photo permanently
 *               value:
 *                 id: 1
 *                 contentType: "photo"
 *                 action: "delete"
 *             flag_photo:
 *               summary: Flag a photo (makes invisible + pending review)
 *               value:
 *                 id: 3
 *                 contentType: "photo"
 *                 action: "flag"
 *             restore_photo:
 *               summary: Restore a flagged photo (makes visible + approved)
 *               value:
 *                 id: 5
 *                 contentType: "photo"
 *                 action: "restore"
 *             delete_review:
 *               summary: Delete a review permanently
 *               value:
 *                 id: 2
 *                 contentType: "review"
 *                 action: "delete"
 *             flag_review:
 *               summary: Flag a review (makes invisible + pending review)
 *               value:
 *                 id: 4
 *                 contentType: "review"
 *                 action: "flag"
 *             restore_review:
 *               summary: Restore a flagged review (makes visible + approved)
 *               value:
 *                 id: 6
 *                 contentType: "review"
 *                 action: "restore"
 *     responses:
 *       200:
 *         description: Content moderated successfully
 *         content:
 *           application/json:
 *             examples:
 *               delete_success:
 *                 summary: Delete success
 *                 value:
 *                   success: true
 *                   message: "content has been deleted successfully"
 *               flag_success:
 *                 summary: Flag success
 *                 value:
 *                   success: true
 *                   message: "content has been flagged successfully"
 *               restore_success:
 *                 summary: Restore success
 *                 value:
 *                   success: true
 *                   message: "content has been restored successfully"
 *       404:
 *         description: Content not found
 *       400:
 *         description: Invalid input parameters
 *       403:
 *         description: Not authorized
 */
router.post('/moderate', auth, isAdmin, moderateContent);

export default router;