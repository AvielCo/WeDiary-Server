const express = require("express");
const createError = require("http-errors");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const Guest = require("../models/guest.model");
const app = express();

const { authenticateAccessToken, authenticateRefreshToken } = require("../core/middlewares");

// Use auth access token middleware in every route in this file.
app.use(authenticateAccessToken);
app.use(authenticateRefreshToken);

//** POST */

app.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, location, firstPerson, secondPerson } = req.body;
    console.log(req.body);
    const event = new Event({ date, location, firstPerson, secondPerson });
    await event.save();

    await User.findByIdAndUpdate(userId, { $push: { events: event } });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

//** GET */

app.get("/all", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const eventsIds = user.events;
    const events = [];
    const promises = []; // an array that holds all promises
    eventsIds.forEach(async (eventId) => {
      promises.push(
        // push a promise
        Event.findById(eventId).then((event) => events.push(event))
      );
    });
    await Promise.all(promises); // wait for promises to finish
    res.status(200).send(events);
  } catch (err) {
    next(err);
  }
});

app.get("/:eventId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId } = req.params;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }
    const event = await Event.findById(eventId);

    res.status(200).send(event);
  } catch (err) {
    next(err);
  }
});

//** PUT (UPDATE) */

app.put("/", (req, res, next) => {
  try {
    const userId = req.user.id;
  } catch (err) {
    next(err);
  }
});

//** DELETE */

app.delete("/:eventId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId } = req.params;
    if (!user.events.includes(eventId)) {
      return res.sendStatus(200);
    }
    user.events.pull(eventId);
    await user.save();
    const event = await Event.findByIdAndDelete(eventId);

    const guestsIds = event.guests;

    if (guestsIds) {
      guestsIds.forEach(async (guestId) => await Guest.findByIdAndDelete(guestId));
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
