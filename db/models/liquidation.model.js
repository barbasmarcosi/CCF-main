const { Model, DataTypes, Sequelize } = require('sequelize');

const { PERSON_TABLE } = require('./person.model')

const LIQUIDATION_TABLE = 'liquidations';

const LiquidationSchema =  {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  monthAmount: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  retention: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  retainedAmount: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  state: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  detail: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  personId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: false,
    references: {
      model: PERSON_TABLE,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}

class Liquidation extends Model {

  static associate(models) {
    this.belongsTo(models.Person, {as: 'person'});
    this.hasMany(models.Bill, {
      as: 'bills',
      foreignKey: 'liquidationId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: LIQUIDATION_TABLE,
      modelName: 'Liquidation',
      timestamps: false
    }
  }
}

module.exports = { Liquidation, LiquidationSchema, LIQUIDATION_TABLE };
