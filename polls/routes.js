const express = require("express");
const router = express.Router();
const services = require("./services");

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

module.exports = router;
