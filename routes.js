const express = require("express");
const router = express.Router();
const {
  getAllGames,
  getMyGames,
  createGame,
  getGameById,
  updateGameById,
  deleteGameById,
} = require("./gameController");

// base url http://localhost:3001/
// get all games
router.get("/", getAllGames);

//get only logged in user's games
router.get("/mine", getMyGames);

// get a specific game by id
router.get("/:id", getGameById);

// base url http://localhost:3001/
router.post("/", createGame);

// update a specific game by id
router.put("/:id", updateGameById);

// delete a specific game by id
router.delete("/:id", deleteGameById);

module.exports = router;
