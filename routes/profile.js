import express from 'express';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Set up temporary storage for multer
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Instead of throwing an error, pass false to indicate rejection
    // with a custom error message
    cb(null, false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /api/profile/picture:
 *   post:
 *     summary: Upload or update profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profilePicture
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile picture updated successfully
 *                 profilePicture:
 *                   type: string
 *                   example: https://res.cloudinary.com/yourcloud/image/upload/v1234567890/profile-pictures/profile-1-1234567890.jpg
 *       400:
 *         description: Invalid file type or missing file
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get user's profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profilePicture:
 *                   type: string
 *                   example: https://res.cloudinary.com/yourcloud/image/upload/v1234567890/profile-pictures/profile-1-1234567890.jpg
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete user's profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture reset to default
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile picture reset to default
 *                 profilePicture:
 *                   type: string
 *                   example: https://res.cloudinary.com/yourcloud/image/upload/v1/profile-pictures/default-profile.jpg
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     description: Upload or change user's profile picture to Cloudinary
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: Invalid file type or no file uploaded
 */
router.post('/picture', auth, upload.single('profilePicture'), async (req, res) => {
  // Check if file was provided and accepted by the filter
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      success: false, 
      message: 'Only image files are allowed!'
    });
  }

  try {
    // Get the user
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete old profile picture from Cloudinary if it exists and isn't the default
    if (user.profilePicture && !user.profilePicture.includes('default-profile')) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    // Convert buffer to data URI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "profile-pictures",
      public_id: `profile-${req.user.userId}-${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: "limit" }]
    });

    // Update user's profile picture with Cloudinary URL
    user.profilePicture = result.secure_url;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Error uploading profile picture: ' + error.message
    });
  }
});

/**
 * @swagger
 * /api/profile/picture:
 *   get:
 *     summary: Get profile picture
 *     description: Get the current user's profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture URL
 */
router.get('/picture', auth, async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    profilePicture: user.profilePicture
  });
});

/**
 * @swagger
 * /api/profile/picture:
 *   delete:
 *     summary: Delete profile picture
 *     description: Reset user's profile picture to default
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture reset successfully
 */
router.delete('/picture', auth, async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Delete old profile picture from Cloudinary if it exists and isn't the default
  if (user.profilePicture && !user.profilePicture.includes('default-profile')) {
    const publicId = user.profilePicture.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    }
  }

  // Reset to default
  const defaultProfileUrl = 'https://res.cloudinary.com/dornqaxya/image/upload/pfp_nopglh.webp';
  user.profilePicture = defaultProfileUrl;
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile picture reset to default',
    profilePicture: defaultProfileUrl
  });
});

export default router;
