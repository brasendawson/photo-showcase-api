import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Photo from '../models/Photos.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';

const router = express.Router();

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - imageUrl
 *               - photographerName
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
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
 */
router.post('/', auth, adminOnly, async (req, res) => {
  const photo = await Photo.create(req.body);
  res.status(StatusCodes.CREATED).json({ photo });
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
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
router.patch('/:id', auth, adminOnly, async (req, res) => {
  const { id: photoId } = req.params;
  const photo = await Photo.findByPk(photoId);
  
  if (!photo) {
    throw new NotFoundError(`No photo with id: ${photoId}`);
  }
  
  await photo.update(req.body);
  res.status(StatusCodes.OK).json({ photo });
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
  const { id: photoId } = req.params;
  const photo = await Photo.findByPk(photoId);
  
  if (!photo) {
    throw new NotFoundError(`No photo with id: ${photoId}`);
  }
  
  await photo.destroy();
  res.status(StatusCodes.OK).json({ msg: 'Success! Photo deleted.' });
});

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
 */

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