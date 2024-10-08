var playerRed = "R";
var playerYellow = "Y";
var currPlayer = playerRed;

var gameOver = false;
var board;

var rows = 6;
var columns = 7;
var currColumns = []; //keeps track of which row each column is at.
var audio;

window.onload = function() {
    setupAudio();
    setGame();
}

function setupAudio() {
    audio = new Audio('sound/music.wav');
    audio.loop = true;
}

function playMusic() {
    if (audio) {
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
}

function setGame() {
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];
    gameOver = false;
    currPlayer = playerRed;
    
    document.getElementById("winner").innerText = "";
    document.getElementById("board").innerHTML = "";

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            // JS
            row.push(' ');
            // HTML
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.addEventListener("click", setPiece);
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }

    // Ensure music starts playing after game setup
    document.getElementById("playAgainButton").disabled = false;
}

function setPiece() {
    if (gameOver) {
        return;
    }

    //get coords of that tile clicked
    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    // figure out which row the current column should be on
    r = currColumns[c]; 

    if (r < 0) { // board[r][c] != ' '
        return;
    }

    placePiece(r, c, currPlayer);

    if (!gameOver) {
        setTimeout(aiMove, 500); // AI makes a move after 0.5 seconds
    }
}

function aiMove() {
    if (gameOver) {
        return;
    }

    let bestScore = -Infinity;
    let bestCol = null;

    for (let c = 0; c < columns; c++) {
        let r = currColumns[c];
        if (r >= 0) {
            board[r][c] = playerYellow;
            let score = scorePosition(board, playerYellow);
            board[r][c] = ' ';
            if (score > bestScore) {
                bestScore = score;
                bestCol = c;
            }
        }
    }

    if (bestCol !== null) {
        let r = currColumns[bestCol];
        placePiece(r, bestCol, playerYellow);
    }
}

function scorePosition(board, player) {
    let score = 0;

    // Score center column
    let centerArray = [];
    for (let r = 0; r < rows; r++) {
        centerArray.push(board[r][Math.floor(columns / 2)]);
    }
    score += centerArray.filter(tile => tile == player).length * 3;

    // Score Horizontal
    for (let r = 0; r < rows; r++) {
        let rowArray = board[r];
        for (let c = 0; c < columns - 3; c++) {
            let window = rowArray.slice(c, c + 4);
            score += evaluateWindow(window, player);
        }
    }

    // Score Vertical
    for (let c = 0; c < columns; c++) {
        let colArray = [];
        for (let r = 0; r < rows; r++) {
            colArray.push(board[r][c]);
        }
        for (let r = 0; r < rows - 3; r++) {
            let window = colArray.slice(r, r + 4);
            score += evaluateWindow(window, player);
        }
    }

    // Score Positive Diagonal
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            let window = [
                board[r][c],
                board[r + 1][c + 1],
                board[r + 2][c + 2],
                board[r + 3][c + 3]
            ];
            score += evaluateWindow(window, player);
        }
    }

    // Score Negative Diagonal
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            let window = [
                board[r + 3][c],
                board[r + 2][c + 1],
                board[r + 1][c + 2],
                board[r][c + 3]
            ];
            score += evaluateWindow(window, player);
        }
    }

    return score;
}

function evaluateWindow(window, player) {
    let score = 0;
    let opponent = player == playerRed ? playerYellow : playerRed;

    if (window.filter(tile => tile == player).length == 4) {
        score += 100;
    } else if (window.filter(tile => tile == player).length == 3 && window.filter(tile => tile == ' ').length == 1) {
        score += 5;
    } else if (window.filter(tile => tile == player).length == 2 && window.filter(tile => tile == ' ').length == 2) {
        score += 2;
    }

    if (window.filter(tile => tile == opponent).length == 3 && window.filter(tile => tile == ' ').length == 1) {
        score -= 4;
    }

    return score;
}

function placePiece(r, c, player) {
    board[r][c] = player; //update JS board
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    if (player == playerRed) {
        tile.classList.add("red-piece");
        currPlayer = playerYellow;
    } else {
        tile.classList.add("yellow-piece");
        currPlayer = playerRed;
    }

    r -= 1; //update the row height for that column
    currColumns[c] = r; //update the array

    checkWinner();
}

function checkWinner() {
    // horizontal
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    // vertical
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r + 1][c] && board[r + 1][c] == board[r + 2][c] && board[r + 2][c] == board[r + 3][c]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    // anti diagonal
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r + 1][c + 1] && board[r + 1][c + 1] == board[r + 2][c + 2] && board[r + 2][c + 2] == board[r + 3][c + 3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    // diagonal
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (board[r][c] != ' ') {
                if (board[r][c] == board[r - 1][c + 1] && board[r - 1][c + 1] == board[r - 2][c + 2] && board[r - 2][c + 2] == board[r - 3][c + 3]) {
                    setWinner(r, c);
                    return;
                }
            }
        }
    }
}

function setWinner(r, c) {
    let winner = document.getElementById("winner");
    if (board[r][c] == playerRed) {
        winner.innerText = "Red Wins";
    } else {
        winner.innerText = "Yellow Wins";
    }
    gameOver = true;
    document.getElementById("playAgainButton").disabled = false;
}

document.getElementById("playAgainButton").addEventListener("click", function() {
    setGame();
    playMusic();
});
