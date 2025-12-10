const mongoose = require("mongoose");

// Game schema matching games.json structure
const gameSchema = new mongoose.Schema({
  franchise: { type: String },
  title: { type: String, required: true },
  console: { type: String },
  release_date: { type: String },
  description: { type: String },
  characters: [{ type: String }],
  publisher: { type: String },
  developer: { type: String },
  genre: { type: String },
});

module.exports = mongoose.model("Game", gameSchema);
