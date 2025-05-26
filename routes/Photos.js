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
 *           enum: [portrait, wedding, event, landscape, commercial, other]
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
 *     summary: Get photos for gallery display
 *     description: Retrieve photos with pagination for the public gallery
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [portrait, wedding, event, landscape, commercial, other]
 *         description: Filter by photo type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of photos per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Paginated gallery photos
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
 *                       title:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       type:
 *                         type: string
 *                       photographerName:
 *                         type: string
 *                 count:
 *                   type: integer
 *                 totalPhotos:
 *                   type: integer
 *                 numOfPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get('/gallery', async (req, res) => {
  const { type, limit = 20, page = 1 } = req.query;
  const queryObject = {};

  if (type) {
    queryObject.type = type;
  }

  const offset = (Number(page) - 1) * Number(limit);
  
  const photos = await Photo.findAll({
    where: queryObject,
    order: [
      ['featured', 'DESC'],
      ['createdAt', 'DESC']
    ],
    offset,
    limit: Number(limit),
    attributes: ['title', 'imageUrl', 'type', 'photographerName']
  });
    
  const totalPhotos = await Photo.count({ where: queryObject });
  const numOfPages = Math.ceil(totalPhotos / Number(limit));
  
  res.status(StatusCodes.OK).json({
    photos,
    count: photos.length,
    totalPhotos,
    numOfPages,
    currentPage: Number(page)
  });
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
 *                 enum: [portrait, wedding, event, landscape, commercial, other]
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
 *                 enum: [portrait, wedding, event, landscape, commercial, other]
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
 *           enum: [portrait, wedding, event, landscape, commercial, other]
 *         featured:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;