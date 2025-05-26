import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Service from './Service.js';
import User from './User.js';

const Booking = sequelize.define('Booking', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  additionalDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  clientId: {  // Changed from client to clientId
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photographerId: {  // Changed from assignedPhotographer to photographerId
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Define associations directly in the model file
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Booking.belongsTo(User, { foreignKey: 'photographerId', as: 'photographer' });

export default Booking;