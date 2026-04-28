// ============================================================
// inventory.js — Riley
// Renders the inventory screen onto the game canvas.
// Mirrors the shop's canvas-drawing style exactly.
//
// INVENTORY_ITEMS  : master list of every food item + hunger value
// playerInventory  : { [itemName]: count }  — tracks owned quantities
// giveInventoryItem(name, qty) : call from shop purchase to add items
// drawInventory()  : called by canvas.js draw loop when mode === "inventory"
// ============================================================


// ── Master item catalogue (same items as shop) ──────────────────────────────
const INVENTORY_ITEMS = [
  { name: "Cupcake", img: "sprite/visuals/cupcake.svg",   hunger: 2 },
  { name: "Pancake", img: "sprite/visuals/pancake.svg",   hunger: 4 },
  { name: "Sushi",   img: "sprite/visuals/sushi.svg",     hunger: 6 },
];

// ── Player's owned quantities ────────────────────────────────────────────────
// Initialise every item at 0. The shop (canvas.js) calls
// giveInventoryItem() after a successful purchase.
const playerInventory = {};
for (const item of INVENTORY_ITEMS) {
  playerInventory[item.name] = 0;
}

// Pre-load item images (reuse shopImgs if already loaded, otherwise new Image)
const inventoryImgs = {};
for (const item of INVENTORY_ITEMS) {
  const img = new Image();
  img.src = item.img;
  inventoryImgs[item.name] = img;
}

// Feed icon — small fork-and-knife or "feed" visual shown on each card badge
const feedIcon = new Image();
feedIcon.src = "sprite/visuals/flower.svg";   


/**
 * Add `qty` of `itemName` to the player's inventory.
 * Call this from canvas.js after a successful shop purchase.
 * @param {string} itemName  - must match a name in INVENTORY_ITEMS
 * @param {number} qty       - how many to add (default 1)
 */
function giveInventoryItem(itemName, qty = 1) {
  if (playerInventory[itemName] !== undefined) {
    playerInventory[itemName] += qty;
  }
}

// ── Feedback toast (mirrors shop feedback) ──
let invFeedbackMsg   = "";
let invFeedbackTimer = 0;

function showInvFeedback(msg) {
  invFeedbackMsg   = msg;
  invFeedbackTimer = 120;
}

// ── Hover / cursor tracking ─────
// inventoryHoverIndex stores which card (0-based) the mouse is over, or -1.
// Updated by the mousemove listener added at the bottom of this file.
let inventoryHoverIndex = -1;

// ── Layout constants (matching shop proportions) ───────
const INV_CARD_W   = 220;
const INV_CARD_H   = 310;   // slightly taller to fit quantity badge
const INV_CARD_GAP = 40;
const INV_CARD_Y   = 190;   // vertical start of cards

function getInvStartX() {
  return (W - (INVENTORY_ITEMS.length * INV_CARD_W + (INVENTORY_ITEMS.length - 1) * INV_CARD_GAP)) / 2;
}

// ── Main draw function ─────
function drawInventory() {

  // ── Background: same pastel pink gradient as shop ──
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#ffd6e7");
  grad.addColorStop(1, "#fff0f6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Sparkle decorations ──
  ctx.fillStyle = "#ffb3d1";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  const sparkles = [
    {x:80,y:80},{x:920,y:60},{x:150,y:550},
    {x:850,y:500},{x:500,y:60},{x:70,y:350},
    {x:940,y:300},{x:300,y:620},{x:700,y:630}
  ];
  for (const s of sparkles) ctx.fillText("✦", s.x, s.y);

  // ── Title box ──
  ctx.fillStyle   = "#ff85b3";
  ctx.strokeStyle = "#c45878";
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 200, 30, 400, 80, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font      = "bold 52px 'Jersey 10'";
  ctx.textAlign = "center";
  ctx.fillText("✦ BAG ✦", W / 2, 88);

  // ── Subtitle / instruction ──
  ctx.fillStyle = "#c45878";
  ctx.font      = "28px 'Jersey 10'";
  ctx.textAlign = "center";
  ctx.fillText("click a food to feed your pet", W / 2, 148);

  // ── Flower balance badge (top-right, same as shop) ──
  const badgeW = 220, badgeH = 64;
  const badgeX = W - badgeW - 20, badgeY = 14;

  ctx.fillStyle   = "#fef08a";
  ctx.strokeStyle = "#c8860a";
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.drawImage(feedIcon, badgeX + 10, badgeY + 7, 50, 50);
  ctx.fillStyle = "#3d2b1a";
  ctx.font      = "44px 'Jersey 10'";
  ctx.textAlign = "left";
  ctx.fillText(window.flowers, badgeX + 68, badgeY + 44);

  // ── Item cards ──
  const startX = getInvStartX();

  for (let i = 0; i < INVENTORY_ITEMS.length; i++) {
    const item  = INVENTORY_ITEMS[i];
    const count = playerInventory[item.name];
    const cx    = startX + i * (INV_CARD_W + INV_CARD_GAP);
    const cy    = INV_CARD_Y;

    const isHovered  = (i === inventoryHoverIndex);
    const isDisabled = (count <= 0);

    // card lift on hover
    const cardDrawY = isHovered && !isDisabled ? cy - 6 : cy;

    // ── Card shadow ──
    ctx.fillStyle = "rgba(196, 88, 120, 0.15)";
    ctx.beginPath();
    ctx.roundRect(cx + 6, cardDrawY + 6, INV_CARD_W, INV_CARD_H, 12);
    ctx.fill();

    // ── Card body ──
    ctx.fillStyle   = isDisabled ? "#e8e0e4" : "#fff8f0";
    ctx.strokeStyle = isDisabled ? "#bba8b0" : "#c45878";
    ctx.lineWidth   = 4;
    ctx.beginPath();
    ctx.roundRect(cx, cardDrawY, INV_CARD_W, INV_CARD_H, 12);
    ctx.fill();
    ctx.stroke();

    // ── Food image (greyed out if empty) ──
    ctx.globalAlpha = isDisabled ? 0.35 : 1;
    ctx.drawImage(inventoryImgs[item.name], cx + 30, cardDrawY + 20, 160, 160);
    ctx.globalAlpha = 1;

    // ── Item name ──
    ctx.fillStyle = isDisabled ? "#9e8a92" : "#3d2b1a";
    ctx.font      = "bold 26px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(item.name, cx + INV_CARD_W / 2, cardDrawY + 208);

    // ── Quantity badge (top-right corner of card) ──
    // White pill with a small feed-fork icon + number
    const qBadgeW = 72, qBadgeH = 36;
    const qBadgeX = cx + INV_CARD_W - qBadgeW - 8;
    const qBadgeY = cardDrawY + 8;

    ctx.fillStyle   = isDisabled ? "#c9b8bf" : "#ff85b3";
    ctx.strokeStyle = isDisabled ? "#9e8a92" : "#c45878";
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.roundRect(qBadgeX, qBadgeY, qBadgeW, qBadgeH, 10);
    ctx.fill();
    ctx.stroke();

    // fork icon inside quantity badge
    ctx.drawImage(feedIcon, qBadgeX + 4, qBadgeY + 3, 28, 28);

    ctx.fillStyle = "white";
    ctx.font      = "bold 22px 'Jersey 10'";
    ctx.textAlign = "left";
    ctx.fillText(`x${count}`, qBadgeX + 34, qBadgeY + 26);

    // ── Hunger value badge (bottom of card, same style as cost badge in shop) ──
    const hBadgeX = cx + 20;
    const hBadgeY = cardDrawY + INV_CARD_H - 68;
    const hBadgeW = INV_CARD_W - 40;
    const hBadgeH = 48;

    ctx.fillStyle   = isDisabled ? "#d4c8cc" : "#f5dc91";
    ctx.strokeStyle = isDisabled ? "#9e8a92" : "#c8860a";
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.roundRect(hBadgeX, hBadgeY, hBadgeW, hBadgeH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDisabled ? "#9e8a92" : "#3d2b1a";
    ctx.font      = "26px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.fillText(`+${item.hunger} hunger`, cx + INV_CARD_W / 2, hBadgeY + 32);

    // ── "Empty" label overlay when count is 0 ──
    if (isDisabled) {
      ctx.fillStyle = "rgba(100,80,90,0.55)";
      ctx.beginPath();
      ctx.roundRect(cx, cardDrawY, INV_CARD_W, INV_CARD_H, 12);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font      = "bold 30px 'Jersey 10'";
      ctx.textAlign = "center";
      ctx.fillText("EMPTY", cx + INV_CARD_W / 2, cardDrawY + INV_CARD_H / 2 + 10);
    }
  }

  // ── Feedback toast ──
  if (invFeedbackTimer > 0) {
    ctx.globalAlpha = Math.min(1, invFeedbackTimer / 30);
    ctx.fillStyle   = "#3d2b1a";
    ctx.font        = "bold 40px 'Jersey 10'";
    ctx.textAlign   = "center";
    ctx.fillText(invFeedbackMsg, W / 2, H - 40);
    ctx.globalAlpha = 1;
    invFeedbackTimer--;
  }

  ctx.textAlign = "left";
}

// ── Click handler: feed the pet ───────────
// Appended to canvas so it fires alongside the existing click listener.
canvas.addEventListener("click", (e) => {
  if (window.mode !== "inventory") return;

  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top)  * scaleY;

  const startX = getInvStartX();

  for (let i = 0; i < INVENTORY_ITEMS.length; i++) {
    const item = INVENTORY_ITEMS[i];
    const cx   = startX + i * (INV_CARD_W + INV_CARD_GAP);

    if (mouseX >= cx && mouseX <= cx + INV_CARD_W &&
        mouseY >= INV_CARD_Y && mouseY <= INV_CARD_Y + INV_CARD_H) {

      if (playerInventory[item.name] <= 0) {
        showInvFeedback(`No ${item.name}s left! Buy some in the shop. 🛒`);
        return;
      }

      // consume item, restore hunger
      playerInventory[item.name]--;
      addHunger(item.hunger);
      showInvFeedback(`Fed your pet a ${item.name}! +${item.hunger} hunger 🍽️`);
      return;
    }
  }
});

// ── Hover / cursor tracking ──────────
canvas.addEventListener("mousemove", (e) => {
  if (window.mode !== "inventory") {
    if (inventoryHoverIndex !== -1) inventoryHoverIndex = -1;
    return;
  }

  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top)  * scaleY;

  const startX = getInvStartX();
  let found = -1;

  for (let i = 0; i < INVENTORY_ITEMS.length; i++) {
    const cx = startX + i * (INV_CARD_W + INV_CARD_GAP);
    if (mouseX >= cx && mouseX <= cx + INV_CARD_W &&
        mouseY >= INV_CARD_Y && mouseY <= INV_CARD_Y + INV_CARD_H) {
      found = i;
      break;
    }
  }

  inventoryHoverIndex = found;
  canvas.style.cursor = (found !== -1 && playerInventory[INVENTORY_ITEMS[found].name] > 0)
    ? "pointer"
    : "default";
});