const mongoose = require("mongoose");

const PersonSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  name: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("person", PersonSchema);
