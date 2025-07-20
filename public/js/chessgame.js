const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        
        // Only allow dragging if it's the player's piece
        if (playerRole === square.color) {
          pieceElement.draggable = true;
          pieceElement.classList.add("draggable");
          
          pieceElement.addEventListener("dragstart", (e) => {
            draggedPiece = pieceElement;
            sourceSquare = {row: rowIndex, col: squareIndex};
            // This is essential for Firefox
            e.dataTransfer.setData("text/plain", "");
            // Add visual feedback
            setTimeout(() => pieceElement.classList.add("dragging"), 0);
          });

          pieceElement.addEventListener("dragend", (e) => {
            if (draggedPiece) {
              draggedPiece.classList.remove("dragging");
            }
            draggedPiece = null;
            sourceSquare = null;
          });
        }

        squareElement.appendChild(pieceElement);
      }

      // Add drop zone functionality to all squares
      squareElement.addEventListener("dragenter", (e) => {
        e.preventDefault();
        squareElement.classList.add("drop-target");
      });

      squareElement.addEventListener("dragleave", (e) => {
        squareElement.classList.remove("drop-target");
      });

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault(); // This is essential to allow dropping
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        squareElement.classList.remove("drop-target");
        
        if (draggedPiece && sourceSquare) {
          const targetRow = parseInt(squareElement.dataset.row);
          const targetCol = parseInt(squareElement.dataset.col);
          handleMove(sourceSquare, {row: targetRow, col: targetCol});
        }
      });

      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === 'b') {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q"
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        K: "♔",  // King
        Q: "♕",  // Queen
        R: "♖",  // Rook
        B: "♗",  // Bishop
        N: "♘",  // Knight
        P: "♙",  // Pawn
        k: "♚",  // King
        q: "♛",  // Queen
        r: "♜",  // Rook
        b: "♝",  // Bishop
        n: "♞",  // Knight
        p: "♙"   // Pawn - Fixed black pawn unicode
    };
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role) {
    playerRole = role;
    renderBoard();
});

socket.on('spectatorRole', function() {
    playerRole = null;
    renderBoard();
});

socket.on('boardState', function(fen) {
    chess.load(fen);
    renderBoard();
});

socket.on('move', function(move) {
    chess.move(move);
    renderBoard();
});

renderBoard();
