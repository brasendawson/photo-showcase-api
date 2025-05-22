import User from './User.js';
import Photo from './Photos.js';
import Review from './Review.js';
import Category from './Category.js';
import Booking from './Booking.js';

// Define all associations
User.hasMany(Photo, { foreignKey: 'photographerId', as: 'photos' });
Photo.belongsTo(User, { foreignKey: 'photographerId', as: 'photographer' });

Photo.hasMany(Review, { foreignKey: 'photoId', as: 'reviews' });
Review.belongsTo(Photo, { foreignKey: 'photoId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

export {
    User,
    Photo,
    Review,
    Category,
    Booking
};