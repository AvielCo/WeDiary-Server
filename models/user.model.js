const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const schema = new Schema({
  email: {
    type: String,
    require: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    require: true,
    select: false,
  },
  events: [{ type: Schema.Types.ObjectId, ref: "event", require: false }],
});

schema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("user", schema);
