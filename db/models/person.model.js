const { Model, DataTypes, Sequelize } = require('sequelize');

const PERSON_TABLE = 'persons';

const PersonSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  registration: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  cuit: {
    allowNull: false,
    type: DataTypes.STRING
  },
  lastName: {
    allowNull: false,
    type: DataTypes.STRING
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  email: {
    allowNull: true,
    type: DataTypes.STRING
  },
  city: {
    allowNull: true,
    type: DataTypes.STRING
  },
  party: {
    allowNull: true,
    type: DataTypes.STRING
  },
  address: {
    allowNull: true,
    type: DataTypes.STRING
  },
  phone: {
    allowNull: true,
    type: DataTypes.STRING
  },
  state: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}

class Person extends Model {
  static associate(models) {
    this.hasMany(models.Bill, {
      as: 'bills',
      foreignKey: 'personId'
    });
    this.hasMany(models.Retention, {
      as: 'retentions',
      foreignKey: 'personId'
    });
    this.hasMany(models.Liquidation, {
      as: 'liquidations',
      foreignKey: 'personId'
    })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PERSON_TABLE,
      modelName: 'Person',
      timestamps: false
    }
  }
}


module.exports = { PERSON_TABLE, PersonSchema, Person }
