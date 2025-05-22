import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Photos = sequelize.define('Photos', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photographerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    isModerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    needsReview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Only define the User association here
Photos.belongsTo(User, {
    foreignKey: 'photographerId',
    as: 'photographer'
});

export default Photos;

// Add this after export to avoid circular dependency
export const setupPhotoReviews = (Review) => {
    Photos.hasMany(Review, {
        foreignKey: 'photoId',
        as: 'reviews'
    });
};