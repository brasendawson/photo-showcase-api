import Booking from '../models/Booking.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const createBooking = async (req, res) => {
    try {
        // First check if photographer exists and is actually a photographer
        const photographer = await User.findOne({
            where: {
                id: req.body.photographerId,
                role: 'photographer'
            }
        });

        if (!photographer) {
            return res.status(404).json({
                success: false,
                error: 'Photographer not found'
            });
        }

        // Validate that user isn't booking themselves
        if (req.user.id === req.body.photographerId) {
            return res.status(400).json({
                success: false,
                error: 'You cannot book yourself'
            });
        }

        // Create the booking
        const booking = await Booking.create({
            ...req.body,
            userId: req.user.id,
            status: 'pending'
        });

        // Fetch the complete booking with correct aliases
        const completeBooking = await Booking.findByPk(booking.id, {
            include: [
                {
                    model: User,
                    as: 'photographer',  // Changed from bookingPhotographer
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'client',  // Changed from bookingClient
                    attributes: ['id', 'username', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: completeBooking
        });
    } catch (error) {
        logger.error('Booking creation failed:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating booking'
        });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [{
                model: User,
                as: 'photographer',  // Changed from bookingPhotographer
                attributes: ['id', 'username', 'email']
            }]
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        logger.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching bookings'
        });
    }
};

// Get photographer's bookings
export const getPhotographerBookings = async (req, res) => {
  try {
    const photographerId = req.user.id;
    
    const bookings = await Booking.findAll({
      where: { photographerId },
      include: [
        { model: User, as: 'client', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching photographer bookings"
    });
  }
};

export const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Define who can update what
        const isClient = booking.userId === req.user.id;
        const isPhotographer = booking.photographerId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        
        if (!isClient && !isPhotographer && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this booking'
            });
        }

        // Validate status if included in the request
        if (req.body.status) {
            // These must exactly match the values in your ENUM definition in the model
            const validStatuses = ['pending', 'confirmed', 'completed', 'canceled']; 
            if (!validStatuses.includes(req.body.status)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid status value. Status must be one of: ${validStatuses.join(', ')}`
                });
            }
        }

        // Only photographers and admins can mark bookings as completed
        if (req.body.status === 'completed') {
            if (!isPhotographer && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Only photographers and admins can mark bookings as completed'
                });
            }
            
            // A booking can only be marked as completed if it was confirmed
            if (booking.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    error: 'Only confirmed bookings can be marked as completed'
                });
            }
        }

        let updateData = {};

        // Client can only update certain fields
        if (isClient && !isAdmin) {
            // Remove status from request body if client tries to change it
            const { status, ...clientUpdates } = req.body;
            
            // Only allow client to update these fields
            const allowedFields = ['date', 'location', 'notes', 'package'];
            
            // Filter to only allowed fields
            Object.keys(clientUpdates).forEach(key => {
                if (allowedFields.includes(key)) {
                    updateData[key] = clientUpdates[key];
                }
            });
        } 
        // Photographer can update status and notes
        else if (isPhotographer && !isAdmin) {
            const allowedFields = ['status', 'notes'];
            
            Object.keys(req.body).forEach(key => {
                if (allowedFields.includes(key)) {
                    updateData[key] = req.body[key];
                }
            });
        }
        // Admin can update anything
        else if (isAdmin) {
            updateData = req.body;
        }

        // Perform the update
        await booking.update(updateData);

        // Return the updated booking
        const updatedBooking = await Booking.findByPk(booking.id, {
            include: [
                { model: User, as: 'client', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'photographer', attributes: ['id', 'username', 'email'] }
            ]
        });

        res.json({
            success: true,
            data: updatedBooking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        
        // Provide more detailed error for debugging
        const errorMessage = error.original ? 
            `Error updating booking: ${error.original.sqlMessage || error.message}` : 
            'Error updating booking';
            
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// Update the cancelBooking function to handle completed bookings
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // User permissions
        const isClient = booking.userId === req.user.id;
        const isPhotographer = booking.photographerId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        
        if (!isClient && !isPhotographer && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this booking'
            });
        }

        // If it's already cancelled, return success but mention it
        if (booking.status === 'canceled') {
            return res.json({
                success: true,
                message: 'Booking was already cancelled',
                data: booking
            });
        }

        // Don't allow cancellation of completed bookings (unless admin)
        if (booking.status === 'completed' && !isAdmin) {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel a completed booking'
            });
        }

        await booking.update({ status: 'canceled' });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        logger.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Error cancelling booking'
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, as: 'client', attributes: ['id', 'username', 'email'] },
                { model: User, as: 'photographer', attributes: ['id', 'username', 'email'] }
            ]
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        logger.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, error: 'Error fetching bookings' });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { association: 'bookings' },           // Changed from clientBookings
                { association: 'photographerBookings' } // Changed from assignedBookings
            ]
        });
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('Error fetching user bookings:', error);
        res.status(500).json({ success: false, error: 'Error fetching bookings' });
    }
};