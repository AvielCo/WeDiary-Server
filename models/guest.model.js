const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GuestSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  howMany: {
    type: Number,
    require: true,
  },
  howMuch: Number,
});

module.exports = mongoose.model("guest", GuestSchema);