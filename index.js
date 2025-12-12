require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3001;
const routes = require("./routes");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const User = require("./user");
const bcrypt = require("bcryptjs");
const authRoutes = require("./authRoutes");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express();

app.use(express.json()); // allows us to read the JSON body of requests

// sessions (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// passport setup
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user)
        return done(null, false, { message: "Incorrect username or password" });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok)
        return done(null, false, { message: "Incorrect username or password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await User.findById(id).select("username");
    done(null, u);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Serve frontend static files at /app
app.use("/app", express.static("public"));

// auth routes (register/login/logout/me)
app.use("/auth", authRoutes);

// API routes (existing)
app.use("/", routes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// http://localhost:3001/
