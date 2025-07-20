const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const statusElement = document.getElementById("status");
const connectionCountElement = document.getElementById("connection-count");

let draggedPiece = null;
let selectedPiece = null;
let sourceSquare = null;
let playerRole = null;
let legalMoves = [];
let isMobile = window.matchMedia("(max-width: 768px)").matches;

// Handle mobile detection
window.addEventListener("resize", () => {
  isMobile = window.matchMedia("(max-width: 768px)").matches;
});

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  
  // Clear any previous highlights
  legalMoves = [];
  
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;
      squareElement.dataset.square = `${String.fromCharCode(97 + squareIndex)}${8 - rowIndex}`;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.dataset.square = `${String.fromCharCode(97 + squareIndex)}${8 - rowIndex}`;
        
        // Only allow interaction if it's the player's piece and their turn
        const isPlayerPiece = playerRole === square.color;
        const isPlayerTurn = chess.turn() === playerRole;
        
        if (isPlayerPiece && isPlayerTurn) {
          pieceElement.classList.add("draggable");
          
          if (!isMobile) {
            // Desktop: Use drag and drop
            pieceElement.draggable = true;
            
            pieceElement.addEventListener("dragstart", (e) => {
              draggedPiece = pieceElement;
              sourceSquare = {row: rowIndex, col: squareIndex};
              // This is essential for Firefox
              e.dataTransfer.setData("text/plain", "");
              // Add visual feedback
              setTimeout(() => pieceElement.classList.add("dragging"), 0);
              
              // Request legal moves from server
              socket.emit("getLegalMoves", pieceElement.dataset.square);
            });

            pieceElement.addEventListener("dragend", (e) => {
              if (draggedPiece) {
                draggedPiece.classList.remove("dragging");
              }
              draggedPiece = null;
              sourceSquare = null;
              clearHighlights();
            });
          }
          
          // For both mobile and desktop: handle click selection
          pieceElement.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // If already selected, deselect
            if (selectedPiece === pieceElement) {
              deselectPiece();
              return;
            }
            
            // Deselect previous piece if any
            deselectPiece();
            
            // Select this piece
            selectedPiece = pieceElement;
            sourceSquare = {row: rowIndex, col: squareIndex};
            pieceElement.classList.add("selected");
            
            // Request legal moves from server
            socket.emit("getLegalMoves", pieceElement.dataset.square);
          });
        }

        squareElement.appendChild(pieceElement);
      }

      // For desktop: Add drop zone functionality to all squares
      if (!isMobile) {
        squareElement.addEventListener("dragenter", (e) => {
          e.preventDefault();
          if (draggedPiece) {
            squareElement.classList.add("drop-target");
          }
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
      }
      
      // For both: Handle click on square (for move completion on mobile)
      squareElement.addEventListener("click", () => {
        if (selectedPiece && sourceSquare) {
          const targetRow = parseInt(squareElement.dataset.row);
          const targetCol = parseInt(squareElement.dataset.col);
          handleMove(sourceSquare, {row: targetRow, col: targetCol});
          deselectPiece();
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
  
  updateStatus();
};

const deselectPiece = () => {
  if (selectedPiece) {
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
    sourceSquare = null;
    clearHighlights();
  }
};

const clearHighlights = () => {
  document.querySelectorAll(".legal-move").forEach(square => {
    square.classList.remove("legal-move");
  });
  legalMoves = [];
};

const highlightLegalMoves = (moves) => {
  clearHighlights();
  legalMoves = moves;
  
  moves.forEach(squareName => {
    const squareElement = document.querySelector(`.square[data-square="${squareName}"]`);
    if (squareElement) {
      squareElement.classList.add("legal-move");
    }
  });
};

const handleMove = (source, target) => {
    const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
    const to = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;
    
    // Check if this is a legal move
    const targetSquareName = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;
    if (legalMoves.includes(targetSquareName)) {
        const move = {
            from: from,
            to: to,
            promotion: "q" // Always promote to queen for simplicity
        };
        socket.emit("move", move);
    }
};

const updateStatus = () => {
    if (!statusElement) return;
    
    let status = "";
    
    // Check for checkmate
    if (chess.in_checkmate()) {
        status = chess.turn() === 'w' ? "Black wins by checkmate!" : "White wins by checkmate!";
    }
    // Check for draw
    else if (chess.in_draw()) {
        status = "Game ended in draw";
    }
    // Check for check
    else if (chess.in_check()) {
        status = chess.turn() === 'w' ? "White is in check" : "Black is in check";
    }
    // Regular status
    else {
        const currentTurn = chess.turn();
        const isPlayerTurn = currentTurn === playerRole;
        status = currentTurn === 'w' ? "White to move" : "Black to move";
        if (isPlayerTurn) {
            status += " - It's your turn!";
        }
    }
    
    // Add player role info
    if (playerRole === 'w') {
        status += " (You are White)";
    } else if (playerRole === 'b') {
        status += " (You are Black)";
    } else {
        status += " (You are a Spectator)";
    }
    
    statusElement.textContent = status;
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

// Socket event handlers
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

socket.on('legalMoves', function(data) {
    highlightLegalMoves(data.moves);
});

socket.on('invalidMove', function(move) {
    if (statusElement) {
        const prevStatus = statusElement.textContent;
        statusElement.textContent = "Invalid move!";
        setTimeout(() => {
            statusElement.textContent = prevStatus;
        }, 2000);
    }
});

socket.on('connectionCount', function(count) {
    if (connectionCountElement) {
        connectionCountElement.textContent = `Players online: ${count}`;
    }
});

socket.on('gameReset', function() {
    if (statusElement) {
        statusElement.textContent = "Game has been reset";
    }
});

// Handle document clicks to deselect pieces when clicking outside
document.addEventListener("click", (e) => {
    if (e.target.closest(".square")) return;
    deselectPiece();
});

// Initialize the board
renderBoard();

// Add reset button functionality if it exists
const resetButton = document.getElementById("reset-button");
if (resetButton) {
    resetButton.addEventListener("click", () => {
        socket.emit("resetGame");
    });
}
