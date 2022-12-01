const Joi = require("joi");

const id = Joi.number().integer();
const name = Joi.string();
const lastName = Joi.string();
const cuit = Joi.string().length(13);
const state = Joi.boolean();
const registration = Joi.number().integer();
const email = Joi.string();
const city = Joi.string();
const party = Joi.string();
const address = Joi.string();
const phone = Joi.string();

const createPersonSchema = Joi.object({
  name: name.required(),
  lastName: lastName.required(),
  cuit: cuit.required(),
  state: state.required(),
  registration: registration.required(),
  city: city.required(),
  party: party.required(),
  address: address.required(),
  phone: phone.required(),
  email: email,
});

const updatePersonSchema = Joi.object({
  name: name,
  lastName: lastName,
  cuit: cuit,
  registration: registration,
  email: email,
  city: city,
  party: party,
  address: address,
  phone: phone,
});

const getPersonSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createPersonSchema,
  updatePersonSchema,
  getPersonSchema,
};
