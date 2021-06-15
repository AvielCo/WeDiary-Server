const express = require("express");
const morgan = require("morgan");
require("./mongoose");
module.exports = () => {
  const server = express();

  // Middlewares
  server.use(morgan("dev"));
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  server.use(function (req, res, next) {
    //CORS support middleware
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  server.use("/api/auth", require("./api/auth"));
  server.use("/api/event", require("./api/event"));
  server.use("/api/guest", require("./api/guest"));

  server.use((req, res, next) => {
    const error = new Error("not found");
    error.status = 404;
    next(error);
  });

  server.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  });

  return server;
};
