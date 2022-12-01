const Joi = require("joi");

const id = Joi.number().integer();
const billNumber = Joi.string().length(14)
const description = Joi.string();
const initialAmount = Joi.number();
const finalAmount = Joi.number();
const state = Joi.boolean();
const billDate = Joi.date();
const personId = Joi.number().integer();
const liquidationId = Joi.number().integer();
const billType = Joi.string().length(1)
const adminExpenses = Joi.number()
const registerType = Joi.string()

const createBillSchema = Joi.object({
  billNumber: billNumber.required(),
  description: description.required(),
  initialAmount: initialAmount.required(),
  finalAmount: finalAmount.required(),
  state: state.required(),
  billDate: billDate.required(),
  personId: personId.required(),
  billType: billType.required(),
  adminExpenses: adminExpenses.required(),
  registerType: registerType.required(),
});

const updateBillSchema = Joi.object({
  initialAmount: initialAmount,
  finalAmount: finalAmount,
  billDate: billDate,
  description: description,
  liquidationId: liquidationId,
  personId: personId,
  billType: billType,
  registerType: registerType,
  adminExpenses: adminExpenses,
});

const getBillSchema = Joi.object({
  id: id.required(),
});

module.exports = { createBillSchema, updateBillSchema, getBillSchema };
