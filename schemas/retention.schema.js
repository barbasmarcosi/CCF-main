const Joi = require("joi");

const id = Joi.number().integer();
const retention = Joi.number();
const state = Joi.boolean();
const personId = Joi.number().integer();
const retentionDate = Joi.date();

const createRetentionSchema = Joi.object({
  retention: retention.required(),
  state: state.required(),
  personId: personId.required(),
  retentionDate: retentionDate.required(),
});

const updateRetentionSchema = Joi.object({});

const getRetentionSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createRetentionSchema,
  updateRetentionSchema,
  getRetentionSchema,
};
