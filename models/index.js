import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import config from '../config/config.js';

const env = process.env.NODE_ENV || 'development';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = _basename(__filename);
const db = {};

let sequelize = new Sequelize(
  config[env].database,
  config[env].username, 
  config[env].password, 
  config[env]
);

const files = readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

for (const file of files) {
  const model = await import(join(__dirname, file));
  db[model.default.name] = model.default;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
