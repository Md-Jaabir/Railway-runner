let runner = document.querySelector(".runner");
let gameContainer = document.querySelector(".game");
let obstacleContainer = document.querySelector(".obstacles");
let coinChain = document.querySelector(".coin-chain");
let gameWidth = parseFloat(getComputedStyle(gameContainer).getPropertyValue("width"));
let gameHeight = parseFloat(getComputedStyle(gameContainer).getPropertyValue("height"));
let playerHeight = parseFloat(getComputedStyle(runner).getPropertyValue("height"));
let playerTop = parseFloat(getComputedStyle(runner).getPropertyValue("top"));
let playerTrack = 1;
let isJumping = false;
let isSliding = false;
let isGameOver = false;
let jumpTime = 900;
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;
let obstacleNames = ["train", "slidable", "jumpable"];
let obstacles = [];
let lastTime = 0;
let obstacleSpeed = .25;
let coinChainTop;
let trainSpeed = 4;
let coinChainMove = false;
let coinTrack;
let coinHeight = 37;
let totalCoins = 0;
let backgroundMusic = new Audio("./assets/audios/background.mp3");
let coinSound = new Audio("./assets/audios/coin.mp3");
let jumpingSound = new Audio("./assets/audios/jumping.mp3");
let crashSound = new Audio("./assets/audios/crash2.mp3");
let trainSounds = [];
let hasGameStarted = false;
window.onload = () => {

}
window.onclick = startGame;
requestAnimationFrame(update);
function playBackgroundSound() {
  backgroundMusic.volume = .4;
  backgroundMusic.play();
  setInterval(() => {
    if(!isGameOver){
      backgroundMusic.play();
    }
  }, 58000);
}
function playJumpingSound() {
  jumpingSound.currentTime = 1.35;
  jumpingSound.play();
  setTimeout(() => {
    jumpingSound.pause();
  }, 1000)
}
function playTrainSound() {
  //let index=trainSounds.length;
  trainSounds.push(new Audio("./assets/audios/train.mp3"));
  let trainSound = trainSounds[trainSounds.length - 1];
  trainSound.currentTime = 0;
  trainSound.play();
  setTimeout(() => {
    trainSound.pause();
  }, 3000);
}
function update(time) {
  if (!hasGameStarted) {
    requestAnimationFrame(update);
    return;
  }
  let deltaTime = time - lastTime;
  lastTime = time;
  if (isGameOver) return;
  obstacleSpeed += .00005;
  //moving rail tracks
  // if(hasGameStarted && !isGameOver){moveRailTracks(obstacleSpeed, deltaTime)};
  obstacles.forEach(({ element, trackNo, name }, index) => {
    let obsTop = parseFloat(getComputedStyle(element).getPropertyValue("top"));
    let obsHeight = parseFloat(getComputedStyle(element).getPropertyValue("height"));
    coinChainTop = parseFloat(getComputedStyle(coinChain).getPropertyValue("top"));
    //detecting while the obstacle is out
    if (obsTop > (gameHeight + obsHeight)) {
      addObstacle(trackNo);
      obstacles.splice(index, 1);
      obstacleContainer.removeChild(element);
    }

    //moving obstacle
    //train and other obstacles
    if (name === "train") {
      obsTop = obsTop + obstacleSpeed * deltaTime + trainSpeed;
    } else {
      obsTop += obstacleSpeed * deltaTime;

    }

    element.style.top = obsTop + "px";


    //detecting collision
    if (trackNo == playerTrack) {
      detectCollision(obsTop, obsHeight, name,element)
    }
  });
  //moving coins
  if (coinChainMove) {
    coinChainTop += (obstacleSpeed * deltaTime);
    coinChain.style.top = coinChainTop + "px";
  }
  //destroying old coins and generation new
  let coinChainHeight = parseFloat(getComputedStyle(coinChain).getPropertyValue("height"));
  if (coinChainTop > (coinChainHeight + gameHeight)) {
    coinChain.innerHTML = "";
    addCoins();
    coinChain.style.top = "0px";
    coinChain.style.display = "none";
    coinChainMove = false;
  }
  detectCoinConsumption(coinChainTop);
  requestAnimationFrame(update);
}
function move(direction) {
  if (playerTrack == 1) {
    if (direction == "left") {
      runner.style.left = "17%";
      setTimeout(() => { playerTrack-- }, 100)
    } else if (direction == "right") {
      runner.style.left = "83%";
      setTimeout(() => { playerTrack++ }, 100)
    }
  } else if (playerTrack == 0) {
    if (direction == "right") {
      runner.style.left = "50%";
      setTimeout(() => { playerTrack++ }, 100)
    }
  } else if (playerTrack == 2) {
    if (direction == "left") {
      runner.style.left = "50%";
      setTimeout(() => { playerTrack-- }, 100)
    }
  }
}
function jump() {
  if (isJumping || isSliding) return;
  isJumping = true;
  runner.classList.remove("run");
  runner.classList.add("jump");
  runner.style.zIndex = 2;
  playJumpingSound();
  setTimeout(() => {
    isJumping = false;
    runner.classList.remove("jump");
    runner.classList.add("run");
    runner.style.zIndex = 0;
  }, jumpTime)
}
function slide() {
  if (isJumping || isSliding) return;
  isSliding = true;
  runner.classList.remove("run");
  runner.classList.add("slide");
  playJumpingSound();
  setTimeout(() => {
    isSliding = false;
    runner.classList.remove("slide");
    runner.classList.add("run");
  }, jumpTime)
}
function addObstacle(trackNo) {
  let obstacle = randomElement(obstacleNames);
  if (obstacle == "train") {
    playTrainSound();
  }
  let obstacleElement = document.createElement("div");
  obstacleElement.className = `obstacle ${obstacle} track-${trackNo} ${obstacle == "jumpable" ? randomElement(["whole", "brick"]) : ""}`;
  setTimeout(() => {
    obstacleContainer.appendChild(obstacleElement);
    obstacles.push({ name: obstacle, element: obstacleElement, trackNo })
  }, randBetween(500, 1500))

}
function gameOver(obstacle) {
  isGameOver = true;
  runner.classList.remove("run");
  runner.classList.remove("jump");
  runner.classList.remove("slide");
  backgroundMusic.pause();
  coinSound.pause();
  jumpingSound.pause();
  trainSounds.forEach(sound=>sound.pause());
  if(obstacle.classList.contains("train") ||
     obstacle.classList.contains("jumpable") ||
     obstacle.classList.contains("slidable")){
      crashSound.play();
  }
}
function detectCollision(top, height, name,obstacle) {
  let minTop = playerTop - height + 30;
  let maxTop = playerTop + playerHeight - 30;
  if (top > minTop && top < maxTop) {
    if ((name == "slidable" && !isSliding) || (name == "jumpable" && !isJumping) || name == "train") {
      gameOver(obstacle);
    }
  }
}
function handleGesture() {
  let { left, right, down, up } = {
    left: touchstartX - touchendX,
    right: touchendX - touchstartX,
    down: touchendY - touchstartY,
    up: touchstartY - touchendY,
  };
  let minDepth = 20;
  if ((left > up) && (left > down) && (left > minDepth)) {
    move("left");
  }

  if ((right > up) && (right > down) && (right > minDepth)) {
    move("right");
  }

  if ((up > left) && (up > right) && (up > minDepth)) {
    jump();
  }

  if ((down > left) && (down > right) && (down > minDepth)) {
    slide();
  }
}
function handleKeyBoardInput() {
  window.onkeydown = (event) => {
    if (event.key == "w") {
      jump();
    } else if (event.key == "a") {
      move("left");
    } else if (event.key == "d") {
      move("right");
    } else if (event.key == "s") {
      slide();
    }
  }
}
function addCoins() {
  let coinCount = randBetween(5, 15);
  coinTrack = randBetween(0, 2);
  for (let i = 0; i <= coinCount; i++) {
    let coin = document.createElement("div");
    coin.classList.add("coin");
    coinChain.appendChild(coin);
  }

  setTimeout(() => {
    coinChain.style.top = `${-(coinCount * 37 + coinCount * 15)}px`;
    coinChainMove = true;
    coinChain.style.display = "flex";
    if (coinTrack == 0) {
      coinChain.style.left = "17%";
    } else if (coinTrack == 1) {
      coinChain.style.left = "50%";
    } else {
      coinChain.style.left = "83%";
    }
  }, randBetween(0, 500))
}
function detectCoinConsumption(coinChainTop) {
  if (coinTrack === playerTrack) {
    let coins = document.querySelectorAll(".coin");
    coins.forEach((coin, previousCoins) => {
      let coinTop = coinChainTop + previousCoins * 44;
      let minTop = playerTop - coinHeight + 30;
      let maxTop = playerTop + playerHeight - 30;
      if (coinTop > minTop && coinTop < 574 && !coin.hasEaten) {
        coin.style.opacity = 0;
        coin.hasEaten = true;
        //coinChain.removeChild(coin);
        totalCoins++;
        coinSound.currentTime = 0;
        coinSound.play();
      }
    })
  }
}
function startGame() {
  document.querySelector(".start-menu").style.display="none";
  hasGameStarted = true;
  runner.classList.add("run");
  addObstacle(0);
  addObstacle(1);
  addObstacle(2);
  addCoins();
  playBackgroundSound();
  handleKeyBoardInput();
  gameContainer.addEventListener('touchstart', function (event) {
    touchstartX = event.touches[0].clientX;
    touchstartY = event.touches[0].clientY;
  }, false);
  gameContainer.addEventListener('touchmove', function (event) {
    touchendX = event.touches[0].clientX;
    touchendY = event.touches[0].clientY;
  }, false);
  gameContainer.addEventListener('touchend', function (event) {
    handleGesture();
  }, false);
}