const Joi = require("joi");

const id = Joi.number().integer();
const personId = Joi.number().integer();
const state = Joi.boolean();
const maxAllowed = Joi.number();

const createLiquidationSchema = Joi.object({
  personId: personId.required(),
  state: state.required(),
  maxAllowed: maxAllowed.required(),
});

const updateLiquidationSchema = Joi.object({});

const getLiquidationSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createLiquidationSchema,
  updateLiquidationSchema,
  getLiquidationSchema,
};
