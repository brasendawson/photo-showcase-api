import { DataTypes } from 'sequelize';import { sequelize } from '../config/db.js';import bcrypt from 'bcrypt';const User = sequelize.define('User', {  id: {    type: DataTypes.INTEGER,    primaryKey: true,    autoIncrement: true  },  username: {    type: DataTypes.STRING,    allowNull: false,    unique: true  },  email: {    type: DataTypes.STRING,    allowNull: false,    unique: true,    validate: {      isEmail: true    }  },  password: {    type: DataTypes.STRING,    allowNull: false  },  role: {    type: DataTypes.ENUM('user', 'photographer', 'admin'),    defaultValue: 'user'  }}, {  timestamps: true,  createdAt: 'created_at',  updatedAt: false,  tableName: 'users',  hooks: {    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

export default User;