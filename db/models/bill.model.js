const { Model, DataTypes, Sequelize } = require("sequelize");

const { LIQUIDATION_TABLE } = require("./liquidation.model");
const { PERSON_TABLE } = require("./person.model");

const BILL_TABLE = "bills";

const BillSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  billNumber: {
    allowNull: false,
    type: DataTypes.STRING(14),
  },
  billType: {
    allowNull: false,
    type: DataTypes.CHAR(1),
  },
  registerType: {
    allowNull: false,
    type: DataTypes.STRING(7),
  },
  description: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  initialAmount: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  adminExpenses: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  finalAmount: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  billDate: {
    allowNull: false,
    type: DataTypes.DATE,
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

class Bill extends Model {
  static associate(models) {
    this.belongsTo(models.Person, { as: "person" }),
      this.belongsTo(models.Liquidation, { as: "liquidation" });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: BILL_TABLE,
      modelName: "Bill",
      timestamps: false,
    };
  }
}

module.exports = { Bill, BillSchema, BILL_TABLE };
