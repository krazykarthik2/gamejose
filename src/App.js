import React, { useEffect, useState } from "react";
import "./App.css";
import "./tailwind.css";

const initialBoard = Array(24).fill(0); // 24 valid positions on the board
const horizontalMillPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
];
const verticalMillPatterns = [
  [0, 9, 21],
  [3, 10, 18],
  [6, 11, 15],
  [1, 4, 7],
  [16, 19, 22],
  [8, 12, 17],
  [5, 13, 20],
  [2, 14, 23],
];

const millPatterns = [...horizontalMillPatterns, ...verticalMillPatterns];

const adjacency = {
  0: [1, 9],
  1: [0, 2, 4],
  2: [1, 14],
  3: [4, 10],
  4: [1, 3, 5, 7],
  5: [4, 13],
  6: [7, 11],
  7: [4, 6, 8],
  8: [7, 12],
  9: [0, 10, 21],
  10: [3, 9, 11, 18],
  11: [6, 10, 15],
  12: [8, 13, 17],
  13: [5, 12, 14, 20],
  14: [2, 13, 23],
  15: [11, 16],
  16: [15, 17, 19],
  17: [12, 16],
  18: [10, 19],
  19: [16, 18, 20, 22],
  20: [13, 19],
  21: [9, 22],
  22: [19, 21, 23],
  23: [14, 22],
};
const placementGraph = [
  [0, "-", "-", "-", "-", "-", 1, "-", "-", "-", "-", "-", 2],
  ["|", null, null, null, null, null, "|", null, null, null, null, null, "|"],
  ["|", null, 3, "-", "-", "-", 4, "-", "-", "-", 5, null, "|"],
  ["|", null, "|", null, null, null, "|", null, null, null, "|", null, "|"],
  ["|", null, "|", null, 6, "-", 7, "-", 8, null, "|", null, "|"],
  ["|", null, "|", null, "|", null, null, null, "|", null, "|", null, "|"],
  [9, "-", 10, "-", 11, null, null,null, 12, "-", 13, "-", 14],
  ["|", null, "|", null, "|", null, null,null, "|", null, "|", null, "|"],
  ["|", null, "|", null, 15, "-", 16, "-", 17, null, "|", null, "|"],
  ["|", null, "|", null, null, null, "|", null, null, null, "|", null, "|"],
  ["|", null, 18, "-", "-", "-", 19, "-", "-", "-", 20, null, "|"],
  ["|", null, null, null, null, null, "|", null, null, null, null, null, "|"],
  [21, "-", "-", "-", "-", "-", 22, "-", "-", "-", "-", "-", 23],
];
// Graphize the board with adjacency data for rendering
const graphized = (board) => {
  return placementGraph.map((row) =>
    row.map((cell) => ({
      index: !Number.isInteger(cell) ? null : cell,
      cell: !Number.isInteger(cell) ? 0 : board[cell],
    }))
  );
};
const Dash = () => {
  return <div className="w-full h-2 graphic-line"></div>;
};
const Pipe = () => {
  return <div className="w-2 h-full graphic-line"></div>;
};
function App() {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [phase, setPhase] = useState(1); // 1: Placing, 2: Moving, 3: Flying
  const [playerPieces, setPlayerPieces] = useState({ 1: 9, 2: 9 });
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [message, setMessage] = useState("Player 1: Place a piece");

  const handlePlacePiece = (index) => {
    if (board[index] !== 0 || playerPieces[currentPlayer] === 0) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const __playerPieces = {
      ...playerPieces,
      [currentPlayer]: playerPieces[currentPlayer] - 1,
    };
    setPlayerPieces(__playerPieces);
    setBoard(newBoard);

    if (checkMill(newBoard, index)) {
      setMessage(
        `Player ${currentPlayer} formed a mill! Remove an opponent's piece.`
      );
      setPhase(-1); // Removal phase
    } else {
      switchPlayer();
      if (__playerPieces[1] === 0 && __playerPieces[2] === 0) {
        setPhase(2); // Move to moving phase
      }
    }
  };

  const handleMovePiece = (index) => {
    if (selectedPiece === null) {
      if (board[index] === currentPlayer) setSelectedPiece(index);
    } else {
      if (board[index] === 0 && isAdjacent(selectedPiece, index)) {
        const newBoard = [...board];
        newBoard[selectedPiece] = 0;
        newBoard[index] = currentPlayer;

        setBoard(newBoard);
        setSelectedPiece(null);

        if (checkMill(newBoard, index)) {
          setMessage(
            `Player ${currentPlayer} formed a mill! Remove an opponent's piece.`
          );
          setPhase(-1); // Removal phase
        } else {
          switchPlayer();
        }
      } else {
        setSelectedPiece(null);
      }
    }
  };

  const handleRemovePiece = (index) => {
    if (board[index] !== 0 && board[index] !== currentPlayer) {
      const newBoard = [...board];
      newBoard[index] = 0;
      setBoard(newBoard);

      if (
        newBoard.filter((piece) => piece === 3 - currentPlayer).length < 3 &&
        playerPieces[3 - currentPlayer] === 0
      ) {
        setMessage(`Player ${currentPlayer} wins!`);
        setPhase(0); // Game over
      } else {
        setPhase(playerPieces[1] === 0 && playerPieces[2] === 0 ? 2 : 1);
        switchPlayer();
      }
    }
  };

  const handleClick = (index) => {
    console.log("phase", phase);
    if (phase === 1) {
      handlePlacePiece(index);
    } else if (phase === 2) {
      console.log("moving");
      handleMovePiece(index);
    } else if (phase === -1) {
      handleRemovePiece(index);
    }
  };

  const checkMill = (newBoard, index) => {
    return millPatterns.some(
      (pattern) =>
        pattern.includes(index) &&
        pattern.every((pos) => newBoard[pos] === currentPlayer)
    );
  };

  const isAdjacent = (pos1, pos2) => {
    return adjacency[pos1]?.includes(pos2);
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setMessage(`Player ${currentPlayer === 1 ? 2 : 1}'s turn`);
  };

  const [graphizedBoard, setGraphizedBoard] = useState(graphized(initialBoard));
  useEffect(() => {
    setGraphizedBoard(graphized(board));
  }, [board]);

  return (
    <div className="App">
      <h1>Nine Men's Morris</h1>
      <p>{message}</p>
      <div className="board">
        {graphizedBoard.map((row, row_index) => (
          <div className="row" key={row_index * 49}>
            {row.map(({ cell, index }, col_index) => (
              <button
                type="button"
                key={row_index * 7 + col_index}
                className={`cell ${
                  index == null
                    ? "blank"
                    : ["unocc", "player1", "player2"][cell]
                }`}
                onClick={() => handleClick(index)}
              >
                {index == null &&
                  { "-": <Dash />, "|": <Pipe /> }[
                    placementGraph?.[row_index]?.[col_index]
                  ]}
                {cell == null ? "blank" : ["", "X", "O"][cell]}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="remaining-pieces">
        {playerPieces[1] > 0 ? (
          <div className="flex d-center">
            1-X:{" "}
            {Array(playerPieces[1])
              .fill(0)
              .map((e, i) => (
                <div
                  key={i}
                  className={`flex bg-red-500 w-5 h-5 rounded-full`}
                ></div>
              ))}
          </div>
        ) : (
          <div className="phase-2">No pieces for Player -2</div>
        )}
        {playerPieces[2] > 0 ? (
          <div className="flex d-center">
            2-O:{" "}
            {Array(playerPieces[2])
              .fill(0)
              .map((e, i) => (
                <div
                  key={i}
                  className={`flex bg-blue-500 w-5 h-5 rounded-full`}
                ></div>
              ))}
          </div>
        ) : (
          <div className="phase-2">No pieces for Player -1</div>
        )}
      </div>
      <div className="selected-piece">
        {selectedPiece !== null && <p>Selected piece: {selectedPiece}</p>}
      </div>
    </div>
  );
}

export default App;
