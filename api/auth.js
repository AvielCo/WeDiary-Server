require("dotenv").config();

const express = require("express");
const User = require("../models/user.model");
const userValidation = require("../validation/user.validation");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const { createNewTokens } = require("../core/helpers");
const { verifyTokens } = require("../core/middlewares");
const redis = require("../core/redis");
const { week } = require("../core/consts");
const app = express();

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
    let tokens;
    try {
      tokens = await createNewTokens(user._id, res, req, next);
    } catch (err) {
      return next(createError.InternalServerError());
    }

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: week, // 7 days
    });

    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.post("/validate-tokens", verifyTokens, async (req, res, next) => {
  try {
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

app.get("/", verifyTokens, async (req, res, next) => {
  try {
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

app.delete("/logout", verifyTokens, async (req, res, next) => {
  try {
    const userId = req.user.id;
    res.clearCookie("refreshToken");

    redis.DEL(userId, (error) => {
      if (error) {
        console.error(`[REDIS] user logout error: ${error}`);
        return next(error);
      }
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
