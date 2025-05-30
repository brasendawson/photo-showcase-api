import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const AboutContent = sequelize.define('AboutContent', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

export default AboutContent;