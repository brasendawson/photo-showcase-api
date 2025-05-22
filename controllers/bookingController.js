import Booking from '../models/Booking.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const createBooking = async (req, res) => {
    try {
        const booking = await Booking.create({
            ...req.body,
            userId: req.user.id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: booking
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
                as: 'photographer',
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
                as: 'client',
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