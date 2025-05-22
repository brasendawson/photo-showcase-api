import Review from '../models/Review.js';
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
        const reviews = await Review.findAll({
            where: { photoId: req.params.photoId },
            include: ['user']
        });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        logger.error('Error fetching reviews:', error);
        res.status(500).json({
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