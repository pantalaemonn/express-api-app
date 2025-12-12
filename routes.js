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
const Game = require("./game");

// Middleware: require login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Middleware: require ownership or admin
async function ensureOwnerOrAdmin(req, res, next) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.author === req.user.username || req.user.isAdmin) {
      req.game = game; // pass game along to controller
      return next();
    }

    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}

// Routes
// base url http://localhost:3001/
router.get("/", getAllGames);

// get only logged in user's games
router.get("/mine", ensureAuthenticated, getMyGames);

// get a specific game by id
router.get("/:id", getGameById);

// create a game (must be logged in)
router.post("/", ensureAuthenticated, createGame);

// update a specific game by id (must be owner or admin)
router.put("/:id", ensureOwnerOrAdmin, updateGameById);

// delete a specific game by id (must be owner or admin)
router.delete("/:id", ensureOwnerOrAdmin, deleteGameById);

module.exports = router;
