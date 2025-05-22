import Photos from '../models/Photos.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

export const createPhoto = async (req, res) => {
  try {
    // Convert buffer to stream
    const stream = Readable.from(req.file.buffer);
    
    // Upload to cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "photo-showcase",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      stream.pipe(uploadStream);
    });

    // Save to database
    const photo = await Photos.create({
      title: req.body.title,
      imageUrl: uploadResponse.secure_url,
      category: req.body.category,
      photographerId: req.user.id
    });

    res.status(201).json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photos.findAll({
            include: [
                { association: 'photographer' },  // Changed from imageCreator
                { association: 'reviews' }        // Changed from photoReviews
            ]
        });
        res.json({ success: true, data: photos });
    } catch (error) {
        logger.error('Error fetching photos:', error);
        res.status(500).json({ success: false, error: 'Error fetching photos' });
    }
};

export const getPhotoById = async (req, res) => {
    try {
        const photo = await Photos.findByPk(req.params.id, {
            include: [
                { association: 'photographer' },  // Changed from imageCreator
                { association: 'reviews' },       // Changed from photoReviews
                { association: 'category' }       // Changed from photoCategory
            ]
        });
        
        if (!photo) {
            return res.status(404).json({ success: false, error: 'Photo not found' });
        }
        
        res.json({ success: true, data: photo });
    } catch (error) {
        logger.error('Error fetching photo:', error);
        res.status(500).json({ success: false, error: 'Error fetching photo' });
    }
};

export const updatePhoto = async (req, res) => {
    try {
        const photo = await Photos.findByPk(req.params.id);
        
        if (!photo) {
            return res.status(404).json({
                success: false,
                error: 'Photo not found'
            });
        }

        // Check if user owns the photo
        if (photo.photographerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this photo'
            });
        }

        await photo.update(req.body);

        res.json({
            success: true,
            data: photo
        });
    } catch (error) {
        logger.error('Error updating photo:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating photo'
        });
    }
};

export const deletePhoto = async (req, res) => {
    try {
        const photo = await Photos.findByPk(req.params.id);
        
        if (!photo) {
            return res.status(404).json({
                success: false,
                error: 'Photo not found'
            });
        }

        // Check if user owns the photo
        if (photo.photographerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this photo'
            });
        }

        await photo.destroy();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting photo'
        });
    }
};

export const getPhotosByCategory = async (req, res) => {
    try {
        const photos = await Photos.findAll({
            where: {
                categoryId: req.params.categoryId
            },
            include: [
                { association: 'photographer' },  // Changed from imageCreator
                { association: 'reviews' }        // Changed from photoReviews
            ]
        });
        
        res.json({ success: true, data: photos });
    } catch (error) {
        logger.error('Error fetching photos by category:', error);
        res.status(500).json({ success: false, error: 'Error fetching photos' });
    }
};