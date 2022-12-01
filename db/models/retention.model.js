const { Model, DataTypes, Sequelize } = require('sequelize');

const { PERSON_TABLE } = require('./person.model')

const RETENTION_TABLE = 'retentions';

const RetentionSchema =  {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  retention: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  state: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    field: 'annulled',
  },
  retentionDate: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  personId: {
    //field: "person_id",
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

class Retention extends Model {

  static associate(models) {
    this.belongsTo(models.Person, {as: 'person'});
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RETENTION_TABLE,
      modelName: 'Retention',
      timestamps: false
    }
  }
}

module.exports = { Retention, RetentionSchema, RETENTION_TABLE };
