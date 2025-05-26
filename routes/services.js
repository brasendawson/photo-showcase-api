import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Service from '../models/Service.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Invalid input
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Service not found
 *   delete:
 *     summary: Delete service (admin only)
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Service not found
 */

const router = express.Router();

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
  const services = await Service.findAll({
    where: { isActive: true },
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
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
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    const service = await Service.create({
      name,
      description,
      price,
      duration
    });
    
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: error.message });
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
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
router.patch('/:id', auth, adminOnly, async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  
  if (!service) {
    throw new NotFoundError(`No service with id ${req.params.id}`);
  }
  
  await service.update(req.body);
  res.status(StatusCodes.OK).json({ service });
});

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete service
 *     description: Remove a photography service (Admin only)
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
  const service = await Service.findByPk(req.params.id);
  
  if (!service) {
    throw new NotFoundError(`No service with id ${req.params.id}`);
  }
  
  // Soft delete by marking as inactive
  await service.update({ isActive: false });
  
  res.status(StatusCodes.OK).json({ message: 'Service removed successfully' });
});

export default router;
