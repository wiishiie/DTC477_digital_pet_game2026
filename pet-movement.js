const sprites = {};

async function loadSprite(direction, jsonPath, imgPath) {
  try {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error(`404: ${jsonPath}`);
    const data = await res.json();

    const img = new Image();
    img.src = imgPath;
    await new Promise(resolve => img.onload = resolve);

    sprites[direction] = {
      img,
      frames: Object.values(data.frames),
      current: 0,
      timer: 0,
    };
  } catch (e) {
    console.warn("Sprite load failed:", e.message);
  }
}

async function loadAllSprites() {
  if (!currentPet) return;
  const { folder, files } = currentPet;
  await Promise.all(
    Object.entries(files).map(([direction, filename]) =>
      loadSprite(direction, `${folder}${filename}.json`, `${folder}${filename}.png`)
    )
  );
  draw();
}

const stages = ["egg", "l1", "l2", "l3"];
const animals = ["dog", "cat", "fish"];
const petData = {};

let currentAnimal = null;
let currentStage  = null;
let currentPet    = null;

for (const animal of animals) {
  petData[animal] = {};

  for (const stage of stages) {
    petData[animal][stage] = {
      folder: `sprite/${animal}/${stage}/`,
      size: 150,
      files: {
        down:  `${stage}-${animal}-back`,
        up:    `${stage}-${animal}-forward`,
        left:  `${stage}-${animal}-left`,
        right: `${stage}-${animal}-right`,
        idle:  `${stage}-${animal}-idle`,
      }
    };
  }
}

function pickStarterPet(animal) {
  currentAnimal = animal;
  currentStage  = "egg";
  currentPet    = petData[currentAnimal][currentStage];
  loadAllSprites().then(() => {
    window.mode = "home";
  });
}

let petXP = 0;
let petLevel = 0;

const XP_THRESHOLDS = [0, 300, 600, 900]; 
const STAGE_FOR_LEVEL = ["egg", "l1", "l2", "l3"];

function handlePetXP(amount) {
  petXP += amount;
  checkEvolution();
}

function checkEvolution() {
  if (!currentPet) return;
  let newLevel = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (petXP >= XP_THRESHOLDS[i]) {
      newLevel = i;
      break;
    }
  }
  if (newLevel > petLevel) {
    petLevel = newLevel;
    evolve(STAGE_FOR_LEVEL[petLevel]);
  }
}

function evolve(newStage) {
  if (!currentAnimal) return;
  currentStage = newStage;
  currentPet = petData[currentAnimal][currentStage];
  if (!currentPet) {
    console.warn(`No pet data found for ${currentAnimal} / ${newStage}`);
    return;
  }
  loadAllSprites();
  console.log(`Evolved to ${newStage}!`);
}