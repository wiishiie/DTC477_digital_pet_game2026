let gameStarted = false;
let gameOver = false;
let light = "green";
let gameTimer = 7;
let goalLine = 50;

const greenLight = new Image();
greenLight.src = "sprite/visuals/green-light.svg";

const redLight = new Image();
redLight.src = "sprite/visuals/red-light.svg";

// START BUTTON
document.getElementById("startBtn").onclick = () => {
  document.getElementById("startPopup").classList.add("hidden");
 
  let count = 3;
 
  const interval = setInterval(() => {
    console.log("Starting in:", count);
    count--;
 
    if (count < 0) {
      clearInterval(interval);
      startGame();
    }
  }, 1000);
};
 
function startGame() {
  gameStarted = true;
  startLightCycle();
  startTimer();
}
 
// LIGHT SWITCH
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
 
// TIMER
function startTimer() {
  const timerInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(timerInterval);
      return;
    }
 
    gameTimer--;
 
    if (gameTimer <= 0) {
      loseGame("Time ran out!");
      clearInterval(timerInterval);
    }
  }, 1000);
}
 
// UI
function drawGameUI() {
  const img = light === "green" ? greenLight : redLight;

  const width = 80;
  const ratio = img.height / img.width || 1; // fallback
  const height = width * ratio;

  ctx.drawImage(img, 20, 20, width, height);

  ctx.fillStyle = "blue";
  ctx.fillRect(0, goalLine, W, 5);
}
// WIN
function checkWin() {
  if (y <= goalLine && !gameOver) {
    winGame();
  }
}
 
function winGame() {
  gameOver = true;
 
  // Random rewards between 20–50
  const earnedExp   = Math.floor(Math.random() * 51) + 50;
  const earnedCoins = Math.floor(Math.random() * 31) + 20;
 
  // Show rewards in the popup
  document.getElementById("endPopup").classList.remove("hidden");
  document.getElementById("endText").innerHTML =
    `You Win!<br> +${earnedExp} EXP &nbsp;  +${earnedCoins} Coins`;
 
  // Award XP + coins via food-exp-bars.js
  if (typeof addXP === "function") addXP(earnedExp, earnedCoins);
}
 
function loseGame(message) {
  gameOver = true;
 
  document.getElementById("endPopup").classList.remove("hidden");
  document.getElementById("endText").innerText = message;
}
 
// RESET
function goHome() {
  mode = "home";
 
  document.getElementById("startPopup").classList.add("hidden");
  document.getElementById("endPopup").classList.add("hidden");
 
  gameStarted = false;
  gameOver = false;
  gameTimer = 10;
  light = "green";
 
  x = (W - SIZE) / 2;
  y = (H - SIZE) / 2;
}