let gameStarted = false;
let gameOver = false;
let light = "green";
let gameTimer = 7;
let goalLine = 20;
let rlglCountdown = 3;
let rlglCountdownActive = false;

const greenLight = new Image();
greenLight.src = "sprite/visuals/green-light.svg";

const redLight = new Image();
redLight.src = "sprite/visuals/red-light.svg";

document.getElementById("startBtn").onclick = () => {
  document.getElementById("startPopup").classList.add("hidden");

  rlglCountdown = 3;
  rlglCountdownActive = true;

  const interval = setInterval(() => {
    rlglCountdown--;
    if (rlglCountdown <= 0) {
      clearInterval(interval);
      rlglCountdownActive = false;
      startGame();
    }
  }, 1000);
};

function startGame() {
  gameStarted = true;
  startLightCycle();
  startTimer();
}

function startLightCycle() {
  function switchLight() {
    if (gameOver) return;
    if (light === "green") {
      light = "red";
      setTimeout(switchLight, Math.random() * 1000 + 2000);
    } else {
      light = "green";
      setTimeout(switchLight, Math.random() * 3000 + 2000);
    }
  }
  switchLight();
}

function startTimer() {
  const timerInterval = setInterval(() => {
    if (gameOver) { clearInterval(timerInterval); return; }
    gameTimer--;
    if (gameTimer <= 0) {
      loseGame("Time ran out!");
      clearInterval(timerInterval);
    }
  }, 1000);
}

function drawGameUI() {
  ctx.fillStyle = "pink";
  ctx.fillRect(0, goalLine + currentPet.size - 50, W, 5);

  if (rlglCountdownActive) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(10, 10, 220, 60);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Starting in: ${rlglCountdown}`, 20, 40);
    ctx.font = "16px Arial";
    ctx.fillText("Get ready!", 20, 62);
    ctx.textAlign = "left";
    return;
  }

  const img = light === "green" ? greenLight : redLight;
  const width = 80;
  const ratio = img.height / img.width || 1;
  const height = width * ratio;
  ctx.drawImage(img, 20, 20, width, height);

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(10, 10, 220, 60);
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Time left: ${gameTimer}s`, 20, 40);
  ctx.font = "16px Arial";
  ctx.fillText(light === "green" ? "GO! Keep moving!" : "STOP! Don't move!", 20, 62);
  ctx.textAlign = "left";
}

function checkWin() {
  if (y <= goalLine && !gameOver) {
    winGame();
  }
}

function winGame() {
  if (gameOver) return;
  gameOver = true;

  const earnedExp = Math.floor(Math.random() * 51) + 50;
  const earnedFlowers = Math.floor(Math.random() * 21) + 30;

  if (typeof window.flowers !== "number" || isNaN(window.flowers)) {
    window.flowers = 0;
  }

  window.flowers += earnedFlowers;
  updateCurrencyUI();

  document.getElementById("endPopup").classList.remove("hidden");
  document.getElementById("endText").innerHTML =
    `You Win!<br>+${earnedExp} EXP<br>🌸 +${earnedFlowers} Flowers`;

  if (typeof addXP === "function") addXP(earnedExp);
  if (typeof handlePetXP === "function") handlePetXP(earnedExp);
}

function loseGame(message) {
  gameOver = true;
  document.getElementById("endPopup").classList.remove("hidden");
  document.getElementById("endText").innerText = message;
}

function goHome() {
  window.mode = "home";
  document.getElementById("startPopup").classList.add("hidden");
  document.getElementById("endPopup").classList.add("hidden");

  gameStarted = false;
  gameOver = false;
  gameTimer = 7;
  light = "green";
  rlglCountdown = 3;
  rlglCountdownActive = false;

  x = (W - SIZE) / 2;
  y = (H - SIZE) / 2;
}