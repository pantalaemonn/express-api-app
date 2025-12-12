const Game = require("./game");

// Return all games wrapped in { Games: [...] } to match games.json
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.send({ Games: games });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error retrieving games", error });
  }
};

// Return only games authored by the logged-in user
exports.getMyGames = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Not authenticated" });
    }
    const games = await Game.find({ author: req.user.username });
    res.send({ Games: games });
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user games", error });
  }
};

// Create a game document. Accepts `characters` as array or comma-separated string.
exports.createGame = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Not authenticated" });
    }

    const {
      franchise,
      title,
      console: consoleName,
      release_date,
      description,
      characters,
      publisher,
      developer,
      genre,
      image,
      author,
    } = req.body;

    let chars = [];
    if (Array.isArray(characters)) {
      chars = characters;
    } else if (typeof characters === "string") {
      chars = characters
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const newGame = await Game.create({
      franchise,
      title,
      console: consoleName,
      release_date,
      description,
      characters: chars,
      publisher,
      developer,
      genre,
      image,
      author: req.user.username, // automatically set from logged-in user
    });

    res
      .status(201)
      .send({ message: "Game created successfully", game: newGame });
  } catch (error) {
    res.status(500).send({ message: "Error creating game", error });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).send({ message: "Game not found" });
    }

    res.send(game);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving game", error });
  }
};

// update game
exports.updateGameById = async (req, res) => {
  try {
    Object.assign(req.game, req.body);

    if (typeof req.game.characters === "string") {
      req.game.characters = req.game.characters
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    await req.game.save();
    res.json({ message: "Game updated successfully", game: req.game });
  } catch (error) {
    res.status(500).json({ message: "Error updating game", error });
  }
};

// delete game
exports.deleteGameById = async (req, res) => {
  try {
    await req.game.deleteOne();
    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting game", error });
  }
};
