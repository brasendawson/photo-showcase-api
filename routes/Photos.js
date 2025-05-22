import express from 'express';
import multer from 'multer';
import { 
    createPhoto, 
    getAllPhotos, 
    getPhotoById,
    updatePhoto,
    deletePhoto,
    getPhotosByCategory
} from '../controllers/photoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Photos
 *   description: Photo management endpoints
 */

/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Upload a new photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *               - title
 *               - category
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, png, etc.)
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 title: "Beautiful Sunset"
 *                 imageUrl: "https://res.cloudinary.com/..."
 *                 category: "landscape"
 *       400:
 *         description: Invalid input or file upload error
 *       401:
 *         description: Not authenticated
 *   get:
 *     summary: Get all photos
 *     tags: [Photos]
 *     responses:
 *       200:
 *         description: List of photos
 */

/**
 * @swagger
 * /api/photos/{id}:
 *   get:
 *     summary: Get photo by ID
 *     tags: [Photos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo details
 *   put:
 *     summary: Update photo
 *     tags: [Photos]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *   delete:
 *     summary: Delete photo
 *     tags: [Photos]
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
 *         description: Photo deleted successfully
 */

// Configure multer for memory storage instead of disk
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file.originalname);
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  }
}).single('photo');

// Wrap upload middleware
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    console.log('Upload middleware executed', { error: err?.message });
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
};

// Routes
router.post('/', auth, uploadMiddleware, createPhoto);
router.get('/', getAllPhotos);
router.get('/:id', getPhotoById);
router.put('/:id', auth, updatePhoto);
router.delete('/:id', auth, deletePhoto);
router.get('/category/:category', getPhotosByCategory);

export default router;