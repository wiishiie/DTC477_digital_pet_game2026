let eaActive = false;
let eaOver = false;
let eaCountdown = 3;
let eaSurviveTimer = 7;
let eaCountdownInterval = null;
let eaTimerInterval = null;
let eaMoveLocked = true;

const ENEMY_COUNT = 5;
const ENEMY_SIZE = 100;
const ENEMY_SPEED = 0.50;

let enemies = [];

// -- ENEMY SPRITE --
let enemySprite = null;

async function loadEnemySprite() {
  try {
    const res = await fetch("sprite/enemy/enemy-egg.json");
    if (!res.ok) throw new Error("404: enemy-egg.json");
    const data = await res.json();

    const img = new Image();
    img.src = "sprite/enemy/enemy-egg.png";
    await new Promise(resolve => img.onload = resolve);

    enemySprite = {
      img,
      frames: Object.values(data.frames),
      current: 0,
      timer: 0,
    };
  } catch (e) {
    console.warn("Enemy sprite load failed:", e.message);
  }
}

loadEnemySprite();

function spawnEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        let ex, ey;
        do {
            ex = Math.random() * (W - ENEMY_SIZE);
            ey = Math.random() * (H - ENEMY_SIZE);
        } while (Math.abs(ex - x) < 150 || Math.abs(ey - y) < 150);
        enemies.push({ x: ex, y: ey });
    }
}

function startEnemyAvoidance() {
    eaActive = true;
    eaOver = false;
    eaCountdown = 3;
    eaSurviveTimer = 10;
    eaMoveLocked = true;

    x = (W - SIZE) / 2;
    y = (H - SIZE) / 2;

    spawnEnemies();

    eaCountdownInterval = setInterval(() => {
        eaCountdown--;
        if (eaCountdown <= 0) {
            clearInterval(eaCountdownInterval);
            eaMoveLocked = false;
            startEaSurviveTimer();
        }
    }, 1000);
}

function startEaSurviveTimer() {
    eaTimerInterval = setInterval(() => {
        if (eaOver) { clearInterval(eaTimerInterval); return; }
        eaSurviveTimer--;
        if (eaSurviveTimer <= 0) {
            clearInterval(eaTimerInterval);
            eaWin();
        }
    }, 1000);
}

function updateEnemies() {
    if (!eaActive || eaOver || eaMoveLocked) return;

    const petSize = currentPet ? currentPet.size : SIZE;

    for (const e of enemies) {
        const dx = x - e.x;
        const dy = y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            e.x += (dx / dist) * ENEMY_SPEED;
            e.y += (dy / dist) * ENEMY_SPEED;
        }

        const margin = 30;
        if (
            x + margin < e.x + ENEMY_SIZE - margin &&
            x + petSize - margin > e.x + margin &&
            y + margin < e.y + ENEMY_SIZE - margin &&
            y + petSize - margin > e.y + margin
        ) {
            eaLose();
            return;
        }
    }
}

function drawEnemyAvoidance() {
    ctx.drawImage(gameBg, 0, 0, W + 1, H + 1);

    // use petSize for movement boundaries
    const petSize = currentPet ? currentPet.size : SIZE;

    if (!eaMoveLocked && !eaOver) {
        if (keys['ArrowLeft'])  x = Math.max(0, x - SPEED);
        if (keys['ArrowRight']) x = Math.min(W - petSize, x + SPEED);
        if (keys['ArrowUp'])    y = Math.max(0, y - SPEED);
        if (keys['ArrowDown'])  y = Math.min(H - petSize, y + SPEED);
    }

    updateEnemies();

    // draw enemies using sprite
    for (const e of enemies) {
        if (enemySprite && enemySprite.frames.length > 0) {
            enemySprite.timer++;
            if (enemySprite.timer >= FRAME_SPEED) {
                enemySprite.timer = 0;
                enemySprite.current = (enemySprite.current + 1) % enemySprite.frames.length;
            }
            const frame = enemySprite.frames[enemySprite.current].frame;
            ctx.drawImage(enemySprite.img, frame.x, frame.y, frame.w, frame.h, e.x, e.y, ENEMY_SIZE, ENEMY_SIZE);
        } else {
            ctx.fillStyle = "#cc2222";
            ctx.fillRect(e.x, e.y, ENEMY_SIZE, ENEMY_SIZE);
        }
    }

    drawPlayer(false);

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(10, 10, 220, 60);
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";

    if (eaMoveLocked && eaCountdown > 0) {
        ctx.fillText(`Starting in: ${eaCountdown}`, 20, 40);
        ctx.font = "16px Arial";
        ctx.fillText("Get ready!", 20, 62);
    } else {
        ctx.fillText(`Time left: ${eaSurviveTimer}s`, 20, 40);
        ctx.font = "16px Arial";
        ctx.fillText("Survive the enemies!", 20, 62);
    }
}

function eaWin() {
    eaOver = true;

    const exp = Math.floor(Math.random() * 51) + 50;
    const earnedFlowers = Math.floor(Math.random() * 21) + 30;

    if (typeof window.flowers !== "number" || isNaN(window.flowers)) {
        window.flowers = 0;
    }

    window.flowers += earnedFlowers;
    updateCurrencyUI();

    document.getElementById("eaEndText").innerText = "You Survived! 🎉";
    document.getElementById("eaRewards").innerText =
        `🌸 +${earnedFlowers}   EXP: ${exp}`;

    document.getElementById("eaEndPopup").classList.remove("hidden");

    if (typeof addXP === "function") addXP(exp);
    if (typeof handlePetXP === "function") handlePetXP(exp);
}

function eaLose() {
    if (eaOver) return;
    eaOver = true;
    clearInterval(eaTimerInterval);
    clearInterval(eaCountdownInterval);

    document.getElementById("eaEndText").innerText = "You were caught! 💀";
    document.getElementById("eaRewards").innerText = "";
    document.getElementById("eaEndPopup").classList.remove("hidden");
}

function resetEnemyAvoidance() {
    eaActive = false;
    eaOver = false;
    eaCountdown = 3;
    eaSurviveTimer = 10;
    eaMoveLocked = true;
    enemies = [];
    clearInterval(eaTimerInterval);
    clearInterval(eaCountdownInterval);

    document.getElementById("eaEndPopup").classList.add("hidden");
    document.getElementById("eaStartPopup").classList.add("hidden");

    x = (W - SIZE) / 2;
    y = (H - SIZE) / 2;
}