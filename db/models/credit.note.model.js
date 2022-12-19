const { Model, DataTypes, Sequelize } = require("sequelize");

const { LIQUIDATION_TABLE } = require("./liquidation.model");
const { PERSON_TABLE } = require("./person.model");

const CREDIT_NOTE_TABLE = "creditNote";

const CreditNoteSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  description: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  amount: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  state: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
  },
  personId: {
    //field: "person_id",
    allowNull: false,
    type: DataTypes.INTEGER,
    unique: false,
    references: {
      model: PERSON_TABLE,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  liquidationId: {
    //field: "liquidation_id",
    allowNull: true,
    type: DataTypes.INTEGER,
    unique: false,
    references: {
      model: LIQUIDATION_TABLE,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
};

class CreditNote extends Model {
  static associate(models) {
    this.belongsTo(models.Person, { as: "person" }),
      this.belongsTo(models.Liquidation, { as: "liquidation" });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CREDIT_NOTE_TABLE,
      modelName: "CreditNote",
      timestamps: false,
    };
  }
}

module.exports = { CreditNote, CreditNoteSchema, CREDIT_NOTE_TABLE };
