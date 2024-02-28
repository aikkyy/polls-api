const db = require("../db/mongodb");

async function getPollById(pollId) {
  try {
    return await db
      .getDB()
      .collection(db.pollsCollection)
      .findOne({ _id: db.toMongoID(pollId) });
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getAllPolls() {
  try {
    return await db.getDB().collection(db.pollsCollection).find({}).toArray();
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function deletePollById(pollId) {
  try {
    const result = await db
      .getDB()
      .collection(db.pollsCollection)
      .deleteOne({ _id: db.toMongoID(pollId) });

    return result.deletedCount > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// function to create a poll
async function createPoll(pollData) {
  try {
    // transform each option string into an object with content and votes fields
    const optionsWithVotes = pollData.options.map((option) => ({
      content: option,
      votes: 0,
    }));

    // replace original options array with transformed one
    pollData.options = optionsWithVotes;

    const result = await db
      .getDB()
      .collection(db.pollsCollection)
      .insertOne(pollData);

    // return the new poll
    return { _id: result.insertedId, ...pollData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create poll");
  }
}

// function to vote in option
async function voteInOption(id, option) {
  try {
    const updateResult = await db
      .getDB()
      .collection(db.pollsCollection)
      .updateOne(
        { _id: db.toMongoID(id), "options.content": option },
        { $inc: { "options.$.votes": 1 } }
      );

    if (updateResult.matchedCount === 0) {
      throw new Error("Poll or option not found");
    }
    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to cast vote, option may not exist");
    }
    return { message: "Vote successfully cast" };
  } catch (error) {
    console.error("Failed to vote in option:", error);
    throw new Error("Failed to vote in option: " + error.message);
  }
}

module.exports = {
  getPollById,
  getAllPolls,
  deletePollById,
  createPoll,
  voteInOption,
};
