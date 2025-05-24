import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  package: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Check that your status field definition exactly matches the database table
  status: {
    // Change this to match your actual database ENUM values
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'canceled'),
    defaultValue: 'pending',
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photographerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Define associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'clientBookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'client' });

User.hasMany(Booking, { foreignKey: 'photographerId', as: 'photographerBookings' });
Booking.belongsTo(User, { foreignKey: 'photographerId', as: 'photographer' });

export default Booking;