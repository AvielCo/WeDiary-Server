const express = require("express");
const User = require("../models/user.model");
const userValidation = require("../validation/user.validation");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { encrypt } = require("../helpers");
const app = express();
require("dotenv").config();

app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createError.BadRequest();
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createError.Conflict("Email already exists."));
    }

    await userValidation.validateAsync({ email, password });

    const newUser = new User({ email, password });
    const savedUser = await newUser.save();

    res.status(200).send(savedUser);
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
    }
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(createError(401, "Incorrect email or password."));
    }

    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      return next(createError(401, "Incorrect email or password."));
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET);

    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);

    console.log(encryptedAccessToken);
    res.cookie("refreshToken", encryptedRefreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    res.cookie("accessToken", encryptedAccessToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
