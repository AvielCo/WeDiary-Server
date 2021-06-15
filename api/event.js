const express = require("express");
const createError = require("http-errors");
const User = require("../models/user.model");
const Event = require("../models/event.model");
const Person = require("../models/person.model");
const Guest = require("../models/guest.model");
const app = express();

//** POST */

app.post("/", async (req, res, next) => {
  try {
    const userId = "60c73a81b70d263164ffdec9";
    const { date, location, firstPersonDetails, secondPersonDetails } = req.body;

    const firstPerson = new Person(firstPersonDetails);
    const secondPerson = new Person(secondPersonDetails);
    await firstPerson.save();
    await secondPerson.save();

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
    const userId = "60c73a81b70d263164ffdec9";
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
    const userId = "60c73a81b70d263164ffdec9";
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
  } catch (err) {
    next(err);
  }
});

//** DELETE */

app.delete("/:eventId", async (req, res, next) => {
  try {
    const userId = "60c73a81b70d263164ffdec9";
    const user = await User.findById(userId);
    const { eventId } = req.params;
    if (!user.events.includes(eventId)) {
      return res.sendStatus(200);
    }
    user.events.pull(eventId);
    await user.save();
    const event = await Event.findByIdAndDelete(eventId);

    const guestsIds = event.guests;

    // remove both people but dont wait for the operation to finish
    await Person.findByIdAndDelete(event.firstPerson);
    await Person.findByIdAndDelete(event.secondPerson);

    if (guestsIds) {
      guestsIds.forEach(async (guestId) => await Guest.findByIdAndDelete(guestId));
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
