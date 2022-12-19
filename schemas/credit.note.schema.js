const Joi = require("joi");

const id = Joi.number().integer();
const description = Joi.string();
const amount = Joi.number();
const state = Joi.boolean();
const personId = Joi.number().integer();
const liquidationId = Joi.number().integer();

const createCreditNoteSchema = Joi.object({
  description: description.required(),
  amount: amount.required(),
  state: state.required(),
  personId: personId.required(),
});

const updateCreditNoteSchema = Joi.object({
  description: description,
  amount: amount,
  state: state,
  liquidationId: liquidationId,
  personId: personId,
});

const getCreditNoteSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createCreditNoteSchema,
  updateCreditNoteSchema,
  getCreditNoteSchema,
};
