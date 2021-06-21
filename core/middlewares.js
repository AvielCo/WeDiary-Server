require("dotenv").config();

const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const redis = require("./redis");
const { decrypt, createNewTokens } = require("./helpers");
const { week } = require("./consts");

function authenticateAccessToken(req, accessToken) {
  const decryptedAccessToken = decrypt(accessToken);
  try {
    const user = jwt.verify(decryptedAccessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
  } catch (err) {
    return false;
  }
  return true;
}

async function authenticateRefreshToken(req, res, next) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return false;
  }

  let user;
  try {
    user = jwt.verify(decrypt(refreshToken), process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return false;
  }

  return new Promise((resolve, reject) =>
    redis.GET(user.id, async (err, reply) => {
      if (err || !reply) {
        reject(createError.InternalServerError());
      }

      if (refreshToken != reply) {
        reject(createError.Unauthorized());
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await createNewTokens(user.id, res);
      if (!newAccessToken || !newRefreshToken) {
        reject(createError.InternalServerError());
      }

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: week,
      });

      req.user = user;
      req.newAccessToken = newAccessToken;
      resolve(true);
    })
  );
}

async function verifyTokens(req, res, next) {
  const accessToken = req.headers["authorization"].split(" ")[1];
  let isAccessTokenValid = false;
  let isRefreshTokenValid = false;
  if (accessToken) {
    isAccessTokenValid = authenticateAccessToken(req, accessToken);
  }
  if (!isAccessTokenValid || !accessToken) {
    try {
      isRefreshTokenValid = await authenticateRefreshToken(req, res, next);
    } catch (err) {
      return next(err);
    }
  }
  if (isRefreshTokenValid || isAccessTokenValid) {
    next();
  }
}

module.exports = { verifyTokens };
