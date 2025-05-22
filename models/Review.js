import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Photos, { setupPhotoReviews } from './Photos.js';
import User from './User.js';

const Review = sequelize.define('Review', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    photoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Add associations
Review.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Review.belongsTo(Photos, {
    foreignKey: 'photoId',
    as: 'photo'
});

// Setup the reverse association
setupPhotoReviews(Review);

export default Review;