const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/WeDiary", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err));
