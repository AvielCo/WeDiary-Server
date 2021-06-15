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
  firstPerson: { type: Schema.Types.ObjectId, ref: "person", require: true },
  secondPerson: { type: Schema.Types.ObjectId, ref: "person", require: true },
  guests: [{ type: Schema.Types.ObjectId, ref: "guest" }],
});

module.exports = mongoose.model("event", EventSchema);
