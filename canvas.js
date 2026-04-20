const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');


window.mode = "home";

const W = 1000, H = 700, SIZE = 50, SPEED = 1;
let x = (W - SIZE) / 2;
let y = (H - SIZE) / 2;

const keys = {};

// TRACKS WHICH MINI-GAME IS ACTIVE — added by Riley
let activeGame = null;

// HIDES ALL POPUPS — added by Riley
function hideAllPopups() {
  document.getElementById("startPopup").classList.add("hidden");
  document.getElementById("endPopup").classList.add("hidden");
  document.getElementById("eaStartPopup").classList.add("hidden");
  document.getElementById("eaEndPopup").classList.add("hidden");
}

// KEY CONTROLS
document.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();

    // track key press
    keys[e.key] = true;

    // lose if moving on red
    if (window.mode === "game" && gameStarted && light === "red" && !gameOver) {
      loseGame("You moved on RED!");
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    keys[e.key] = false;
  }
});

// MAIN DRAW LOOP
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (window.mode === "home") {
    drawHome();
  }

  if (window.mode === "inventory") {
    drawInventory();
  }

  if (window.mode === "shop") {
    drawShop();
  }

  // routes to correct game — added by Riley
  if (window.mode === "game") {
    if (activeGame === "ea") {
      drawEnemyAvoidance();
    } else {
      drawGame(); // red light green light
    }
  }
 
  requestAnimationFrame(draw);
}

// SCREENS
function drawHome() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("HOME (pet room)", 350, 350);
}

function drawInventory() {
  ctx.fillText("INVENTORY", 400, 350);
}

function drawShop() {
  ctx.fillText("SHOP", 430, 350);
}


const gameBg = new Image();
gameBg.src = "sprite/visuals/game-bg.svg";


// GAME
function drawGame() {
  // background
  ctx.drawImage(gameBg, 0, 0, W + 1, H + 1);

  // movement
  if (window.mode === "game" && !gameOver) {
    if (keys['ArrowLeft'])  x = Math.max(0, x - SPEED);
    if (keys['ArrowRight']) x = Math.min(W - SIZE, x + SPEED);
    if (keys['ArrowUp'])    y = Math.max(0, y - SPEED);
    if (keys['ArrowDown'])  y = Math.min(H - SIZE, y + SPEED);
  }

  // player
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, SIZE, SIZE);

  // UI from your partner file
  drawGameUI();

  if (gameStarted) {
    checkWin();
  }
}

// NAV BUTTONS — hide all popups when switching screens
document.getElementById("homeBtn").onclick = () => {
  window.mode = "home";
  hideAllPopups();
};
 
document.getElementById("inventoryBtn").onclick = () => {
  window.mode = "inventory";
  hideAllPopups();
};
 
document.getElementById("shopBtn").onclick = () => {
  window.mode = "shop";
  hideAllPopups();
};

// GAME BUTTON — randomly picks a game — added by Riley
document.getElementById("gameBtn").onclick = () => {
  const pick = Math.random() < 0.5 ? "rlgl" : "ea";
  activeGame = pick;
  window.mode = "game";
 
  if (pick === "rlgl") {
    document.getElementById("startPopup").classList.remove("hidden");
  } else {
    document.getElementById("eaStartPopup").classList.remove("hidden");
  }
};
 
// EA BUTTONS — added by Riley
document.getElementById("eaStartBtn").onclick = () => {
  document.getElementById("eaStartPopup").classList.add("hidden");
  startEnemyAvoidance();
};
 
document.getElementById("eaHomeBtn").onclick = () => {
  resetEnemyAvoidance();
  activeGame = null;
  window.mode = "home";
};

draw();