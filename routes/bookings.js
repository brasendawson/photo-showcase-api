import express from 'express';
import { auth, adminOnly, photographerOrAdmin } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError, UnauthenticatedError } from '../errors/index.js';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - sessionType
 *         - date
 *         - time
 *         - location
 *       properties:
 *         id:
 *           type: integer
 *           description: Booking ID
 *         fullName:
 *           type: string
 *           description: Client's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Client's email address
 *         phoneNumber:
 *           type: string
 *           description: Client's phone number
 *         sessionType:
 *           type: string
 *           description: Type of photography session
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the session
 *         time:
 *           type: string
 *           description: Time of the session
 *         location:
 *           type: string
 *           description: Location of the session
 *         additionalDetails:
 *           type: string
 *           description: Additional booking details
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *           default: pending
 *           description: Booking status
 *         clientId:
 *           type: integer
 *           description: ID of the client who made the booking
 *         photographerId:
 *           type: integer
 *           nullable: true
 *           description: ID of the assigned photographer (null if not assigned)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when booking was last updated
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
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - sessionType
 *               - date
 *               - time
 *               - location
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               sessionType:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               additionalDetails:
 *                 type: string
 *               clientId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get current client's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of client's bookings
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/bookings/available:
 *   get:
 *     summary: Get available bookings for photographers
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Get bookings that haven't been assigned to photographers yet
 *     responses:
 *       200:
 *         description: List of available bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a photographer or admin
 */

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   patch:
 *     summary: Photographer accepts booking
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               additionalDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       400:
 *         description: Booking already assigned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a photographer or admin
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /api/bookings/photographer:
 *   get:
 *     summary: Get photographer's assigned bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of photographer's assigned bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a photographer or admin
 */

/**
 * @swagger
 * /api/bookings/{id}/assign:
 *   patch:
 *     summary: Admin assigns photographer to booking
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photographerId
 *             properties:
 *               photographerId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Photographer assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /api/bookings/all:
 *   get:
 *     summary: Get all bookings (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (admin only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Booking not found
 */

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     description: Create a new photography session booking
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
 *               - fullName
 *               - email
 *               - sessionType
 *               - date
 *               - time
 *               - location
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Client's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Client's email
 *               phoneNumber:
 *                 type: string
 *                 description: Client's phone number
 *               sessionType:
 *                 type: string
 *                 enum: [portrait, wedding, event, commercial, other]
 *                 description: Type of photography session
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Preferred date (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 description: Preferred time
 *               location:
 *                 type: string
 *                 description: Session location or venue
 *               additionalDetails:
 *                 type: string
 *                 description: Additional information or requests
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, async (req, res) => {
  req.body.client = req.user.userId;
  const booking = await Booking.create(req.body);
  res.status(StatusCodes.CREATED).json({ booking });
});

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get client's bookings
 *     description: Retrieve all bookings made by the authenticated client
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of client's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { clientId: req.user.userId }
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/bookings/my-bookings/{id}:
 *   get:
 *     summary: Get a specific client booking
 *     description: Retrieve details of a specific booking made by the authenticated client
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
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get('/my-bookings/:id', auth, async (req, res) => {
  const { id: bookingId } = req.params;
  const booking = await Booking.findOne({
    _id: bookingId,
    client: req.user.userId,
  }).populate('assignedPhotographer', 'name email');
  
  if (!booking) {
    throw new NotFoundError(`No booking with id: ${bookingId}`);
  }
  
  res.status(StatusCodes.OK).json({ booking });
});

/**
 * @swagger
 * /api/bookings/my-bookings/{id}:
 *   patch:
 *     summary: Update client booking
 *     description: Update details of a booking made by the authenticated client
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               additionalDetails:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [cancelled]
 *                 description: Clients can only cancel bookings
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid input or operation not allowed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.patch('/my-bookings/:id', auth, async (req, res) => {
  const { id: bookingId } = req.params;
  const booking = await Booking.findOne({
    _id: bookingId,
    client: req.user.userId,
  });
  
  if (!booking) {
    throw new NotFoundError(`No booking with id: ${bookingId}`);
  }
  
  // Only allow cancellations and updates to non-status fields for clients
  if (req.body.status && req.body.status !== 'cancelled') {
    throw new BadRequestError('Clients can only cancel bookings');
  }
  
  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: bookingId, client: req.user.userId },
    req.body,
    { new: true, runValidators: true }
  ).populate('assignedPhotographer', 'name email');
  
  res.status(StatusCodes.OK).json({ booking: updatedBooking });
});

/**
 * @swagger
 * /api/bookings/photographer:
 *   get:
 *     summary: Get photographer's assigned bookings
 *     description: Retrieve all bookings assigned to the authenticated photographer
 *     tags: [Photographer Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized - photographer access required
 */
router.get('/photographer', auth, photographerOrAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { photographerId: req.user.userId }
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching photographer bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/bookings/photographer/{id}:
 *   get:
 *     summary: Get bookings for a specific photographer
 *     description: Admin endpoint to view bookings assigned to a specific photographer
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photographer's user ID
 *     responses:
 *       200:
 *         description: List of bookings for the specified photographer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/photographer/:id', auth, adminOnly, async (req, res) => {
  const photographerId = req.params.id;
  
  const bookings = await Booking.find({ assignedPhotographer: photographerId })
    .sort('date')
    .populate('client', 'name email phoneNumber');
  
  res.status(StatusCodes.OK).json({ bookings, count: bookings.length });
});

/**
 * @swagger
 * /api/bookings/all:
 *   get:
 *     summary: Get all bookings
 *     description: Admin endpoint to view all bookings in the system
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/bookings/{id}/assign:
 *   patch:
 *     summary: Assign photographer to booking
 *     description: Admin endpoint to assign a photographer to a booking
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photographerId
 *             properties:
 *               photographerId:
 *                 type: integer
 *                 description: ID of the photographer to assign
 *     responses:
 *       200:
 *         description: Photographer assigned successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Booking or photographer not found
 */
router.patch('/:id/assign', auth, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    booking.photographerId = req.body.photographerId;
    booking.status = 'confirmed';
    await booking.save();
    
    res.status(200).json({ success: true, message: 'Photographer assigned successfully', booking });
  } catch (error) {
    console.error('Error assigning photographer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update booking
 *     description: Update a booking with role-based restrictions
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: |
 *                   - Clients can only set to 'cancelled'
 *                   - Photographers can set to 'confirmed' or 'completed'
 *                   - Admins can set to any status
 *               additionalDetails:
 *                 type: string
 *                 description: Additional notes or information
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Booking date (client or admin only)
 *               time:
 *                 type: string
 *                 description: Booking time (client or admin only)
 *               location:
 *                 type: string
 *                 description: Session location (client or admin only)
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid input or operation not allowed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.put('/:id', auth, async (req, res) => {
  const { id: bookingId } = req.params;
  let booking;
  
  // Different queries based on user role
  if (req.user.role === 'client') {
    booking = await Booking.findOne({
      _id: bookingId,
      client: req.user.userId
    });
    
    // Clients can't update status (except cancellation)
    if (req.body.status && req.body.status !== 'cancelled') {
      throw new BadRequestError('Clients can only cancel bookings');
    }
  } else if (req.user.role === 'photographer') {
    booking = await Booking.findOne({
      _id: bookingId,
      assignedPhotographer: req.user.userId
    });
    
    // Photographers can only update status to confirmed or completed
    if (req.body.status && !['confirmed', 'completed'].includes(req.body.status)) {
      throw new BadRequestError('Photographers can only confirm or complete bookings');
    }
    
    // Photographers can only update status and additionalDetails
    const allowedFields = ['status', 'additionalDetails'];
    Object.keys(req.body).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete req.body[key];
      }
    });
  } else if (req.user.role === 'admin') {
    // Admins can update any booking
    booking = await Booking.findById(bookingId);
  }
  
  if (!booking) {
    throw new NotFoundError(`No booking with id: ${bookingId}`);
  }
  
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    req.body,
    { new: true, runValidators: true }
  ).populate('client', 'name email phoneNumber')
   .populate('assignedPhotographer', 'name email');
  
  res.status(StatusCodes.OK).json({ booking: updatedBooking });
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel booking
 *     description: Cancel a booking (sets status to 'cancelled')
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
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', auth, async (req, res) => {
  const { id: bookingId } = req.params;
  let booking;
  
  // Different queries based on user role
  if (req.user.role === 'client') {
    booking = await Booking.findOne({
      _id: bookingId,
      client: req.user.userId
    });
  } else if (req.user.role === 'photographer') {
    booking = await Booking.findOne({
      _id: bookingId,
      assignedPhotographer: req.user.userId
    });
  } else if (req.user.role === 'admin') {
    // Admins can cancel any booking
    booking = await Booking.findById(bookingId);
  }
  
  if (!booking) {
    throw new NotFoundError(`No booking with id: ${bookingId}`);
  }
  
  booking.status = 'cancelled';
  await booking.save();
  
  res.status(StatusCodes.OK).json({ 
    message: 'Booking cancelled successfully',
    booking 
  });
});

// Get available bookings for photographers
router.get('/available', auth, photographerOrAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { 
        photographerId: null,
        status: 'pending'
      }
    });
    
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching available bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Photographer accepts booking
router.patch('/:id/accept', auth, photographerOrAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.photographerId) {
      return res.status(400).json({ success: false, message: 'Booking already assigned to a photographer' });
    }
    
    booking.photographerId = req.user.userId;
    booking.status = 'confirmed';
    
    if (req.body.additionalDetails) {
      booking.additionalDetails = booking.additionalDetails + '\n\nPhotographer note: ' + req.body.additionalDetails;
    }
    
    await booking.save();
    
    res.status(200).json({ success: true, message: 'Booking accepted successfully', booking });
  } catch (error) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin updates booking status
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    booking.status = req.body.status;
    await booking.save();
    
    res.status(200).json({ success: true, message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;