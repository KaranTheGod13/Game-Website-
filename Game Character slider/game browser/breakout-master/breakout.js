
// Define audio variables
let brickCollisionSound = new Audio('brick.mp3');
let paddleCollisionSound = new Audio('paddle.mp3');
let gameOverSound = new Audio('gameover.mp3');


//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

//players
let playerWidth = 80;
let playerHeight = 10;
let playerVelocityX = 30;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ballVelocityX = 2;
let ballVelocityY = 1;

let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY,
    rotation: 0,
    speedIncrement: 0.05
}

//blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    // ball trail effect
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.fillRect(0, 0, board.width, board.height);

    // player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ball
    ball.rotation += 0.1; // add rotation to the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    drawRotatedBall();

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        ball.velocityY *= -1;
        ball.velocityX += (Math.random() - 0.5) * ball.speedIncrement; // add a random element to the bounce
        paddleCollisionSound.play(); // Play paddle collision sound
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;
        ball.velocityY += (Math.random() - 0.5) * ball.speedIncrement;
        paddleCollisionSound.play(); // Play paddle collision sound
    }

    if (ball.y <= 0) {
        ball.velocityY *= -1;
    }
    else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
        ball.velocityX *= -1;
    }
    else if (ball.y + ball.height >= boardHeight) {
        context.font = "20px sans-serif";
        context.fillStyle = "white";
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
        gameOverSound.play(); // Play game over sound
        gameOver = true;
    }

    //blocks
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                score += 100;
                blockCount -= 1;
                brickCollisionSound.play(); // Play brick collision sound
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1;
                score += 100;
                blockCount -= 1;
                brickCollisionSound.play(); // Play brick collision sound
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //next level
    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns;
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        ball.velocityX *= 1.2; // increase ball speed after each level
        ball.velocityY *= 1.2;
        createBlocks();
    }

    //score
    context.font = "20px sans-serif";
    context.fillStyle = "white";
    context.fillText(score, 10, 25);
}


function drawRotatedBall() {
    context.save();
    context.translate(ball.x + ball.width / 2, ball.y + ball.height / 2);
    context.rotate(ball.rotation);
    context.fillStyle = "white";
    context.fillRect(-ball.width / 2, -ball.height / 2, ball.width, ball.height);
    context.restore();
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        let nextPlayerX = player.x - player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
    else if (e.code == "ArrowRight") {
        let nextPlayerX = player.x + player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10,
                y: blockY + r * blockHeight + r * 10,
                width: blockWidth,
                height: blockHeight,
                break: false
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player.x = boardWidth / 2 - playerWidth / 2;
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY,
        rotation: 0,
        speedIncrement: 0.05
    }
    blockRows = 3;
    score = 0;
    createBlocks();
    backgroundMusic.play(); // Restart background music
}
