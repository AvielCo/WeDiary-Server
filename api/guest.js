const express = require("express");
const createError = require("http-errors");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const Guest = require("../models/guest.model");
const app = express();

const { verifyTokens } = require("../core/middlewares");

// Use auth access token middleware in every route in this file.
app.use(verifyTokens);

//** POST */

app.post("/:eventId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId } = req.params;
    const { name, howMany, comment, howMuch } = req.body;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }

    const guest = new Guest({ name, howMany, comment, howMuch });
    await guest.save();

    await Event.findByIdAndUpdate(eventId, {
      $push: { guests: guest },
    });

    res.status(200).json({ accessToken: req.newAccessToken });
  } catch (err) {
    next(err);
  }
});

//** GET */

app.get("/all/:eventId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId } = req.params;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }

    const event = await Event.findById(eventId);

    const guestsIds = event.guests;
    const guests = [];
    const promises = []; // an array that holds all promises
    guestsIds.forEach(async (guestId) => {
      promises.push(
        // push a promise
        Guest.findById(guestId).then((guest) => guests.push(guest))
      );
    });
    await Promise.all(promises); // wait for promises to finish
    res.status(200).json({ accessToken: req.newAccessToken, guests });
  } catch (err) {
    next(err);
  }
});

app.get("/:eventId/:guestId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId, guestId } = req.params;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }

    const event = await Event.findById(eventId);

    if (!event.guests.includes(guestId)) {
      return next(createError.BadRequest());
    }

    const guest = await Guest.findById(guestId);

    res.status(200).json({ accessToken: req.newAccessToken, guest });
  } catch (err) {
    next(err);
  }
});

//** PUT (UPDATE) */

app.put("/:eventId/:guestId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId, guestId } = req.params;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }

    const event = await Event.findById(eventId);

    if (!event.guests.includes(guestId)) {
      return next(createError.BadRequest());
    }

    await Guest.findByIdAndUpdate(guestId, req.body, { omitUndefined: true });

    res.status(200).json({ accessToken: req.newAccessToken });
  } catch (err) {
    next(err);
  }
});

//** DELETE */

app.delete("/:eventId/:guestId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { eventId, guestId } = req.params;

    if (!user.events.includes(eventId)) {
      return next(createError.BadRequest());
    }

    const event = await Event.findById(eventId);

    if (!event.guests.includes(guestId)) {
      return next(createError.BadRequest());
    }

    event.guests.pull(guestId);
    await event.save();
    await Guest.findByIdAndDelete(guestId);

    res.status(200).json({ accessToken: req.newAccessToken });
  } catch (err) {
    next(err);
  }
});

module.exports = app;
