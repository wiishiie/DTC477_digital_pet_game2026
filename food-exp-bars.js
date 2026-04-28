const XP_PER_LEVEL = 300;
let totalXp = 0;
let displayXp = 0;
let totalCoins = 0;
 
const MAX_HUNGER = 7;
let hunger = MAX_HUNGER; // 7 = full, 0 = empty
 
/* ── Inject XP bar + hunger bar into the page ── */
document.body.insertAdjacentHTML("beforeend", `
  <div class="xp-bar">
    <div class="xp-level-chip">
      <span class="xp-lvl-word">LVL</span>
      <span class="xp-lvl-num" id="xpLevelNum">1</span>
    </div>
    <div class="xp-track">
      <div class="xp-fill" id="xpFill">
        <div class="xp-highlight"></div>
        <div class="xp-shine"></div>
      </div>
      <div class="xp-tick" style="left:25%"></div>
      <div class="xp-tick" style="left:50%"></div>
      <div class="xp-tick" style="left:75%"></div>
    </div>
  </div>
 
  <div class="hunger-bar">
    <div class="hunger-chip">
      <span class="hunger-label">HNG</span>
    </div>
    <div class="hunger-slots" id="hungerSlots"></div>
  </div>
 
  <div id="hungerGameOver" class="popup hidden">
    <div class="popup-box">
      <p style="font-size:20px; margin-bottom:8px;"> Your pet starved!</p>
      <p style="font-size:14px; margin-bottom:14px; color:#555;">Feed your pet to keep it alive.</p>
      <button id="hungerRestartBtn">Restart</button>
    </div>
  </div>
`);
 
const fillEl  = document.getElementById("xpFill");
const levelEl = document.getElementById("xpLevelNum");
const slotsEl = document.getElementById("hungerSlots");
 
/* ── Build the 7 hunger slots ── */
for (let i = 0; i < MAX_HUNGER; i++) {
  const slot = document.createElement("div");
  slot.className = "hunger-slot full";
  slot.dataset.index = i;
  slotsEl.appendChild(slot);
}
 
function updateHungerDisplay() {
  slotsEl.querySelectorAll(".hunger-slot").forEach((slot, i) => {
    slot.classList.toggle("full",  i < hunger);
    slot.classList.toggle("empty", i >= hunger);
  });
}
 
/* ── Trigger game over when hunger hits 0 ── */
function checkHungerGameOver() {
  if (hunger <= 0) {
    document.getElementById("hungerGameOver").classList.remove("hidden");
    // freeze the game
    window.mode = "dead";
  }
}
 
/* ── Restart button — resets everything ── */
document.getElementById("hungerRestartBtn").onclick = () => {
  // reset hunger
  hunger = MAX_HUNGER;
  updateHungerDisplay();
 
  // reset XP and coins
  totalXp    = 0;
  displayXp  = 0;
  totalCoins = 0;

  // reset flowers and refresh UI
  window.flowers = 0;
  if (typeof updateCurrencyUI === "function") updateCurrencyUI();
 
  // hide the game over popup
  document.getElementById("hungerGameOver").classList.add("hidden");
 
  // send player back to the starter/pet selection screen
  window.mode = "starter";
};
 
/* ── Call this when a mini-game starts — removes 2 hunger ── */
function loseHunger(amount = 2) {
  hunger = Math.max(0, hunger - amount);
  updateHungerDisplay();
  checkHungerGameOver();
}
 
/* ── Smooth XP animation loop ── */
function animateBar() {
  const diff = totalXp - displayXp;
  displayXp = Math.abs(diff) > 0.5 ? displayXp + diff * 0.07 : totalXp;
 
  fillEl.style.width  = (getXpInLevel(displayXp) / XP_PER_LEVEL) * 100 + "%";
  levelEl.textContent = Math.floor(displayXp / XP_PER_LEVEL) + 1;
 
  requestAnimationFrame(animateBar);
}
 
function getXpInLevel(xp) { return xp % XP_PER_LEVEL; }
 
animateBar();
 
/* ── Award XP (called from mini-game win) ── */
function addXP(xpAmount) {
  totalXp += xpAmount;
 
  fillEl.classList.remove("bump");
  void fillEl.offsetWidth;
  fillEl.classList.add("bump");
  setTimeout(() => fillEl.classList.remove("bump"), 350);
 
  const floater = document.createElement("span");
  floater.className   = "xp-floater";
  floater.textContent = "+" + xpAmount + " XP";
  document.querySelector(".xp-bar").appendChild(floater);
  setTimeout(() => floater.remove(), 1300);
}