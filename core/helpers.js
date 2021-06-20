require("dotenv").config();
const crypto = require("crypto");
const { week, five_minutes } = require("./consts");
const algorithm = "aes-256-ctr";
const secretKey = process.env.CRYPTO_SECRET;
const iv = crypto.randomBytes(16);

const redis = require("./redis");
const jwt = require("jsonwebtoken");

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (hash) => {
  const [iv, encrypted] = hash.split(":");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, "hex"));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
  return decrpyted.toString();
};

const createNewTokens = (userId, res, req, next) => {
  const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  const encryptedAccessToken = encrypt(accessToken);
  const encryptedRefreshToken = encrypt(refreshToken);

  redis.SET(userId.toString(), encryptedRefreshToken, "PX", week, (err) => {
    if (err) {
      return next(err);
    }
  });

  res.cookie("refreshToken", encryptedRefreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: week, // 7 days
  });

  res.cookie("accessToken", encryptedAccessToken, {
    httpOnly: true,
    secure: true,
    maxAge: five_minutes, // 5 minutes
  });
};

module.exports = { encrypt, decrypt, createNewTokens };
