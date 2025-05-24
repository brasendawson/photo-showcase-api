import Review from '../models/Review.js';
import Photos from '../models/Photos.js';  // Correct import
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const createReview = async (req, res) => {
    try {
        const review = await Review.create({
            ...req.body,
            userId: req.user.id,
            photoId: req.params.photoId
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        logger.error('Review creation failed:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating review'
        });
    }
};

export const getPhotoReviews = async (req, res) => {
    try {
        const photoId = req.params.photoId;
        
        // First check if the photo exists
        const photo = await Photos.findByPk(photoId);  // Changed from Photo to Photos
        
        if (!photo) {
            return res.status(404).json({
                success: false,
                error: "Photo not found"
            });
        }
        
        // If photo exists, get its reviews
        const reviews = await Review.findAll({
            where: { photoId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            ]
        });
        
        return res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        logger.error('Error fetching photo reviews:', error);
        return res.status(500).json({
            success: false,
            error: 'Error fetching reviews'
        });
    }
};


export const updateReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this review'
            });
        }

        await review.update(req.body);

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        logger.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating review'
        });
    }
};


export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this review'
            });
        }

        await review.destroy();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting review'
        });
    }
};