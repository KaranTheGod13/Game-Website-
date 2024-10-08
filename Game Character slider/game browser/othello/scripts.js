const WHITE = 1, BLACK = -1, EMPTY = 0;
const DIRECTIONS = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const BOARD_SIZE = 800;
const SQUARE_SIZE = BOARD_SIZE / 8;
let board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
let player = WHITE;
let userColor = WHITE;
let gameOver = false;
let aiDepth = 1;

let whiteWins = 0;
let blackWins = 0;
let draws = 0;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const score = document.getElementById('score');
const resetButton = document.getElementById('resetButton');

function drawBoard() {
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    ctx.fillStyle = '#008000'; // Green color
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            ctx.strokeStyle = '#000';
            ctx.strokeRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            const piece = board[row][col];
            if (piece === WHITE) {
                ctx.beginPath();
                ctx.arc(col * SQUARE_SIZE + SQUARE_SIZE / 2, row * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 2 - 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
            } else if (piece === BLACK) {
                ctx.beginPath();
                ctx.arc(col * SQUARE_SIZE + SQUARE_SIZE / 2, row * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 2 - 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#000';
                ctx.fill();
            }
        }
    }

    let message = gameOver ? "Game Over" : (player === userColor ? "Your Turn" : "AI's Turn");
    if (gameOver) {
        const [whiteCount, blackCount] = getPieceCounts();
        if (whiteCount > blackCount) message = "You Win!";
        else if (blackCount > whiteCount) message = "AI Wins!";
        else message = "It's a Draw!";
    }
    status.innerText = message;
    updateScore();
}

function getPieceCounts() {
    let whiteCount = 0;
    let blackCount = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === WHITE) whiteCount++;
            else if (board[row][col] === BLACK) blackCount++;
        }
    }

    return [whiteCount, blackCount];
}

function isValidMove(row, col, player) {
    if (board[row][col] !== EMPTY) return false;
    const opponent = -player;
    let valid = false;

    for (const [dr, dc] of DIRECTIONS) {
        let r = row + dr, c = col + dc;
        let hasOpponentPiece = false;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === opponent) {
                hasOpponentPiece = true;
            } else if (board[r][c] === player) {
                if (hasOpponentPiece) {
                    valid = true;
                }
                break;
            } else {
                break;
            }
            r += dr;
            c += dc;
        }
    }

    return valid;
}

function applyMove(row, col, player) {
    const opponent = -player;
    board[row][col] = player;

    for (const [dr, dc] of DIRECTIONS) {
        let r = row + dr, c = col + dc;
        let piecesToFlip = [];

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (board[r][c] === player) {
                for (const [rr, cc] of piecesToFlip) {
                    board[rr][cc] = player;
                }
                break;
            } else {
                break;
            }
            r += dr;
            c += dc;
        }
    }
}

function hasValidMoves(player) {
    return board.some((row, r) => row.some((cell, c) => isValidMove(r, c, player)));
}

function getValidMoves(player) {
    const validMoves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col, player)) {
                validMoves.push([row, col]);
            }
        }
    }
    return validMoves;
}

function evaluateBoard() {
    let [whiteCount, blackCount] = getPieceCounts();
    return whiteCount - blackCount;
}

function minimax(depth, maximizingPlayer) {
    if (depth === 0 || (!hasValidMoves(WHITE) && !hasValidMoves(BLACK))) {
        return evaluateBoard();
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const [row, col] of getValidMoves(BLACK)) {
            const newBoard = board.map(row => row.slice());
            applyMove(row, col, BLACK);
            const eval = minimax(depth - 1, false);
            maxEval = Math.max(maxEval, eval);
            board = newBoard; // Restore board state
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const [row, col] of getValidMoves(WHITE)) {
            const newBoard = board.map(row => row.slice());
            applyMove(row, col, WHITE);
            const eval = minimax(depth - 1, true);
            minEval = Math.min(minEval, eval);
            board = newBoard; // Restore board state
        }
        return minEval;
    }
}

function aiMove() {
    let bestMove = null;
    let bestValue = -Infinity;
    for (const [row, col] of getValidMoves(BLACK)) {
        const newBoard = board.map(row => row.slice());
        applyMove(row, col, BLACK);
        const moveValue = minimax(aiDepth, false);
        board = newBoard; // Restore board state
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = [row, col];
        }
    }
    return bestMove;
}

function makeAIMove() {
    setTimeout(() => {
        const move = aiMove();
        if (move) {
            applyMove(move[0], move[1], BLACK);
            player = WHITE;
            if (!hasValidMoves(player)) {
                player = BLACK;
                if (!hasValidMoves(player)) {
                    gameOver = true;
                    const [whiteCount, blackCount] = getPieceCounts();
                    if (whiteCount > blackCount) whiteWins++;
                    else if (blackCount > whiteCount) blackWins++;
                    else draws++;
                }
            } else {
                drawBoard();
            }
        }
    }, 1000); // AI takes 1 second to make a move
}

function handleUserMove(row, col) {
    if (gameOver || player !== userColor) return;
    if (isValidMove(row, col, player)) {
        applyMove(row, col, player);
        player = BLACK;
        if (!hasValidMoves(player)) {
            player = WHITE;
            if (!hasValidMoves(player)) {
                gameOver = true;
                const [whiteCount, blackCount] = getPieceCounts();
                if (whiteCount > blackCount) whiteWins++;
                else if (blackCount > whiteCount) blackWins++;
                else draws++;
            }
        } else {
            makeAIMove();
        }
        drawBoard();
    }
}

function updateScore() {
    score.innerText = `White Wins: ${whiteWins} | Black Wins: ${blackWins} | Draws: ${draws}`;
}

function resetGame() {
    board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;
    player = WHITE;
    gameOver = false;
    drawBoard();
}

canvas.addEventListener('click', (event) => {
    if (gameOver || player !== userColor) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const row = Math.floor(y / SQUARE_SIZE);
    const col = Math.floor(x / SQUARE_SIZE);
    handleUserMove(row, col);
});

resetButton.addEventListener('click', resetGame);

drawBoard(); // Initial draw
