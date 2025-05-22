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
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
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
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               package:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */

/**
 * @swagger
 * /api/bookings/photographer/{id}:
 *   get:
 *     summary: Get photographer's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of photographer's bookings
 */

const router = express.Router();

router.post('/', auth, createBooking);
router.get('/', auth, getMyBookings);
router.get('/photographer/:id', auth, getPhotographerBookings);
router.put('/:id', auth, updateBooking);
router.delete('/:id', auth, cancelBooking);

export default router;