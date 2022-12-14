const { Person, PersonSchema } = require("./person.model");
const { Liquidation, LiquidationSchema } = require("./liquidation.model");
const { Bill, BillSchema } = require("./bill.model");
const { Retention, RetentionSchema } = require("./retention.model");
const { CreditNote, CreditNoteSchema } = require("./credit.note.model");

function setupModels(sequelize) {
  Person.init(PersonSchema, Person.config(sequelize));
  Liquidation.init(LiquidationSchema, Liquidation.config(sequelize));
  Bill.init(BillSchema, Bill.config(sequelize));
  Retention.init(RetentionSchema, Retention.config(sequelize));
  CreditNote.init(CreditNoteSchema, CreditNote.config(sequelize));

  Person.associate(sequelize.models);
  Liquidation.associate(sequelize.models);
  Bill.associate(sequelize.models);
  Retention.associate(sequelize.models);
  CreditNote.associate(sequelize.models);
}

module.exports = setupModels;
