const sprites = {};

async function loadSprite(direction, jsonPath, imgPath) {
  const res = await fetch(jsonPath);
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
}

async function loadAllSprites() {
  const { folder, files } = currentPet;
  await Promise.all(
    Object.entries(files).map(([direction, filename]) =>
      loadSprite(direction, `${folder}${filename}.json`, `${folder}${filename}.png`)
    )
  );
  draw();
}

// general object for every pet
const stages = ["egg", "level1", "level2", "level3"];
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


//on start to pick an animal
function pickStarterPet(animal) {
  currentAnimal = animal;
  currentStage  = "egg";
  currentPet    = petData[currentAnimal][currentStage];
  loadAllSprites().then(() => {
    window.mode = "home";
  });
}


function pickStarterPet(animal) {
  currentAnimal = animal;
  currentStage  = "egg";
  currentPet    = petData[currentAnimal][currentStage];
  loadAllSprites().then(() => {
    window.mode = "home";
  });
}

// ← ADD THE LEVEL SYSTEM RIGHT HERE

let petXP = 0;
let petLevel = 0;

const XP_THRESHOLDS = [0, 100, 300, 600];
const STAGE_FOR_LEVEL = ["egg", "level1", "level2", "level3"];

function addXP(amount) {
  petXP += amount;
  checkEvolution();
}

function checkEvolution() {
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
  currentStage = newStage;
  currentPet = petData[currentAnimal][currentStage];
  loadAllSprites();
  console.log(`Evolved to ${newStage}!`);
}

