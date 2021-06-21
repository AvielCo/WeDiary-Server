const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const redis = require("./core/redis");
require("./core/mongoose");
module.exports = () => {
  const server = express();

  // Middlewares
  server.use(morgan("dev"));
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  server.use(cookieParser());
  server.use(
    cors({
      credentials: true,
      origin: ["http://localhost:4200", "http://localhost:4000"],
    })
  );

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
    // if (res.statusCode === 401) {
    //   res.clearCookie("accessToken");
    //   res.clearCookie("refreshToken");
    // }
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  });

  return server;
};
