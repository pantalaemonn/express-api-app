const express = require("express");
const router = express.Router();
const {
  getAllGames,
  createGame,
  getGameById,
  updateGameById,
} = require("./gameController");

// base url http://localhost:3001/
// get all games
router.get("/", getAllGames);

// get a specific game by id
router.get("/:id", getGameById);

// base url http://localhost:3001/
router.post("/", createGame);

// update a specific game by id
router.put("/:id", updateGameById);

module.exports = router;
