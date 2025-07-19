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
       pieceElement.draggable = playerRole === square.color;

       pieceElement.addEventListener("dragstart",(e)=>{
        if (pieceElement.draggable){
            draggedPiece = pieceElement;
            sourceSquare = {row: rowIndex, col: squareIndex};
            e.dataTransfer.setData("text/plain", '');
        }
       })
       pieceElement.addEventListener("dragend",(e)=>{
        draggedPiece = null;
        sourceSquare = null;
       })

        squareElement.appendChild(pieceElement);
      }
       
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(e.target.dataset.row),
            col: parseInt(e.target.dataset.col),
          };
         handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
  
};

const handleMove = () => {
    constmove = {
        
    }
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
        p: "♙"   // Pawn
    };
    return unicodePieces[piece.type] || "";
};

renderBoard();
