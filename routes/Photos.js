import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Photo from '../models/Photos.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

const router = express.Router();

// Set up multer with memory storage (no local files)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed'), false);
  }
};

// Set up multer upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Function to upload buffer to Cloudinary
const uploadBufferToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    // Create a readable stream from buffer
    const stream = Readable.from(buffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'photo-showcase',
        transformation: [{ width: 1200, crop: 'limit' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    
    // Pipe the stream to Cloudinary
    stream.pipe(uploadStream);
  });
};

/**
 * @swagger
 * tags:
 *   - name: Gallery
 *     description: Photo gallery and browsing operations
 *   - name: Gallery Management
 *     description: Photo administration and management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Photo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         photographerName:
 *           type: string
 *         type:
 *           type: string
 *           enum: [portrait, wedding, event, commercial, landscape, family, other]
 *         featured:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/photos:
 *   get:
 *     summary: Get all photos
 *     description: Retrieve all photos with optional filtering
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [portrait, wedding, event, commercial, landscape, family, other]
 *         description: Filter by photo type
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field(s), comma-separated with optional direction (e.g., createdAt:desc,title:asc)
 *     responses:
 *       200:
 *         description: A list of photos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Photo'
 *                 count:
 *                   type: integer
 */
router.get('/', async (req, res) => {
  const { type, featured, sort } = req.query;
  const queryObject = {};

  if (type) {
    queryObject.type = type;
  }

  if (featured === 'true') {
    queryObject.featured = true;
  }

  let order = [];
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      const [name, direction] = field.split(':');
      order.push([name, direction === 'desc' ? 'DESC' : 'ASC']);
    });
  } else {
    order.push(['createdAt', 'DESC']);
  }

  const photos = await Photo.findAll({
    where: queryObject,
    order
  });
  
  res.status(StatusCodes.OK).json({ photos, count: photos.length });
});

/**
 * @swagger
 * /api/photos/gallery:
 *   get:
 *     summary: Get gallery photos
 *     description: Retrieve photos for gallery display with optional type filtering
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [portrait, wedding, event, commercial, landscape, family, other]
 *         description: Filter by photo type
 *     responses:
 *       200:
 *         description: A list of gallery photos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       type:
 *                         type: string
 *                       photographerName:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/gallery', async (req, res) => {
  try {
    const { type } = req.query;
    
    // Filter options
    const queryOptions = {};
    if (type) {
      queryOptions.where = { type };
    }
    
    const photos = await Photo.findAll({
      ...queryOptions,
      attributes: ['id', 'title', 'imageUrl', 'type', 'photographerName']
    });
    
    res.status(200).json({ photos });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching gallery photos' 
    });
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   get:
 *     summary: Get a single photo
 *     description: Retrieve detailed information about a specific photo
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photo:
 *                   $ref: '#/components/schemas/Photo'
 *       404:
 *         description: Photo not found
 */
router.get('/:id', async (req, res) => {
  const { id: photoId } = req.params;
  const photo = await Photo.findByPk(photoId);
  
  if (!photo) {
    throw new NotFoundError(`No photo with id: ${photoId}`);
  }
  
  res.status(StatusCodes.OK).json({ photo });
});

/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Add a new photo
 *     description: Add a new photo to the gallery (admin only)
 *     tags: [Gallery Management]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - image
 *               - photographerName
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               photographerName:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [portrait, wedding, event, commercial, landscape, family, other]
 *                 default: other
 *               featured:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Photo created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       400:
 *         description: Bad request - invalid image or missing required fields
 */
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Image upload is required');
    }
    
    // Upload the buffer directly to Cloudinary
    const imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    
    // Create the photo with data from the form and the Cloudinary URL
    const photoData = {
      ...req.body,
      imageUrl
    };
    
    const photo = await Photo.create(photoData);
    res.status(StatusCodes.CREATED).json({ photo });
  } catch (error) {
    if (error.name === 'BadRequestError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to upload image: ${error.message}`);
    }
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   patch:
 *     summary: Update a photo
 *     description: Update an existing photo (admin only)
 *     tags: [Gallery Management]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (optional if not changing)
 *               photographerName:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [portrait, wedding, event, commercial, landscape, family, other]
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Photo not found
 */
router.patch('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { id: photoId } = req.params;
    const photo = await Photo.findByPk(photoId);
    
    if (!photo) {
      throw new NotFoundError(`No photo with id: ${photoId}`);
    }
    
    // Prepare the update data
    const updateData = { ...req.body };
    
    // If a new image was uploaded, update the imageUrl
    if (req.file) {
      // Upload the new image to Cloudinary
      const imageUrl = await uploadBufferToCloudinary(req.file.buffer);
      
      // If there's an existing image, delete it from Cloudinary
      if (photo.imageUrl) {
        try {
          // Extract the public ID from the URL
          const publicId = 'photo-showcase/' + photo.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // Continue with update even if old image deletion fails
        }
      }
      
      updateData.imageUrl = imageUrl;
    }
    
    await photo.update(updateData);
    res.status(StatusCodes.OK).json({ photo });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to update photo: ${error.message}`);
    }
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   delete:
 *     summary: Delete a photo
 *     description: Remove a photo from the gallery (admin only)
 *     tags: [Gallery Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Photo not found
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id: photoId } = req.params;
    const photo = await Photo.findByPk(photoId);
    
    if (!photo) {
      throw new NotFoundError(`No photo with id: ${photoId}`);
    }
    
    // Delete the image from Cloudinary if it exists
    if (photo.imageUrl) {
      try {
        const publicId = 'photo-showcase/' + photo.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }
    
    await photo.destroy();
    res.status(StatusCodes.OK).json({ msg: 'Success! Photo deleted.' });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to delete photo: ${error.message}`);
    }
  }
});

/**
 * Featured Status Filter
 * 
 * Purpose:
 * This feature allows website users to view only the best/showcase photos that have been 
 * specially selected by administrators to highlight the photographer's premium work.
 * 
 * Business Value:
 * 1. Promotional: Featured photos typically represent the photographer's best work
 * 2. Marketing: These photos can be used on the homepage or in promotional materials
 * 3. Portfolio Highlights: Allows quick access to exemplary photos for potential clients
 * 4. Curation: Gives admins control over which photos receive special visibility
 * 
 * Implementation:
 * - Photos have a boolean 'featured' flag in the database
 * - The API accepts a ?featured=true query parameter 
 * - When this parameter is present, only photos marked as featured are returned
 * - This enables the frontend to display special galleries of premium work
 */

export default router;