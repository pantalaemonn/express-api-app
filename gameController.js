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

// Create a game document. Accepts `characters` as array or comma-separated string.
exports.createGame = async (req, res) => {
  try {
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
    });

    await newGame.save();

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

exports.updateGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    if (typeof updateFields.characters === "string") {
      updateFields.characters = updateFields.characters
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const updatedGame = await Game.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedGame) {
      return res.status(404).send({ message: "Game not found" });
    }

    res.send({ message: "Game updated successfully", game: updatedGame });
  } catch (error) {
    res.status(500).send({ message: "Error updating game", error });
  }
};

// Delete a game by id
exports.deleteGameById = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Game.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).send({ message: "Game not found" });
    }

    res.send({ message: "Game deleted successfully", game: deleted });
  } catch (error) {
    res.status(500).send({ message: "Error deleting game", error });
  }
};
