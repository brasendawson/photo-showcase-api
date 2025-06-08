import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Service from '../models/Service.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Photography service management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: Service ID
 *         name:
 *           type: string
 *           description: Service name
 *         description:
 *           type: string
 *           description: Service description
 *         price:
 *           type: number
 *           description: Service price
 *         duration:
 *           type: string
 *           description: Service duration (e.g., "1-2 hours")
 *         imageUrl:
 *           type: string
 *           description: URL of the service image
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the service is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (admin only)
 *     tags: [Services]
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
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The service image file to upload
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input or missing image
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all services
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service found
 *       404:
 *         description: Service not found
 *   patch:
 *     summary: Update service (admin only)
 *     tags: [Services]
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
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New service image file (optional if not changing)
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Service not found
 *   delete:
 *     summary: Delete service (admin only)
 *     description: Remove a photography service and delete associated image from Cloudinary
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Service not found
 */

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
        folder: 'service-images',
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
 * /api/services:
 *   get:
 *     summary: Get all services
 *     description: Retrieve all photography services offered by the studio
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of all services
 */
router.get('/', async (req, res) => {
  // Removed the isActive filter to show all services
  const services = await Service.findAll({
    order: [['name', 'ASC']]
  });
  
  res.status(StatusCodes.OK).json({ services });
});

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     description: Retrieve details of a specific service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get('/:id', async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  
  if (!service) {
    throw new NotFoundError(`No service with id ${req.params.id}`);
  }
  
  res.status(StatusCodes.OK).json({ service });
});

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create new service
 *     description: Add a new photography service (Admin only)
 *     tags: [Services]
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
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Service image is required');
    }
    
    const { name, description, price, duration } = req.body;
    
    // Upload the buffer directly to Cloudinary
    const imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    
    const service = await Service.create({
      name,
      description,
      price,
      duration,
      imageUrl
    });
    
    res.status(201).json({ success: true, service });
  } catch (error) {
    if (error.name === 'BadRequestError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to create service: ${error.message}`);
    }
  }
});

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Update service
 *     description: Update an existing photography service (Admin only)
 *     tags: [Services]
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
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (optional if not changing)
 *               isActive:
 *                 type: boolean
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      throw new NotFoundError(`No service with id ${req.params.id}`);
    }
    
    // Prepare the update data
    const updateData = { ...req.body };
    
    // If a new image was uploaded, update the imageUrl
    if (req.file) {
      // Upload the new image to Cloudinary
      const imageUrl = await uploadBufferToCloudinary(req.file.buffer);
      
      // If there's an existing image, delete it from Cloudinary
      if (service.imageUrl) {
        try {
          // Extract the public ID from the URL
          const publicId = 'service-images/' + service.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // Continue with update even if old image deletion fails
        }
      }
      
      updateData.imageUrl = imageUrl;
    }
    
    await service.update(updateData);
    res.status(StatusCodes.OK).json({ service });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to update service: ${error.message}`);
    }
  }
});

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete service
 *     description: Remove a photography service and delete associated image from Cloudinary
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      throw new NotFoundError(`No service with id ${req.params.id}`);
    }
    
    // Delete the image from Cloudinary if it exists
    if (service.imageUrl) {
      try {
        const publicId = 'service-images/' + service.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }
    
    // Soft delete by marking as inactive
    await service.update({ isActive: false });
    
    res.status(StatusCodes.OK).json({ message: 'Service removed successfully' });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw error;
    } else {
      throw new BadRequestError(`Failed to delete service: ${error.message}`);
    }
  }
});

export default router;
