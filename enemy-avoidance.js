//riley
// I created a simple movement function in the canvas.js file, you can use that to help make sure the game works. 
// tasks:
// create around 5 enemys that spawn randomly on screen and follow the character around after a 3 second count down. the user should not be able to move during these three seconds.
//the entities should follow no faster than the user, and should be just a tad bit slower. 
//the game itself should have ten second to play. If they user dies within those ten seconds, a pop up should appear on death saying they lost with a home button
// if the user survives the ten seconds, create a pop up that says they won, along with two strings that say how many coins and exp they earned, you can leave these as blank for now 
// and should follow the format of <coins: {$earnedCurrency}> so we can randomize the amount they earn each time
// you should also make a pop up that explains the game in bullet points, with a play button to start the game

//work together to make the game button randomly choose between your games, this may be an array that holds each file? and then hitting the button chooses a 
// number between one and two to select which game will play.

// Remember that when the game started and ends, the game/canvas needs to be cleared and go back to the home page of the canvas



let eaActive = false;
let eaOver = false;
let eaCountdown = 3;        // 3-second countdown before game starts
let eaSurviveTimer = 10;    // 10 seconds to survive
let eaCountdownInterval = null;
let eaTimerInterval = null;
let eaMoveLocked = true;    // player can't move during countdown

// - ENEMIES -
const ENEMY_COUNT = 5;
const ENEMY_SIZE = 40;
const ENEMY_SPEED = 0.82; // slightly slower than player SPEED (1)

let enemies = [];

function spawnEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        let ex, ey;
        // keep enemies away from player start (center)
        do {
            ex = Math.random() * (W - ENEMY_SIZE);
            ey = Math.random() * (H - ENEMY_SIZE);
        } while (Math.abs(ex - x) < 150 && Math.abs(ey - y) < 150);

        enemies.push({ x: ex, y: ey });
    }
}

// - START -
function startEnemyAvoidance() {
    // reset everything
    eaActive = true;
    eaOver = false;
    eaCountdown = 3;
    eaSurviveTimer = 10;
    eaMoveLocked = true;

    // reset player to center
    x = (W - SIZE) / 2;
    y = (H - SIZE) / 2;

    spawnEnemies();

    // 3-second countdown, then unlock movement and start survival timer
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

// -- UPDATE --
function updateEnemies() {
    if (!eaActive || eaOver || eaMoveLocked) return;

    for (const e of enemies) {
        const dx = x - e.x;
        const dy = y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            e.x += (dx / dist) * ENEMY_SPEED;
            e.y += (dy / dist) * ENEMY_SPEED;
        }

        // collision check (AABB)
        if (
            x < e.x + ENEMY_SIZE &&
            x + SIZE > e.x &&
            y < e.y + ENEMY_SIZE &&
            y + SIZE > e.y
        ) {
            eaLose();
            return;
        }
    }
}

// -- DRAW --
function drawEnemyAvoidance() {
    // background — reuse game bg from canvas.js
    ctx.drawImage(gameBg, 0, 0, W + 1, H + 1);

    // move player (only if not locked and game not over)
    if (!eaMoveLocked && !eaOver) {
        if (keys['ArrowLeft']) x = Math.max(0, x - SPEED);
        if (keys['ArrowRight']) x = Math.min(W - SIZE, x + SPEED);
        if (keys['ArrowUp']) y = Math.max(0, y - SPEED);
        if (keys['ArrowDown']) y = Math.min(H - SIZE, y + SPEED);
    }

    updateEnemies();

    // draw enemies (red squares)
    ctx.fillStyle = "#cc2222";
    for (const e of enemies) {
        ctx.fillRect(e.x, e.y, ENEMY_SIZE, ENEMY_SIZE);
        // little eye detail
        ctx.fillStyle = "white";
        ctx.fillRect(e.x + 8, e.y + 10, 8, 8);
        ctx.fillRect(e.x + 24, e.y + 10, 8, 8);
        ctx.fillStyle = "black";
        ctx.fillRect(e.x + 11, e.y + 13, 4, 4);
        ctx.fillRect(e.x + 27, e.y + 13, 4, 4);
        ctx.fillStyle = "#cc2222"; // reset for next enemy
    }

    // draw player (black square)
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, SIZE, SIZE);

    //-- HUD --
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(10, 10, 200, 60);

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

// -- WIN / LOSE --
function eaWin() {
    eaOver = true;

    // randomize rewards
    const coins = Math.floor(Math.random() * 51) + 20;  // 20–70
    const exp = Math.floor(Math.random() * 31) + 10;  // 10–40

    const popup = document.getElementById("eaEndPopup");
    document.getElementById("eaEndText").innerText = "You Survived! 🎉";
    document.getElementById("eaRewards").innerText =
        `coins: $${coins}   exp: ${exp}`;
    popup.classList.remove("hidden");
}

function eaLose() {
    if (eaOver) return;
    eaOver = true;
    clearInterval(eaTimerInterval);
    clearInterval(eaCountdownInterval);

    const popup = document.getElementById("eaEndPopup");
    document.getElementById("eaEndText").innerText = "You were caught! 💀";
    document.getElementById("eaRewards").innerText = "";
    popup.classList.remove("hidden");
}

// -- RESET --
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
