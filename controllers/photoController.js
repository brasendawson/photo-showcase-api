import Photos from '../models/Photos.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

export const createPhoto = async (req, res) => {
  try {
    // Log incoming request
    console.log('Upload request received:', {
      file: req.file ? 'Present' : 'Missing',
      body: req.body,
      user: req.user.id
    });

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    // Validate required fields
    if (!req.body.title || !req.body.category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
      });
    }

    // Upload to Cloudinary
    try {
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "photo-showcase" },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload failed:', error);
              reject(error);
              return;
            }
            console.log('Cloudinary upload successful:', result);
            resolve(result);
          }
        );

        // Create readable stream from buffer and pipe to Cloudinary
        const stream = new Readable();
        stream.push(req.file.buffer);
        stream.push(null);
        stream.pipe(uploadStream);
      });

      console.log('Creating database record with URL:', uploadResponse.secure_url);

      // Create database record
      const photo = await Photos.create({
        title: req.body.title,
        description: req.body.description || '',
        imageUrl: uploadResponse.secure_url,
        category: req.body.category,
        photographerId: req.user.id,
        isVisible: true,
        needsReview: false
      });

      console.log('Database record created:', photo.id);

      return res.status(201).json({
        success: true,
        data: {
          id: photo.id,
          title: photo.title,
          imageUrl: photo.imageUrl,
          category: photo.category,
          photographerId: photo.photographerId
        }
      });

    } catch (uploadError) {
      console.error('Upload process failed:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to process image upload'
      });
    }

  } catch (error) {
    console.error('Photo creation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Photo upload failed'
    });
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
            where: req.user?.role === 'admin' ? {} : { isVisible: true }, // Only admins see flagged photos
            attributes: [
                'id',
                'title',
                'description',
                'imageUrl',
                'category',
                'createdAt',
                'isVisible',
                'needsReview'
            ],
            order: [['createdAt', 'DESC']]
        });

        // Validate and filter photos
        const validatedPhotos = photos.map(photo => {
            const photoObj = photo.toJSON();
            if (!photoObj.imageUrl.startsWith('https://res.cloudinary.com/')) {
                logger.warn(`Invalid Cloudinary URL for photo ID ${photoObj.id}`);
                photoObj.imageUrl = null;
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
            ]
        });
        
        if (!photo) {
            return res.status(404).json({ 
                success: false, 
                error: 'Photo not found' 
            });
        }

        // Check if photo is flagged and user is not admin
        if (!photo.isVisible && (!req.user || req.user.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'This photo has been flagged for review and is temporarily unavailable'
            });
        }
        
        res.json({ 
            success: true, 
            data: {
                id: photo.id,
                title: photo.title,
                description: photo.description,
                imageUrl: photo.imageUrl,
                category: photo.category,
                photographerId: photo.photographerId,
                photographer: photo.photographer,
                reviews: photo.reviews,
                createdAt: photo.createdAt,
                updatedAt: photo.updatedAt
            }
        });
    } catch (error) {
        logger.error('Error fetching photo:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error fetching photo' 
        });
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
                categoryId: req.params.categoryId,
                ...(req.user?.role !== 'admin' && { isVisible: true }) // Only admins see flagged photos
            },
            include: [
                { association: 'photographer' },
                { association: 'reviews' }
            ]
        });
        
        res.json({ success: true, data: photos });
    } catch (error) {
        logger.error('Error fetching photos by category:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error fetching photos' 
        });
    }
};