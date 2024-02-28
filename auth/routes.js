const express = require("express");
const router = express.Router();
const schemas = require("./schemas");
const services = require("./services");

router.post("/signin", async (req, res) => {
  const { error, value } = schemas.signinSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: "invalid body", details: error.details });
  }

  const user = await services.findUserByEmail(value.email);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // check if user is blocked
  if (user.isLocked) {
    return res.status(403).json({ error: "account locked" });
  }

  const isValidPwd = await services.validatePassword(
    value.password,
    user.password
  );
  if (!isValidPwd) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts > 3) {
      user.isLocked = true; //block user
    }

    // update user data in database
    await services.updateUser({
      _id: user._id,
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked,
    });

    if (user.isLocked) {
      return res.status(403).json({ error: "account locked" });
    } else {
      return res.status(401).json({ error: "unauthorized" });
    }
  }

  const token = services.generateAccessToken(user._id);

  res.status(200).json({ result: "ok", token });
});

// updated endpoint
router.post("/signup", async (req, res) => {
  const newUserData = req.body;

  // validate request body against schema
  const { error, value } = schemas.signupSchema.validate(newUserData);
  if (error) {
    return res
      .status(400)
      .json({ error: "invalid body", details: error.details });
  }
  const { name, email, password } = value;

  const userEmail = await services.findUserByEmail(value.email);
  if (userEmail) {
    return res.status(400).json({ error: "email already in use" });
  }

  const newUser = await services.createUser(value);
  if (!newUser) {
    return res.status(500).json({ error: "unexpected server error" });
  }

  res.status(200).json({
    id: newUser._id,
    email: newUser.email,
    name: newUser.name,
  });
});

module.exports = router;
