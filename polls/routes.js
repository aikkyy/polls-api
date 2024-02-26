const express = require("express");
const router = express.Router();
const services = require("./services");
const schemas = require("./schemas");

router.get("/", async (req, res) => {
  const polls = await services.getAllPolls();
  res.status(200).json(polls);
});

router.delete("/:id", async (req, res) => {
  const pollId = req.params.id;

  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }

  const deleted = await services.deletePollById(pollId);
  if (!deleted) {
    return res.status(500).json({ error: "failed to delete poll" });
  }

  res.status(200).json({ message: "poll deleted successfully" });
});

// GET - endpoint to get poll details by poll id
router.get("/:id", async (req, res) => {
  const pollId = req.params.id; //extract poll id from the url parameter

  try {
    const poll = await services.getPollById(pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" }); //if poll not found, return error
    }

    res.status(200).json(poll); //if poll found, return it as a json response
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching poll details" });
  }
});

// POST - endpoint to create a poll
router.post("/", async (req, res) => {
  const pollData = req.body;

  // validate request body against schema
  const { error, value } = schemas.createPollSchema.validate(pollData);
  if (error) return res.status(400).json(error.details);
  const { question, options } = value;

  try {
    const newPoll = await services.createPoll(value);

    res.status(201).json(newPoll);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the poll" });
  }
});

module.exports = router;
