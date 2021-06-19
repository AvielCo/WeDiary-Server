require("dotenv").config();

const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { decrypt, encrypt } = require("./helpers");

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
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
    const encryptedAccessToken = encrypt(accessToken);

    res.cookie("accessToken", encryptedAccessToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    req.user = user;
    next();
  });
}

module.exports = { authenticateAccessToken, authenticateRefreshToken };
