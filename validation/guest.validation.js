const Joi = require("joi");

module.exports = Joi.object({
  name: Joi.string().alphanum(),
  comment: Joi.string().alphanum(),
  howMany: Joi.number().integer().positive(),
  howMuch: Joi.number().integer().positive(),
});
