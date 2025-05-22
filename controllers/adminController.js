import User from '../models/User.js';
import Review from '../models/Review.js';
import Photos from '../models/Photos.js';
import logger from '../utils/logger.js';
import ActivityLog from '../models/ActivityLog.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'isActive'],
            raw: true
        });
        
        res.json({ 
            success: true, 
            count: users.length,
            data: users 
        });
    } catch (error) {
        logger.error('Admin getAllUsers failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

export const updateUserRole = async (req, res) => {
  try {
    const { username, newRole } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    await user.update({ role: newRole });
    
    await ActivityLog.create({
      adminId: req.user.id,
      action: 'UPDATE_USER_ROLE',
      details: `Changed user ${username} role to ${newRole}`
    });

    res.json({ 
      success: true, 
      message: 'User role updated successfully' 
    });
  } catch (error) {
    logger.error('Admin updateUserRole failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const moderateContent = async (req, res) => {
  try {
    const { id, contentType, action } = req.body;
    
    if (!['delete', 'flag', 'restore'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either delete, flag, or restore'
      });
    }

    switch (contentType) {
      case 'review':
        const review = await Review.findByPk(id);
        if (!review) {
          return res.status(404).json({
            success: false,
            error: 'Review not found'
          });
        }
        if (action === 'delete') {
          await review.destroy();
        } else if (action === 'flag') {
          await review.update({
            needsReview: true,
            isVisible: false,
            status: 'pending',
            isModerated: false
          });
        } else if (action === 'restore') {
          await review.update({
            needsReview: false,
            isVisible: true,
            status: 'approved',
            isModerated: true
          });
        }
        break;

      case 'photo':
        const photo = await Photos.findByPk(id);
        if (!photo) {
          return res.status(404).json({
            success: false,
            error: 'Photo not found'
          });
        }
        if (action === 'delete') {
          await photo.destroy();
        } else if (action === 'flag') {
          await photo.update({
            needsReview: true,
            isVisible: false,
            status: 'pending',
            isModerated: false
          });
        } else if (action === 'restore') {
          await photo.update({
            needsReview: false,
            isVisible: true,
            status: 'approved',
            isModerated: true
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Content type must be either review or photo'
        });
    }

    // Log the moderation action
    await ActivityLog.create({
      adminId: req.user.id,
      action: `MODERATE_${contentType.toUpperCase()}`,
      details: `${action}ed ${contentType} ${id}`
    });

    // Fix spelling in response message
    const message = action === 'restore' 
        ? `${contentType} has been restored successfully`
        : `${contentType} has been ${action}ed successfully`;

    res.json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Admin moderateContent failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateContentStatus = async (req, res) => {
  try {
    const { id, contentType, updates } = req.body;
    let content;

    switch (contentType) {
      case 'review':
        content = await Review.findByPk(id);
        if (!content) {
          return res.status(404).json({
            success: false,
            error: 'Review not found'
          });
        }
        await content.update(updates);
        break;

      case 'photo':
        content = await Photos.findByPk(id);
        if (!content) {
          return res.status(404).json({
            success: false,
            error: 'Photo not found'
          });
        }
        await content.update(updates);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Content type must be either review or photo'
        });
    }

    await ActivityLog.create({
      adminId: req.user.id,
      action: 'UPDATE_CONTENT_STATUS',
      details: `Updated ${contentType} ${id} status: ${JSON.stringify(updates)}`
    });

    res.json({
      success: true,
      message: 'Content status updated successfully',
      updates
    });
  } catch (error) {
    logger.error('Admin updateContentStatus failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};