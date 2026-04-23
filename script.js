// --- CURRENCY ---
window.flowers = 0;

function updateCurrencyUI() {
  const el = document.getElementById("currency");
  if (el) el.textContent = window.flowers;
}

// --- HUNGER (delegates to food-exp-bars.js) ---
function addHunger(amount) {
  hunger = Math.min(MAX_HUNGER, hunger + amount);
  if (typeof updateHungerDisplay === "function") updateHungerDisplay();
}