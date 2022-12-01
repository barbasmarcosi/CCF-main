const { Sequelize } = require("sequelize");

const { config } = require("./../config/config");
const setupModels = require("./../db/models");

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
const sequelize = new Sequelize(URI, {
  dialect: 'postgres',
  logging: true,
  pool: {
    max: 100,
    min: 0,
    idle: 200000,
    // @note https://github.com/sequelize/sequelize/issues/8133#issuecomment-359993057
    acquire: 2147483647,//2147483648
  }
});

setupModels(sequelize);

module.exports = sequelize;
