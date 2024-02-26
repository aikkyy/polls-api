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
    const result = await db
      .getDB()
      .collection(db.pollsCollection)
      .insertOne(pollData);

    // return new poll
    return { _id: result.insertedId, ...pollData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create poll");
  }
}

module.exports = {
  getPollById,
  getAllPolls,
  deletePollById,
  createPoll,
};
