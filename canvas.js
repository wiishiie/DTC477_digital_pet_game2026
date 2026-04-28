const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const FRAME_SPEED = 80;
const SPRITE_SIZE = 180;

const W = 1000, H = 700, SIZE = 50, SPEED = 1.5;
let x = (W - SIZE) / 4;
let y = (H - SIZE) / 4;
let facing = "idle";

const keys = {};
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
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
    if (activeGame === "rlgl" && window.mode === "game" && gameStarted && light === "red" && !gameOver) {
      loseGame("You moved on RED!");
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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
    const imgPath = `sprite/${animal}/egg/egg-${animal}-idle.png`;

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
  cat: { x: 100, y: 250 },
  dog: { x: 400, y: 250 },
  fish: { x: 700, y: 250 },
};

function drawStarter() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#ffd6e7");
  grad.addColorStop(1, "#fff0f6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const stars = [
    { x: 80, y: 80 }, { x: 920, y: 60 }, { x: 150, y: 550 },
    { x: 850, y: 500 }, { x: 500, y: 60 }, { x: 70, y: 350 },
    { x: 940, y: 300 }, { x: 300, y: 620 }, { x: 700, y: 630 }
  ];
  ctx.fillStyle = "#ffb3d1";
  for (const s of stars) {
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✦", s.x, s.y);
  }

  ctx.fillStyle = "#ff85b3";
  ctx.strokeStyle = "#c45878";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 260, 30, 520, 80, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 52px 'Jersey 10'";
  ctx.textAlign = "center";
  ctx.fillText("✦ Choose Your Pet! ✦", W / 2, 88);

  ctx.fillStyle = "#c45878";
  ctx.font = "30px 'Jersey 10'";
  ctx.fillText("pick your companion to start your journey", W / 2, 145);

  const petNames = { cat: "Cat", dog: "Dog", fish: "Fish" };

  for (const [animal, sprite] of Object.entries(starterSprites)) {
    sprite.timer++;
    if (sprite.timer >= FRAME_SPEED) {
      sprite.timer = 0;
      sprite.current = (sprite.current + 1) % sprite.frames.length;
    }

    const frame = sprite.frames[sprite.current].frame;
    const pos = STARTER_POSITIONS[animal];

    ctx.fillStyle = "rgba(196, 88, 120, 0.15)";
    ctx.beginPath();
    ctx.roundRect(pos.x - 20 + 6, pos.y - 20 + 6, SPRITE_SIZE + 40, SPRITE_SIZE + 80, 16);
    ctx.fill();

    ctx.fillStyle = "#fff0f6";
    ctx.strokeStyle = "#f0a8bc";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pos.x - 20, pos.y - 20, SPRITE_SIZE + 40, SPRITE_SIZE + 80, 16);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(sprite.img, frame.x, frame.y, frame.w, frame.h, pos.x, pos.y, SPRITE_SIZE, SPRITE_SIZE);

    ctx.fillStyle = "#ff85b3";
    ctx.strokeStyle = "#c45878";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(pos.x - 10, pos.y + SPRITE_SIZE + 10, SPRITE_SIZE + 20, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 26px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(petNames[animal], pos.x + SPRITE_SIZE / 2, pos.y + SPRITE_SIZE + 34);
  }

  ctx.textAlign = "left";
}

canvas.addEventListener("click", (e) => {
  if (window.mode === "starter") {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const animals = ["cat", "dog", "fish"];
    for (const animal of animals) {
      const pos = STARTER_POSITIONS[animal];
      if (mouseX >= pos.x - 20 && mouseX <= pos.x + SPRITE_SIZE + 20 &&
        mouseY >= pos.y - 20 && mouseY <= pos.y + SPRITE_SIZE + 40) {
        pickStarterPet(animal);
        return;
      }
    }
    return;
  }

  if (window.mode === "shop") {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardW = 220;
    const cardH = 300;
    const startX = (W - (SHOP_ITEMS.length * cardW + (SHOP_ITEMS.length - 1) * 40)) / 2;
    const cardY = 150;

    for (let i = 0; i < SHOP_ITEMS.length; i++) {
      const item = SHOP_ITEMS[i];
      const cx = startX + i * (cardW + 40);

      if (mouseX >= cx && mouseX <= cx + cardW &&
        mouseY >= cardY && mouseY <= cardY + cardH) {

        if (window.flowers >= item.cost) {
          window.flowers -= item.cost;
          updateCurrencyUI();
          giveInventoryItem(item.name, 1);
          showShopFeedback(`Bought ${item.name}! Added to bag 🎒`);
        } else {
          showShopFeedback("Not enough flowers! 🌸");
        }
        return;
      }
    }
  }
});

// MOVEMENT
function applyMovement() {
  const petSize = currentPet ? currentPet.size : SIZE;
  let moved = false;
  if (keys['ArrowLeft'])  { x = Math.max(0, x - SPEED); facing = "left";  moved = true; }
  if (keys['ArrowRight']) { x = Math.min(W - petSize, x + SPEED); facing = "right"; moved = true; }
  if (keys['ArrowUp'])    { y = Math.max(0, y - SPEED); facing = "up";    moved = true; }
  if (keys['ArrowDown'])  { y = Math.min(H - petSize, y + SPEED); facing = "down";  moved = true; }
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

// --- SHOP ---
const SHOP_ITEMS = [
  { name: "Cupcake", img: "sprite/visuals/cupcake.svg", cost: 40, hunger: 2 },
  { name: "Pancake", img: "sprite/visuals/pancake.svg", cost: 100, hunger: 4 },
  { name: "Sushi", img: "sprite/visuals/sushi.svg", cost: 200, hunger: 6 },
];

const shopImgs = {};
for (const item of SHOP_ITEMS) {
  const img = new Image();
  img.src = item.img;
  shopImgs[item.name] = img;
}

const flowerIconShop = new Image();
flowerIconShop.src = "sprite/visuals/flower.svg";

let shopFeedbackMsg = "";
let shopFeedbackTimer = 0;

function showShopFeedback(msg) {
  shopFeedbackMsg = msg;
  shopFeedbackTimer = 120;
}

// MAIN DRAW LOOP
function draw() {
  ctx.clearRect(0, 0, W, H);

  if (window.mode === "starter") drawStarter();
  if (window.mode === "home") drawHome();
  if (window.mode === "inventory") drawInventory();
  if (window.mode === "shop") drawShop();
  if (window.mode === "game") drawGame();

  requestAnimationFrame(draw);
}

// SCREENS
function drawHome() {
  ctx.drawImage(homeBg, 0, 0, W + 1, H + 1);
  const moved = applyMovement();
  drawPlayer(moved);
}

function drawInventory() {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#3d2b1a";
  ctx.font = "48px 'Jersey 10'";
  ctx.textAlign = "center";
  ctx.fillText("INVENTORY", W / 2, 350);
  ctx.textAlign = "left";
}

function drawShop() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#ffd6e7");
  grad.addColorStop(1, "#fff0f6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffb3d1";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  const sparkles = [
    { x: 80, y: 80 }, { x: 920, y: 60 }, { x: 150, y: 550 },
    { x: 850, y: 500 }, { x: 500, y: 60 }, { x: 70, y: 350 },
    { x: 940, y: 300 }, { x: 300, y: 620 }, { x: 700, y: 630 }
  ];
  for (const s of sparkles) {
    ctx.fillText("✦", s.x, s.y);
  }

  ctx.fillStyle = "#ff85b3";
  ctx.strokeStyle = "#c45878";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 160, 30, 320, 80, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 52px 'Jersey 10'";
  ctx.textAlign = "center";
  ctx.fillText("✦ SHOP ✦", W / 2, 88);

  const badgeW = 220;
  const badgeH = 64;
  const badgeX = W - badgeW - 20;
  const badgeY = 14;

  ctx.fillStyle = "#fef08a";
  ctx.strokeStyle = "#c8860a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.drawImage(flowerIconShop, badgeX + 10, badgeY + 7, 50, 50);
  ctx.fillStyle = "#3d2b1a";
  ctx.font = "44px 'Jersey 10'";
  ctx.textAlign = "left";
  ctx.fillText(window.flowers, badgeX + 68, badgeY + 44);

  const cardW = 220;
  const cardH = 300;
  const startX = (W - (SHOP_ITEMS.length * cardW + (SHOP_ITEMS.length - 1) * 40)) / 2;
  const cardY = 200;

  for (let i = 0; i < SHOP_ITEMS.length; i++) {
    const item = SHOP_ITEMS[i];
    const cx = startX + i * (cardW + 40);

    ctx.fillStyle = "#fff8f0";
    ctx.strokeStyle = "#c45878";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(shopImgs[item.name], cx + 30, cardY + 20, 160, 160);

    ctx.fillStyle = "#3d2b1a";
    ctx.font = "bold 26px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(item.name, cx + cardW / 2, cardY + 205);

    const badgeX = cx + 20;
    const badgeY = cardY + 220;
    const badgeW = cardW - 40;
    const badgeH = 48;

    ctx.fillStyle = "#f5dc91";
    ctx.strokeStyle = "#c8860a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fill();
    ctx.stroke();

    const totalContentW = 36 + 8 + ctx.measureText(`${item.cost}`).width;
    const contentStartX = badgeX + (badgeW - totalContentW) / 2;

    ctx.drawImage(flowerIconShop, contentStartX, badgeY + 4, 44, 44);
    ctx.fillStyle = "#3d2b1a";
    ctx.font = "28px 'Jersey 10'";
    ctx.textAlign = "left";
    ctx.fillText(`${item.cost}`, contentStartX + 44, badgeY + 32);

    ctx.fillStyle = "#c45878";
    ctx.font = "26px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(`+${item.hunger} hunger`, cx + cardW / 2, cardY + 290);
  }

  if (shopFeedbackTimer > 0) {
    ctx.globalAlpha = Math.min(1, shopFeedbackTimer / 30);
    ctx.fillStyle = "#3d2b1a";
    ctx.font = "bold 40px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(shopFeedbackMsg, W / 2, H - 40);
    ctx.globalAlpha = 1;
    shopFeedbackTimer--;
  }

  ctx.textAlign = "left";
}

function drawGame() {
  ctx.drawImage(gameBg, 0, 0, W + 1, H + 1);

  if (activeGame === "rlgl") {
    let moved = false;
    if (!gameOver) moved = applyMovement();
    drawPlayer(moved);
    drawGameUI();
    if (gameStarted) checkWin();
  }

  if (activeGame === "ea") {
    drawEnemyAvoidance();
  }
}

// BUTTONS
document.getElementById("homeBtn").onclick = () => { window.mode = "home"; };
document.getElementById("inventoryBtn").onclick = () => { window.mode = "inventory"; };
document.getElementById("shopBtn").onclick = () => { window.mode = "shop"; };
document.getElementById("gameBtn").onclick = () => {
  loseHunger(2);
  const pick = Math.random() < 0.5 ? "rlgl" : "ea";
  activeGame = pick;
  window.mode = "game";

  if (pick === "rlgl") {
    document.getElementById("startPopup").classList.remove("hidden");
  } else {
    document.getElementById("eaStartPopup").classList.remove("hidden");
  }
};

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

canvas.addEventListener("mousemove", (e) => {
  if (window.mode !== "shop") {
    canvas.style.cursor = "default";
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const cardW = 220;
  const cardH = 300;
  const startX = (W - (SHOP_ITEMS.length * cardW + (SHOP_ITEMS.length - 1) * 40)) / 2;
  const cardY = 200;

  let overCard = false;
  for (let i = 0; i < SHOP_ITEMS.length; i++) {
    const cx = startX + i * (cardW + 40);
    if (mouseX >= cx && mouseX <= cx + cardW &&
      mouseY >= cardY && mouseY <= cardY + cardH) {
      overCard = true;
      break;
    }
  }

  canvas.style.cursor = overCard ? "pointer" : "default";
});

canvas.addEventListener("mousemove", (e) => {
  if (window.mode !== "starter") return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const animals = ["cat", "dog", "fish"];
  let overCard = false;

  for (const animal of animals) {
    const pos = STARTER_POSITIONS[animal];
    if (mouseX >= pos.x - 20 && mouseX <= pos.x + SPRITE_SIZE + 20 &&
      mouseY >= pos.y - 20 && mouseY <= pos.y + SPRITE_SIZE + 60) {
      overCard = true;
      break;
    }
  }

  canvas.style.cursor = overCard ? "pointer" : "default";
});