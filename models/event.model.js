const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  date: {
    type: Date,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  firstPerson: {
    type: {
      name: String,
      gender: String,
    },
    require: true,
  },
  secondPerson: {
    type: {
      name: String,
      gender: String,
    },
    require: true,
  },
  guests: [{ type: Schema.Types.ObjectId, ref: "guest" }],
});

module.exports = mongoose.model("event", EventSchema);
