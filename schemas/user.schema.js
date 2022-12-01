const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const password = Joi.string().min(8);

const createUserSchema = Joi.object({
  name: name.required(),
  password: password.required(),
});

const updateUserSchema = Joi.object({
  password: password,
});

const getUserSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUserSchema, updateUserSchema, getUserSchema }
