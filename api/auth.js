const express = require("express");
const User = require("../models/user.model");
const userValidation = require("../validation/user.validation");
const createError = require("http-errors");
const app = express();

app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError.BadRequest();
    }

    await userValidation.validateAsync({ email, password });

    const user = new User({ email, password });
    const savedUser = await user.save();

    res.status(200).send(savedUser);
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
    }
    next(error);
  }
});

app.post("/login", (req, res, next) => {
  try {
    res.send(req.body);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
