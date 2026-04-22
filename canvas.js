const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const FRAME_SPEED = 80;
const SPRITE_SIZE = 180;

const W = 1000, H = 700, SIZE = 50, SPEED = 2;
let x = (W - SIZE) / 4;
let y = (H - SIZE) / 4;
let facing = "idle";

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
    keys[e.key] = true;
   if (activeGame === "rlgl" && window.mode === "game" && gameStarted && light === "red" && !gameOver) {
      loseGame("You moved on RED!");
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    keys[e.key] = false;
  }
});

window.mode = "starter";

// STARTER SCREEN
const starterSprites = {};

async function loadStarterSprites() {
  const starters = ["cat", "dog", "fish"];
  for (const animal of starters) {
    const jsonPath = `sprite/${animal}/egg/egg-${animal}-idle.json`;
    const imgPath  = `sprite/${animal}/egg/egg-${animal}-idle.png`;

    const res = await fetch(jsonPath);
    const data = await res.json();

    const img = new Image();
    img.src = imgPath;
    await new Promise(resolve => img.onload = resolve);

    starterSprites[animal] = {
      img,
      frames: Object.values(data.frames),
      current: 0,
      timer: 0,
    };
  }
}

const STARTER_POSITIONS = {
  cat:  { x: 100,  y: 250 },
  dog:  { x: 400, y: 250 },
  fish: { x: 700, y: 250 },
};

function drawStarter() {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "black";
  ctx.font = "40px 'Jersey 10'";
  ctx.fillText("Choose your pet!", 370, 600);

  for (const [animal, sprite] of Object.entries(starterSprites)) {
    sprite.timer++;
    if (sprite.timer >= FRAME_SPEED) {
      sprite.timer = 0;
      sprite.current = (sprite.current + 1) % sprite.frames.length;
    }

    const frame = sprite.frames[sprite.current].frame;
    const pos = STARTER_POSITIONS[animal];

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x - 20, pos.y - 20, SPRITE_SIZE + 40, SPRITE_SIZE + 60);

    ctx.drawImage(sprite.img, frame.x, frame.y, frame.w, frame.h, pos.x, pos.y, SPRITE_SIZE, SPRITE_SIZE);
  }
}

canvas.addEventListener("click", (e) => {
  if (window.mode !== "starter") return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  console.log("clicked at:", mouseX, mouseY);

  const animals = ["cat", "dog", "fish"];
  for (const animal of animals) {
    const pos = STARTER_POSITIONS[animal];
    console.log(`checking ${animal}: x ${pos.x - 20} to ${pos.x + SPRITE_SIZE + 20}, y ${pos.y - 20} to ${pos.y + SPRITE_SIZE + 40}`);
    if (mouseX >= pos.x - 20 && mouseX <= pos.x + SPRITE_SIZE + 20 &&
        mouseY >= pos.y - 20 && mouseY <= pos.y + SPRITE_SIZE + 40) {
      console.log("picked:", animal);
      pickStarterPet(animal);
      return;
    }
  }
});

// MOVEMENT
function applyMovement() {
  let moved = false;
  if (keys['ArrowLeft'])  { x = Math.max(0, x - SPEED); facing = "left";  moved = true; }
  if (keys['ArrowRight']) { x = Math.min(W - SIZE, x + SPEED); facing = "right"; moved = true; }
  if (keys['ArrowUp'])    { y = Math.max(0, y - SPEED); facing = "up";    moved = true; }
  if (keys['ArrowDown'])  { y = Math.min(H - SIZE, y + SPEED); facing = "down";  moved = true; }
  if (!moved) facing = "idle";
  return moved;
}

function drawPlayer(moving) {
  const sprite = sprites[facing] || sprites["idle"];
  if (!sprite) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, SIZE, SIZE);
    return;
  }

  sprite.timer++;
  if (sprite.timer >= FRAME_SPEED) {
    sprite.timer = 0;
    sprite.current = (sprite.current + 1) % sprite.frames.length;
  }

  const frame = sprite.frames[sprite.current].frame;
  ctx.drawImage(sprite.img, frame.x, frame.y, frame.w, frame.h, x, y, currentPet.size, currentPet.size);
}

// BACKGROUNDS
const homeBg = new Image();
homeBg.src = "sprite/visuals/cute-room.svg";

const gameBg = new Image();
gameBg.src = "sprite/visuals/game-bg.svg";

// MAIN DRAW LOOP
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (window.mode === "starter")   drawStarter();
  if (window.mode === "home")      drawHome();
  if (window.mode === "inventory") drawInventory();
  if (window.mode === "shop")      drawShop();
  if (window.mode === "game")      drawGame();

  requestAnimationFrame(draw);
}

// SCREENS
function drawHome() {
  ctx.drawImage(homeBg, 0, 0, W + 1, H + 1);
  const moved = applyMovement();
  drawPlayer(moved);
}

function drawInventory() {
  ctx.fillText("INVENTORY", 400, 350);
}

function drawShop() {
  ctx.fillText("SHOP", 430, 350);
}


function drawGame() {
  ctx.drawImage(gameBg, 0, 0, W + 1, H + 1);
  let moved = false;
  if (!gameOver) moved = applyMovement();
  drawPlayer(moved);
  drawGameUI();
  if (gameStarted) checkWin();
}

// BUTTONS
document.getElementById("homeBtn").onclick = () => { window.mode = "home"; };
document.getElementById("inventoryBtn").onclick = () => { window.mode = "inventory"; };
document.getElementById("shopBtn").onclick = () => { window.mode = "shop"; };
document.getElementById("gameBtn").onclick = () => {
  loseHunger(2); // lose 2 hunger every time a game is started
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

loadStarterSprites().then(() => draw());