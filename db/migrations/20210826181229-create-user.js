'use strict';

const { PersonSchema, PERSON_TABLE } = require('./../models/person.model');
const { BillSchema, BILL_TABLE } = require('./../models/bill.model');
const { LiquidationSchema, LIQUIDATION_TABLE } = require('./../models/liquidation.model');
const { RetentionSchema, RETENTION_TABLE } = require('./../models/retention.model');
const { CreditNoteSchema, CREDIT_NOTE_TABLE } = require('./../models/credit.note.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(PERSON_TABLE, PersonSchema);
    await queryInterface.createTable(RETENTION_TABLE, RetentionSchema);
    await queryInterface.createTable(LIQUIDATION_TABLE, LiquidationSchema);
    await queryInterface.createTable(BILL_TABLE, BillSchema);
    await queryInterface.createTable(CREDIT_NOTE_TABLE, CreditNoteSchema);
  },
};
