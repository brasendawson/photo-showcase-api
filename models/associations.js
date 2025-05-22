import User from './User.js';
import Photo from './Photos.js';
import Review from './Review.js';
import Category from './Category.js';
import Booking from './Booking.js';

const setupAssociations = () => {
    // User-Photo associations
    User.hasMany(Photo, { 
        foreignKey: 'photographerId', 
        as: 'uploadedPhotos'
    });
    Photo.belongsTo(User, { 
        foreignKey: 'photographerId', 
        as: 'photoOwner'
    });

    // Photo-Review associations
    Photo.hasMany(Review, { 
        foreignKey: 'photoId', 
        as: 'photoReviews'  // Changed from 'reviews' to 'photoReviews'
    });
    Review.belongsTo(Photo, { 
        foreignKey: 'photoId', 
        as: 'photo'
    });

    // User-Review associations
    User.hasMany(Review, { 
        foreignKey: 'userId', 
        as: 'userReviews'
    });
    Review.belongsTo(User, { 
        foreignKey: 'userId', 
        as: 'reviewer'
    });

    // Booking associations
    Booking.belongsTo(User, {
        as: 'bookingClient',
        foreignKey: 'userId'
    });

    Booking.belongsTo(User, {
        as: 'bookingPhotographer',
        foreignKey: 'photographerId'
    });

    User.hasMany(Booking, {
        as: 'clientBookings',
        foreignKey: 'userId'
    });

    User.hasMany(Booking, {
        as: 'photographerBookings',
        foreignKey: 'photographerId'
    });
};

export default setupAssociations;