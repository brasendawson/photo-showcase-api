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
                    as: 'bookingPhotographer',
                    attributes: ['username', 'email']
                },
                {
                    model: User,
                    as: 'bookingClient',
                    attributes: ['username', 'email']
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
                as: 'bookingPhotographer',  // Updated alias
                attributes: ['username', 'email']
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

export const getPhotographerBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { photographerId: req.params.id },
            include: [{
                model: User,
                as: 'bookingClient',  // Updated alias
                attributes: ['username', 'email']
            }]
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        logger.error('Error fetching photographer bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching bookings'
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

        // Check authorization
        if (booking.userId !== req.user.id && booking.photographerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this booking'
            });
        }

        await booking.update(req.body);

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        logger.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating booking'
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        // Check authorization
        if (booking.userId !== req.user.id && booking.photographerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this booking'
            });
        }

        await booking.update({ status: 'cancelled' });

        res.json({
            success: true,
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
                { association: 'client' },        // Changed from bookingClient
                { association: 'photographer' }    // Changed from assignedPhotographer
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