const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/mongodb");

async function findUserByID(id) {
  try {
    return await db
      .getDB()
      .collection(db.usersCollection)
      .findOne({
        _id: db.toMongoID(id),
      });
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function findUserByEmail(email) {
  try {
    return await db.getDB().collection(db.usersCollection).findOne({
      email: email,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

// updated function to create user
async function createUser(newUserData) {
  try {
    // add loginAttempts and isLocked to the user in database
    newUserData.loginAttempts = 0;
    newUserData.isLocked = false;
    newUserData.password = await hashPassword(newUserData.password);

    const inserted = await db
      .getDB()
      .collection(db.usersCollection)
      .insertOne(newUserData);

    if (!inserted) {
      return null;
    }

    return await findUserByID(inserted.insertedId);
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function hashPassword(passwordText) {
  const salt = 10;
  return bcrypt.hash(passwordText, salt);
}

async function validatePassword(pwd, hash) {
  return bcrypt.compare(pwd, hash);
}

function generateAccessToken(userId) {
  const payload = { userId };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

function validateAccessToken(token) {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

async function updateUser(user) {
  try {
    const { _id, loginAttempts, isLocked } = user;
    const updateResult = await db
      .getDB()
      .collection(db.usersCollection)
      .updateOne(
        { _id: db.toMongoID(_id) },
        { $set: { loginAttempts, isLocked } }
      );
    return true;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

module.exports = {
  findUserByID,
  findUserByEmail,
  validatePassword,
  createUser,
  generateAccessToken,
  validateAccessToken,
  updateUser,
};
