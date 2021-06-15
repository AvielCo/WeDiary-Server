const Joi = require("joi");

module.exports = Joi.object({
  date: Joi.date().greater("now"),
  location: Joi.string().alphanum(),
});
