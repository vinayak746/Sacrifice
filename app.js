const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let spectators = [];
let currentPlayer = "w";
let gameInProgress = false;
let connectionCount = 0;
let lastActivityTime = Date.now();

// Session timeout (10 minutes of inactivity)
const SESSION_TIMEOUT = 10 * 60 * 1000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Sacrifice" });
});

// Check for inactive sessions every minute
setInterval(() => {
  const now = Date.now();
  if (now - lastActivityTime > SESSION_TIMEOUT) {
    // Reset the game if inactive
    if (gameInProgress) {
      chess.reset();
      gameInProgress = false;
      players = {};
      spectators = [];
      currentPlayer = "w";
      io.emit("gameReset");
      io.emit("boardState", chess.fen());
      console.log("Game reset due to inactivity");
    }
  }
}, 60000);

io.on("connection", function (uniquesocket) {
  connectionCount++;
  console.log("Connected. Total connections: " + connectionCount);
  lastActivityTime = Date.now();

  // Send current game state to new connection
  uniquesocket.emit("boardState", chess.fen());
  uniquesocket.emit("connectionCount", connectionCount);
  io.emit("connectionCount", connectionCount);

  // Assign roles
  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
    gameInProgress = true;
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
    gameInProgress = true;
  } else {
    spectators.push(uniquesocket.id);
    uniquesocket.emit("spectatorRole");
  }

  // Handle disconnection
  uniquesocket.on("disconnect", function () {
    connectionCount--;
    console.log("Disconnected. Remaining connections: " + connectionCount);
    io.emit("connectionCount", connectionCount);

    if (uniquesocket.id === players.white) {
      delete players.white;
      // Promote a spectator to player if available
      if (spectators.length > 0) {
        const newPlayer = spectators.shift();
        players.white = newPlayer;
        io.to(newPlayer).emit("playerRole", "w");
      }
    } else if (uniquesocket.id === players.black) {
      delete players.black;
      // Promote a spectator to player if available
      if (spectators.length > 0) {
        const newPlayer = spectators.shift();
        players.black = newPlayer;
        io.to(newPlayer).emit("playerRole", "b");
      }
    } else {
      // Remove from spectators if present
      const spectatorIndex = spectators.indexOf(uniquesocket.id);
      if (spectatorIndex !== -1) {
        spectators.splice(spectatorIndex, 1);
      }
    }

    // If no players left, reset the game
    if (!players.white && !players.black && connectionCount === 0) {
      chess.reset();
      gameInProgress = false;
      currentPlayer = "w";
    }
  });

  // Handle move requests
  uniquesocket.on("move", (move) => {
    try {
      lastActivityTime = Date.now();
      
      // Verify it's the player's turn
      if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
      if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        uniquesocket.emit("invalidMove", move);
      }
    } catch (e) {
      console.error("Error processing move:", e);
      uniquesocket.emit("invalidMove", move);
    }
  });

  // Handle legal moves request
  uniquesocket.on("getLegalMoves", (square) => {
    try {
      const legalMoves = [];
      const moves = chess.moves({ square: square, verbose: true });
      moves.forEach(move => {
        legalMoves.push(move.to);
      });
      uniquesocket.emit("legalMoves", { square, moves: legalMoves });
    } catch (e) {
      console.error("Error getting legal moves:", e);
    }
  });

  // Handle reset game request
  uniquesocket.on("resetGame", () => {
    // Only allow players to reset
    if (uniquesocket.id === players.white || uniquesocket.id === players.black) {
      chess.reset();
      currentPlayer = "w";
      io.emit("gameReset");
      io.emit("boardState", chess.fen());
    }
  });
});

server.listen(process.env.PORT || 3000, function () {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});