import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import AboutContent from '../models/AboutContent.js';
import SocialMedia from '../models/SocialMedia.js';
import ContactInfo from '../models/ContactInfo.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Get active about page content
 *     description: Retrieve the currently active about page content
 *     tags: [About]
 *     responses:
 *       200:
 *         description: About page content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No active about content found
 */
router.get('/', async (req, res) => {
  try {
    const aboutContent = await AboutContent.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    if (!aboutContent) {
      throw new NotFoundError('No about content found');
    }

    res.status(StatusCodes.OK).json(aboutContent);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error retrieving about content'
    });
  }
});

/**
 * @swagger
 * /api/about:
 *   post:
 *     summary: Create new about page content
 *     description: Create new about page content (admin only)
 *     tags: [About]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title for the about page
 *               content:
 *                 type: string
 *                 description: Content for the about page
 *               makeActive:
 *                 type: boolean
 *                 description: Whether to make this the active about content
 *                 default: true
 *     responses:
 *       201:
 *         description: About content created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, makeActive = true } = req.body;
    
    if (!title || !content) {
      throw new BadRequestError('Title and content are required');
    }

    const aboutContent = await AboutContent.create({
      title,
      content,
      isActive: makeActive
    });

    // If this is active, deactivate all other content
    if (makeActive) {
      await AboutContent.update(
        { isActive: false },
        { 
          where: { 
            id: { [Op.ne]: aboutContent.id } // Use Op instead of sequelize.Op
          }
        }
      );
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'About content created successfully',
      aboutContent
    });
  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error creating about content'
    });
  }
});

/**
 * @swagger
 * /api/about/{id}:
 *   patch:
 *     summary: Update about page content
 *     description: Update an existing about page content (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: About content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title for the about page
 *               content:
 *                 type: string
 *                 description: Content for the about page
 *               makeActive:
 *                 type: boolean
 *                 description: Whether to make this the active about content
 *     responses:
 *       200:
 *         description: About content updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: About content not found
 */
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, makeActive } = req.body;
    
    const aboutContent = await AboutContent.findByPk(id);
    
    if (!aboutContent) {
      throw new NotFoundError(`No about content found with id ${id}`);
    }
    
    // Update fields if provided
    if (title !== undefined) aboutContent.title = title;
    if (content !== undefined) aboutContent.content = content;
    if (makeActive !== undefined) aboutContent.isActive = makeActive;
    
    await aboutContent.save();
    
    // If this is active, deactivate all other content
    if (makeActive) {
      await AboutContent.update(
        { isActive: false },
        { 
          where: { 
            id: { [Op.ne]: aboutContent.id } // Use Op instead of sequelize.Op
          }
        }
      );
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'About content updated successfully',
      aboutContent
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error updating about content'
    });
  }
});

/**
 * @swagger
 * /api/about/all:
 *   get:
 *     summary: Get all about page content versions
 *     description: Retrieve all about page content versions (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all about content versions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const aboutContents = await AboutContent.findAll({
      order: [['updatedAt', 'DESC']]
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: aboutContents.length,
      aboutContents
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error retrieving about content'
    });
  }
});

/**
 * @swagger
 * /api/about/complete:
 *   get:
 *     summary: Get complete about page data
 *     description: Retrieve about content, social media links and contact info
 *     tags: [About]
 *     responses:
 *       200:
 *         description: Complete about page data
 *       500:
 *         description: Server error
 */
router.get('/complete', async (req, res) => {
  try {
    const aboutContent = await AboutContent.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    const socialMediaLinks = await SocialMedia.findAll({
      where: { isActive: true }
    });

    const contactInfo = await ContactInfo.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      about: aboutContent || null,
      socialMedia: socialMediaLinks || [],
      contact: contactInfo || null
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error retrieving about page data'
    });
  }
});

/**
 * @swagger
 * /api/about/social:
 *   get:
 *     summary: Get all social media links
 *     description: Retrieve all active social media links
 *     tags: [About]
 *     responses:
 *       200:
 *         description: List of social media links
 */
router.get('/social', async (req, res) => {
  try {
    const socialMediaLinks = await SocialMedia.findAll({
      where: { isActive: true }
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: socialMediaLinks.length,
      socialMedia: socialMediaLinks
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error retrieving social media links'
    });
  }
});

/**
 * @swagger
 * /api/about/social:
 *   post:
 *     summary: Add social media link
 *     description: Add a new social media link (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - url
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Social media platform name
 *               url:
 *                 type: string
 *                 description: URL to social media profile
 *               icon:
 *                 type: string
 *                 description: Icon name or class for the platform
 *     responses:
 *       201:
 *         description: Social media link added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post('/social', auth, adminOnly, async (req, res) => {
  try {
    const { platform, url, icon } = req.body;
    
    if (!platform || !url) {
      throw new BadRequestError('Platform and URL are required');
    }

    const socialMedia = await SocialMedia.create({
      platform,
      url,
      icon,
      isActive: true
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Social media link added successfully',
      socialMedia
    });
  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error adding social media link'
    });
  }
});

/**
 * @swagger
 * /api/about/social/{id}:
 *   patch:
 *     summary: Update social media link
 *     description: Update an existing social media link (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Social media ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *               url:
 *                 type: string
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Social media link updated successfully
 *       404:
 *         description: Social media link not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.patch('/social/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon, isActive } = req.body;
    
    const socialMedia = await SocialMedia.findByPk(id);
    
    if (!socialMedia) {
      throw new NotFoundError(`No social media link found with id ${id}`);
    }
    
    // Update fields if provided
    if (platform !== undefined) socialMedia.platform = platform;
    if (url !== undefined) socialMedia.url = url;
    if (icon !== undefined) socialMedia.icon = icon;
    if (isActive !== undefined) socialMedia.isActive = isActive;
    
    await socialMedia.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Social media link updated successfully',
      socialMedia
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error updating social media link'
    });
  }
});

/**
 * @swagger
 * /api/about/social/{id}:
 *   delete:
 *     summary: Delete social media link
 *     description: Delete a social media link (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Social media ID
 *     responses:
 *       200:
 *         description: Social media link deleted successfully
 *       404:
 *         description: Social media link not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.delete('/social/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const socialMedia = await SocialMedia.findByPk(id);
    
    if (!socialMedia) {
      throw new NotFoundError(`No social media link found with id ${id}`);
    }
    
    await socialMedia.destroy();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Social media link deleted successfully'
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error deleting social media link'
    });
  }
});

/**
 * @swagger
 * /api/about/contact:
 *   get:
 *     summary: Get contact information
 *     description: Retrieve active contact information
 *     tags: [About]
 *     responses:
 *       200:
 *         description: Contact information
 *       404:
 *         description: No contact information found
 */
router.get('/contact', async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });
    
    if (!contactInfo) {
      throw new NotFoundError('No contact information found');
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      contactInfo
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error retrieving contact information'
    });
  }
});

/**
 * @swagger
 * /api/about/contact:
 *   post:
 *     summary: Create contact information
 *     description: Create new contact information (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessHours:
 *                 type: string
 *               makeActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Contact information created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post('/contact', auth, adminOnly, async (req, res) => {
  try {
    const { email, phone, address, businessHours, makeActive = true } = req.body;
    
    if (!email || !phone || !address) {
      throw new BadRequestError('Email, phone, and address are required');
    }

    const contactInfo = await ContactInfo.create({
      email,
      phone,
      address,
      businessHours,
      isActive: makeActive
    });
    
    // If this is active, deactivate all other contact info
    if (makeActive) {
      await ContactInfo.update(
        { isActive: false },
        { 
          where: { 
            id: { [Op.ne]: contactInfo.id }
          }
        }
      );
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Contact information created successfully',
      contactInfo
    });
  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error creating contact information'
    });
  }
});

/**
 * @swagger
 * /api/about/contact/{id}:
 *   patch:
 *     summary: Update contact information
 *     description: Update existing contact information (admin only)
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact info ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessHours:
 *                 type: string
 *               makeActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contact information updated successfully
 *       404:
 *         description: Contact information not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.patch('/contact/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, address, businessHours, makeActive } = req.body;
    
    const contactInfo = await ContactInfo.findByPk(id);
    
    if (!contactInfo) {
      throw new NotFoundError(`No contact information found with id ${id}`);
    }
    
    // Update fields if provided
    if (email !== undefined) contactInfo.email = email;
    if (phone !== undefined) contactInfo.phone = phone;
    if (address !== undefined) contactInfo.address = address;
    if (businessHours !== undefined) contactInfo.businessHours = businessHours;
    if (makeActive !== undefined) contactInfo.isActive = makeActive;
    
    await contactInfo.save();
    
    // If this is active, deactivate all other contact info
    if (makeActive) {
      await ContactInfo.update(
        { isActive: false },
        { 
          where: { 
            id: { [Op.ne]: contactInfo.id }
          }
        }
      );
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Contact information updated successfully',
      contactInfo
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error updating contact information'
    });
  }
});

export default router;