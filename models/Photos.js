import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Photo = sequelize.define('Photo', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
    },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photographerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'portrait',
      'wedding',
      'event',
      'commercial',
      'landscape',
      'family',
      'other'
    ),
    defaultValue: 'other',
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default Photo;