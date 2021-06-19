const crypto = require("crypto");
require("dotenv").config();
const algorithm = "aes-256-ctr";
const secretKey = process.env.CRYPTO_SECRET;
const iv = crypto.randomBytes(16);

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

module.exports = { encrypt, decrypt };
