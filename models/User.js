import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'photographer', 'client'),
        allowNull: false,
        defaultValue: 'client'
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/profile-pictures/default-profile.jpg'
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    tableName: 'users'
});
    
export default User;