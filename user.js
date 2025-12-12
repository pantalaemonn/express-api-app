const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePic: {
    type: String,
    default: "https://via.placeholder.com/150x150?text=Profile",
  },
});

module.exports = mongoose.model("User", userSchema);
