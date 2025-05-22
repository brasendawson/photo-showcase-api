import Photos from '../models/Photos.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

export const createPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    // Validate other required fields
    if (!req.body.title || !req.body.category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
      });
    }

    logger.info('Starting photo upload', {
      filename: req.file.originalname,
      size: req.file.size
    });

    // Upload to Cloudinary with explicit Promise handling
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "photo-showcase",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload failed:', error);
            reject(error);
            return;
          }
          // Log the result immediately when we get it
          logger.info('Cloudinary upload completed', {
            url: result.secure_url,
            public_id: result.public_id
          });
          resolve(result);
        }
      );

      // Handle stream errors
      uploadStream.on('error', (error) => {
        logger.error('Stream error:', error);
        reject(error);
      });

      // Send the file to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Immediately check and use the Cloudinary response
    if (!uploadResponse?.secure_url) {
      logger.error('No URL in Cloudinary response:', uploadResponse);
      throw new Error('Upload failed - no URL received');
    }

    // Create database record immediately after getting URL
    const photo = await Photos.create({
      title: req.body.title,
      description: req.body.description || '',
      imageUrl: uploadResponse.secure_url,
      category: req.body.category,
      photographerId: req.user.id
    });

    // Send response immediately after database creation
    res.status(201).json({ 
      success: true, 
      data: {
        id: photo.id,
        title: photo.title,
        imageUrl: uploadResponse.secure_url, // Use the URL directly from Cloudinary response
        category: photo.category
      }
    });

  } catch (error) {
    // If we get here, something went wrong
    logger.error('Upload process failed:', {
      error: error.message,
      stack: error.stack
    });
    
    // Make sure we haven't already sent a response
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Upload failed. Please try again.' 
      });
    }
  }
};

export const getAllPhotos = async (req, res) => {
    try {
        const photos = await Photos.findAll({
            include: [
                {
                    model: User,
                    as: 'photographer',
                    attributes: ['id', 'username']
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: ['rating', 'comment']
                }
            ],
            attributes: [
                'id',
                'title',
                'description',
                'imageUrl',  // Cloudinary URL
                'category',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });

        // Validate Cloudinary URLs
        const validatedPhotos = photos.map(photo => {
            const photoObj = photo.toJSON();
            if (!photoObj.imageUrl.startsWith('https://res.cloudinary.com/')) {
                logger.warn(`Invalid Cloudinary URL for photo ID ${photoObj.id}`);
                photoObj.imageUrl = null; // or set a default image
            }
            return photoObj;
        });

        if (!photos.length) {
            logger.info('No photos found in database');
            return res.status(200).json({
                success: true,
                message: 'No photos uploaded yet',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            count: validatedPhotos.length,
            data: validatedPhotos
        });

    } catch (error) {
        logger.error('Error fetching photos:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: 'Error fetching photos'
        });
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