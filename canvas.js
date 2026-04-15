const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');


// Movement 
const W = 1000, H = 700, SIZE = 64, SPEED = 4;
let x = (W - SIZE) / 2, y = (H - SIZE) / 2;
const keys = {};

document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

function draw() {
  if (keys['ArrowLeft'])  x = Math.max(0, x - SPEED);
  if (keys['ArrowRight']) x = Math.min(W - SIZE, x + SPEED);
  if (keys['ArrowUp'])    y = Math.max(0, y - SPEED);
  if (keys['ArrowDown'])  y = Math.min(H - SIZE, y + SPEED);

  ctx.clearRect(0, 0, W, H);
  ctx.fillRect(x, y, SIZE, SIZE);

  requestAnimationFrame(draw);
}

draw();
