import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    createBooking,
    getMyBookings,
    getPhotographerBookings,
    updateBooking,
    cancelBooking
} from '../controllers/bookingController.js';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints for photography sessions
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Creates a booking for a photography session with a specific photographer
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photographerId
 *               - date
 *               - location
 *               - package
 *             properties:
 *               photographerId:
 *                 type: integer
 *                 description: ID of the photographer to book
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the photography session
 *                 example: "2025-06-01T10:00:00Z"
 *               location:
 *                 type: string
 *                 description: Location for the photoshoot
 *                 example: "Central Park, NYC"
 *               package:
 *                 type: string
 *                 description: Photography package selected
 *                 example: "Standard"
 *               notes:
 *                 type: string
 *                 description: Additional notes or requests
 *                 example: "Please bring a wide-angle lens"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-01T10:00:00Z"
 *                     location:
 *                       type: string
 *                       example: "Central Park, NYC"
 *                     package:
 *                       type: string
 *                       example: "Standard"
 *                     notes:
 *                       type: string
 *                       example: "Please bring a wide-angle lens"
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, completed, cancelled]
 *                       example: "pending"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server error"
 *   get:
 *     summary: Get user's bookings
 *     description: Returns all bookings made by the currently authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-01T10:00:00Z"
 *                       location:
 *                         type: string
 *                         example: "Central Park, NYC"
 *                       package:
 *                         type: string
 *                         example: "Standard"
 *                       notes:
 *                         type: string
 *                         example: "Please bring a wide-angle lens"
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, completed, cancelled]
 *                         example: "pending"
 *                       photographer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           username:
 *                             type: string
 *                             example: "john_doe"
 *       403:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not authorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /api/bookings/photographer:
 *   get:
 *     summary: Get logged-in photographer's bookings
 *     description: Returns all bookings for the currently authenticated photographer
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of photographer's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-01T10:00:00Z"
 *                       location:
 *                         type: string
 *                         example: "Central Park, NYC"
 *                       package:
 *                         type: string
 *                         example: "Standard"
 *                       notes:
 *                         type: string
 *                         example: "Please bring a wide-angle lens"
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, completed, cancelled]
 *                         example: "pending"
 *                       client:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           username:
 *                             type: string
 *                             example: "jane_doe"
 *       403:
 *         description: Not authorized - requires photographer role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not authorized - requires photographer role"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error fetching photographer bookings"
 */

/**
 * @swagger
 * /api/bookings/photographer/{id}:
 *   get:
 *     summary: Get bookings for a specific photographer
 *     description: Admin-only endpoint to view bookings for any photographer
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photographer's user ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of photographer's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-01T10:00:00Z"
 *                       location:
 *                         type: string
 *                         example: "Central Park, NYC"
 *                       package:
 *                         type: string
 *                         example: "Standard"
 *                       notes:
 *                         type: string
 *                         example: "Please bring a wide-angle lens"
 *                       status:
 *                         type: string
 *                         enum: [pending, confirmed, completed, cancelled]
 *                         example: "pending"
 *                       client:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           username:
 *                             type: string
 *                             example: "jane_doe"
 *       403:
 *         description: Not authorized - requires admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not authorized - requires admin role"
 *       404:
 *         description: Photographer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Photographer not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     description: |
 *       Update booking details with role-based permissions:
 *       - Clients can update location, date, package, and notes (but not status)
 *       - Photographers can update status to confirmed/completed and add notes
 *       - Admins can update all fields
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 description: Photographer or admin can update status
 *                 example: "confirmed"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the booking
 *                 example: "Updated notes"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Client can reschedule by updating date
 *                 example: "2025-06-02T10:00:00Z"
 *               location:
 *                 type: string
 *                 description: Client can change location
 *                 example: "Brooklyn Bridge, NYC"
 *               package:
 *                 type: string
 *                 description: Client can change package
 *                 example: "Premium"
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-02T10:00:00Z"
 *                     location:
 *                       type: string
 *                       example: "Brooklyn Bridge, NYC"
 *                     package:
 *                       type: string
 *                       example: "Premium"
 *                     notes:
 *                       type: string
 *                       example: "Updated notes"
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, completed, cancelled]
 *                       example: "confirmed"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid input data"
 *       403:
 *         description: Not authorized to update this booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not authorized to update this booking"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server error"
 *   delete:
 *     summary: Cancel a booking
 *     description: |
 *       Cancel a booking with role-based permissions:
 *       - Clients can cancel their own bookings
 *       - Photographers can cancel bookings made to them
 *       - Admins can cancel any booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [cancelled]
 *                       example: "cancelled"
 *       403:
 *         description: Not authorized to cancel this booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Not authorized to cancel this booking"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server error"
 */

const router = express.Router();

// Create a new booking
router.post('/', auth, createBooking);

// Get authenticated user's bookings
router.get('/', auth, getMyBookings);

// Get authenticated photographer's bookings
router.get('/photographer', auth, getPhotographerBookings);

// Get bookings for a specific photographer (admin only)
router.get('/photographer/:id', auth, getPhotographerBookings);

// Update a booking
router.put('/:id', auth, updateBooking);

// Cancel a booking
router.delete('/:id', auth, cancelBooking);

export default router;