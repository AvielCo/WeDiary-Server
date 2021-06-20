require("dotenv").config();

const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const redis = require("./redis");
const { decrypt, createNewTokens } = require("./helpers");

function authenticateAccessToken(req, res, next) {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next();
  }

  const decryptedAccessToken = decrypt(accessToken);

  jwt.verify(decryptedAccessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(createError.Forbidden());
    }
    req.user = user;
    next();
  });
}

function authenticateRefreshToken(req, res, next) {
  const { refreshToken, accessToken } = req.cookies;

  if (accessToken) {
    return next();
  }

  if (!refreshToken) {
    return next(createError.Unauthorized());
  }

  const decryptedRefreshToken = decrypt(refreshToken);

  jwt.verify(decryptedRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(createError.Forbidden());
    }

    redis.GET(user.id, (err, reply) => {
      if (err) {
        return next(err);
      }

      if (refreshToken !== reply) {
        redis.DEL(user.id);
        return next(createError.Unauthorized());
      }

      createNewTokens(user.id, res);

      req.user = user;
      next();
    });
  });
}

module.exports = { authenticateAccessToken, authenticateRefreshToken };
