import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Photo = sequelize.define('Photo', {
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
        allowNull: false
    }
});

export default Photo;