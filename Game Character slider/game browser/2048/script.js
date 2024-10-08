let grid = document.querySelector(".grid");
const startButton = document.getElementById("start-button");
const container = document.querySelector(".container");
const coverScreen = document.querySelector(".cover-screen");
const result = document.getElementById("result");
const overText = document.getElementById("over-text");

let matrix,
  score,
  isSwiped,
  touchY,
  initialY = 0,
  touchX,
  initialX = 0,
  rows = 4,
  columns = 4,
  swipeDirection;

let rectLeft = grid.getBoundingClientRect().left;
let rectTop = grid.getBoundingClientRect().top;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("high-score").innerText = highScore;

const getXY = (e) => {
  touchX = e.touches[0].pageX - rectLeft;
  touchY = e.touches[0].pageY - rectTop;
};

const createGrid = () => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const boxDiv = document.createElement("div");
      boxDiv.classList.add("box");
      boxDiv.setAttribute("data-position", `${i}_${j}`);
      grid.appendChild(boxDiv);
    }
  }
};

const adjacentCheck = (arr) => {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] == arr[i + 1]) {
      return true;
    }
  }
  return false;
};

const possibleMovesCheck = () => {
  for (let i in matrix) {
    if (adjacentCheck(matrix[i])) {
      return true;
    }
    let colarr = [];
    for (let j = 0; j < columns; j++) {
      colarr.push(matrix[i][j]);
    }
    if (adjacentCheck(colarr)) {
      return true;
    }
  }
  return false;
};

const randomPosition = (arr) => {
  return Math.floor(Math.random() * arr.length);
};

const hasEmptyBox = () => {
  for (let r in matrix) {
    for (let c in matrix[r]) {
      if (matrix[r][c] == 0) {
        return true;
      }
    }
  }
  return false;
};

const updateHighScore = () => {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("high-score").innerText = highScore;
    }
  };

const gameOverCheck = () => {
  if (!possibleMovesCheck()) {
    updateHighScore();
    coverScreen.classList.remove("hide");
    container.classList.add("hide");
    overText.classList.remove("hide");
    result.innerText = `Final score: ${score}`;
    startButton.innerText = "Restart Game";
  }
};

const generateTwo = () => {
  if (hasEmptyBox()) {
    let emptyPositions = [];
    for (let r in matrix) {
      for (let c in matrix[r]) {
        if (matrix[r][c] === 0) {
          emptyPositions.push([r, c]);
        }
      }
    }
    if (emptyPositions.length > 0) {
      let [randomRow, randomCol] = emptyPositions[randomPosition(emptyPositions)];
      matrix[randomRow][randomCol] = 2;
      let element = document.querySelector(`[data-position = '${randomRow}_${randomCol}']`);
      element.innerHTML = 2;
      element.classList.add("box-2");
    }
  } else {
    gameOverCheck();
  }
};

const generateFour = () => {
  if (hasEmptyBox()) {
    let emptyPositions = [];
    for (let r in matrix) {
      for (let c in matrix[r]) {
        if (matrix[r][c] === 0) {
          emptyPositions.push([r, c]);
        }
      }
    }
    if (emptyPositions.length > 0) {
      let [randomRow, randomCol] = emptyPositions[randomPosition(emptyPositions)];
      matrix[randomRow][randomCol] = 4;
      let element = document.querySelector(`[data-position = '${randomRow}_${randomCol}']`);
      element.innerHTML = 4;
      element.classList.add("box-4");
    }
  } else {
    gameOverCheck();
  }
};

const removeZero = (arr) => arr.filter((num) => num);
const checker = (arr, reverseArr = false) => {
  arr = reverseArr ? removeZero(arr).reverse() : removeZero(arr);

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] == arr[i + 1]) {
      arr[i] += arr[i + 1];
      arr[i + 1] = 0;
      score += arr[i];
    }
  }

  arr = reverseArr ? removeZero(arr).reverse() : removeZero(arr);

  let missingCount = 4 - arr.length;
  while (missingCount > 0) {
    if (reverseArr) {
      arr.unshift(0);
    } else {
      arr.push(0);
    }
    missingCount -= 1;
  }
  return arr;
};

const slideDown = () => {
  for (let i = 0; i < columns; i++) {
    let num = [];
    for (let j = 0; j < rows; j++) {
      num.push(matrix[j][i]);
    }
    num = checker(num, true);
    for (let j = 0; j < rows; j++) {
      matrix[j][i] = num[j];
      let element = document.querySelector(`[data-position='${j}_${i}']`);
      element.innerHTML = matrix[j][i] ? matrix[j][i] : "";
      element.classList.value = "";
      element.classList.add("box", `box-${matrix[j][i]}`);
    }
  }

  let decision = Math.random() > 0.5 ? 1 : 0;
  if (decision) {
    setTimeout(generateFour, 200);
  } else {
    setTimeout(generateTwo, 200);
  }
};

const slideUp = () => {
  for (let i = 0; i < columns; i++) {
    let num = [];
    for (let j = 0; j < rows; j++) {
      num.push(matrix[j][i]);
    }
    num = checker(num);
    for (let j = 0; j < rows; j++) {
      matrix[j][i] = num[j];
      let element = document.querySelector(`[data-position = '${j}_${i}']`);
      element.innerHTML = matrix[j][i] ? matrix[j][i] : "";
      element.classList.value = "";
      element.classList.add("box", `box-${matrix[j][i]}`);
    }
  }
  let decision = Math.random() > 0.5 ? 1 : 0;
  if (decision) {
    setTimeout(generateFour, 200);
  } else {
    setTimeout(generateTwo, 200);
  }
};

const slideRight = () => {
  for (let i = 0; i < rows; i++) {
    let num = [];
    for (let j = 0; j < columns; j++) {
      num.push(matrix[i][j]);
    }
    num = checker(num, true);
    for (let j = 0; j < columns; j++) {
      matrix[i][j] = num[j];
      let element = document.querySelector(`[data-position = '${i}_${j}']`);
      element.innerHTML = matrix[i][j] ? matrix[i][j] : "";
      element.classList.value = "";
      element.classList.add("box", `box-${matrix[i][j]}`);
    }
  }
  let decision = Math.random() > 0.5 ? 1 : 0;
  if (decision) {
    setTimeout(generateFour, 200);
  } else {
    setTimeout(generateTwo, 200);
  }
};

const slideLeft = () => {
  for (let i = 0; i < rows; i++) {
    let num = [];
    for (let j = 0; j < columns; j++) {
      num.push(matrix[i][j]);
    }

    num = checker(num);
    for (let j = 0; j < columns; j++) {
      matrix[i][j] = num[j];
      let element = document.querySelector(`[data-position = '${i}_${j}']`);
      element.innerHTML = matrix[i][j] ? matrix[i][j] : "";
      element.classList.value = "";
      element.classList.add("box", `box-${matrix[i][j]}`);
    }
  }
  let decision = Math.random() > 0.5 ? 1 : 0;
  if (decision) {
    setTimeout(generateFour, 200);
  } else {
    setTimeout(generateTwo, 200);
  }
};

document.addEventListener("keyup", (e) => {
  if (e.code == "ArrowLeft") {
    slideLeft();
  } else if (e.code == "ArrowRight") {
    slideRight();
  } else if (e.code == "ArrowUp") {
    slideUp();
  } else if (e.code == "ArrowDown") {
    slideDown();
  }
  document.getElementById("score").innerText = score;
  updateHighScore();
});

grid.addEventListener("touchstart", (event) => {
  isSwiped = true;
  getXY(event);
  initialX = touchX;
  initialY = touchY;
});

grid.addEventListener("touchmove", (event) => {
  if (isSwiped) {
    getXY(event);
    let diffX = touchX - initialX;
    let diffY = touchY - initialY;
    if (Math.abs(diffY) > Math.abs(diffX)) {
      swipeDirection = diffX > 0 ? "down" : "up";
    } else {
      swipeDirection = diffX > 0 ? "right" : "left";
    }
  }
});

grid.addEventListener("touchend", () => {
  isSwiped = false;
  let swipeCalls = {
    up: slideUp,
    down: slideDown,
    left: slideLeft,
    right: slideRight,
  };
  swipeCalls[swipeDirection]();
  document.getElementById("score").innerText = score;
  updateHighScore();
});

const startGame = () => {
    score = 0;
    document.getElementById("score").innerText = score;
    grid.innerHTML = "";
    matrix = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],  
    ];
    container.classList.remove("hide");
    coverScreen.classList.add("hide");
    createGrid();
    generateTwo();
    generateTwo();
};
  
startButton.addEventListener("click", () => {
  startGame();
  swipeDirection = "";
});