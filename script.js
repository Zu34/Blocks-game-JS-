
let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("h2");
let ctx = canvas.getContext("2d");
ctx.scale(30, 30);

const PIECE_SHAPES = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1],
        [1, 1]
    ]
];

const PIECE_COLORS = [
    "#fff",
    "#9b5fe0",
    "#16a4d8",
    "#60dbe8",
    "#8bd346",
    "#efdf48",
    "#f9a52c",
    "#d64e12"
];

const GRID_ROWS = 20;
const GRID_COLS = 10;

let gameGrid = generateGameGrid();
let activePiece = null;
let playerScore = 0;
let gameLoopInterval = null;
let isGamePaused = false;
let isGameOver = false;

// Start the game loop
startGameLoop();

function startGameLoop() {
    gameLoopInterval = setInterval(updateGameState, 500);
}

function togglePause() {
    if (isGamePaused) {
        startGameLoop();
        isGamePaused = false;
    } else {
        clearInterval(gameLoopInterval);
        isGamePaused = true;
    }
}

function updateGameState() {
    if (isGameOver) return;

    clearCompletedRows();
    if (!activePiece) {
        activePiece = generateRandomPiece();
        renderPiece();
    }
    movePieceDown();
}

function clearCompletedRows() {
    let completedRows = 0;
    for (let i = 0; i < gameGrid.length; i++) {
        let isRowFull = true;
        for (let j = 0; j < gameGrid[0].length; j++) {
            if (gameGrid[i][j] === 0) {
                isRowFull = false;
            }
        }
        if (isRowFull) {
            completedRows++;
            gameGrid.splice(i, 1);
            gameGrid.unshift(Array(GRID_COLS).fill(0));
        }
    }
    if (completedRows === 1) {
        playerScore += 10;
    } else if (completedRows === 2) {
        playerScore += 30;
    } else if (completedRows === 3) {
        playerScore += 50;
    } else if (completedRows > 3) {
        playerScore += 100;
    }
    scoreboard.innerHTML = "Score: " + playerScore;
}

function generateGameGrid() {
    let grid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
        grid.push(Array(GRID_COLS).fill(0));
    }
    return grid;
}

function generateRandomPiece() {
    let randomIndex = Math.floor(Math.random() * 7);
    let piece = PIECE_SHAPES[randomIndex];
    let colorIndex = randomIndex + 1;
    let x = 4;
    let y = 0;
    return { piece, colorIndex, x, y };
}

function renderPiece() {
    let piece = activePiece.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === 1) {
                ctx.fillStyle = PIECE_COLORS[activePiece.colorIndex];
                ctx.fillRect(activePiece.x + j, activePiece.y + i, 1, 1);
            }
        }
    }
}

function movePieceDown() {
    if (isGameOver) return;
    if (!checkForCollision(activePiece.x, activePiece.y + 1)) {
        activePiece.y += 1;
    } else {
        let piece = activePiece.piece;
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] === 1) {
                    let p = activePiece.x + j;
                    let q = activePiece.y + i;
                    gameGrid[q][p] = activePiece.colorIndex;
                }
            }
        }
        if (activePiece.y === 0) {
            endGame();
            return;
        }
        activePiece = null;
    }
    renderGameGrid();
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoopInterval);

    // Show the "Game Over" modal
    const modal = document.getElementById("game-over-modal");
    modal.style.display = "block";
}

function restartGame() {
    // Hide the "Game Over" modal
    const modal = document.getElementById("game-over-modal");
    modal.style.display = "none";

    gameGrid = generateGameGrid();
    playerScore = 0;
    activePiece = null;
    isGameOver = false;
    scoreboard.innerHTML = "Score: " + playerScore;
    startGameLoop();
}

// Add an event listener to the restart button
document.getElementById("restart-btn").addEventListener("click", restartGame);

function movePieceLeft() {
    if (!checkForCollision(activePiece.x - 1, activePiece.y))
        activePiece.x -= 1;
    renderGameGrid();
}

function movePieceRight() {
    if (!checkForCollision(activePiece.x + 1, activePiece.y))
        activePiece.x += 1;
    renderGameGrid();
}

function rotatePiece() {
    let rotatedPiece = [];
    let piece = activePiece.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }

    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if (!checkForCollision(activePiece.x, activePiece.y, rotatedPiece))
        activePiece.piece = rotatedPiece;
    renderGameGrid();
}

function checkForCollision(x, y, rotatedPiece) {
    let piece = rotatedPiece || activePiece.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < GRID_COLS && q >= 0 && q < GRID_ROWS) {
                    if (gameGrid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGameGrid() {
    if (isGameOver) return;
    for (let i = 0; i < gameGrid.length; i++) {
        for (let j = 0; j < gameGrid[i].length; j++) {
            ctx.fillStyle = PIECE_COLORS[gameGrid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    renderPiece();
}

// Handle keyboard input
document.addEventListener("keydown", function (e) {
    let key = e.key;

    // Prevent scrolling 
    if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(key)) {
        e.preventDefault();
    }

    if (isGameOver && key !== "r") return;

    if (key === "ArrowDown") movePieceDown();
    else if (key === "ArrowLeft") movePieceLeft();
    else if (key === "ArrowRight") movePieceRight();
    else if (key === "ArrowUp") rotatePiece();
    else if (key === "p") togglePause();
    else if (key === "r" && isGameOver) restartGame();
});
