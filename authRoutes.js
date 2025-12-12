const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("./user");

// register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .send({ message: "username and password required" });

    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).send({ message: "username already exists" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, passwordHash: hash });
    await newUser.save();
    res.status(201).send({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error creating user" });
  }
});

// login using passport local
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).send({
        message: info && info.message ? info.message : "Invalid credentials",
      });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.send({
        message: "Logged in",
        user: { id: user._id, username: user.username },
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send({ message: "Logged out" });
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: { username: req.user.username, isAdmin: req.user.isAdmin },
    });
  } else {
    res.json({ user: null });
  }
});

module.exports = router;
