// state of the game
let state = {};

const blastHoleRadius = 18;

// global variables for drag event handling
let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;

// global variable for animation loop event handling
let previousAnimationTimestamp = undefined;

// references to HTML elements

// canvas element and drawing context
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// angle and velocity fields

// left info panel
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");

// right info panel
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");

// bomb's grab area
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");

// Congratulations panel
const congratulationsDOM = document.getElementById("congratulations");
const winnerDOM = document.getElementById("winner");
const newGameButtonDOM = document.getElementById("new-game");

// Initial state

newGame();

function newGame() {
  // Initialize game state
  state = {
    scale: 1,
    phase: "aiming", // aiming | in flight | celebrating
    currentPlayer: 1,
    bomb: {
      x: undefined,
      y: undefined,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    },
    backgroundBuildings: generateBackgroundBuildings(),
    buildings: generateBuildings(),
    blastHoles: [],
  };

  calculateScale();

  initializeBombPosition();

  // reset HTML elements
  congratulationsDOM.style.visibility = "hidden";
  angle1DOM.innerText = 0;
  velocity1DOM.innerText = 0;
  angle2DOM.innerText = 0;
  velocity2DOM.innerText = 0;

  draw();
}

// Utility functions

function generateBackgroundBuildings() {
  const backgroundBuildings = [];
  for (let index = 0; index < 11; index++) {
    const previousBuilding = backgroundBuildings[index - 1];

    const x = previousBuilding
      ? previousBuilding.x + previousBuilding.width + 4
      : -30;
  
    const minWidth = 60;
    const maxWidth = 110;
    const width = minWidth + Math.random() * (maxWidth - minWidth);
  
    const minHeight = 80;
    const maxHeight = 350;
    const height = minHeight + Math.random() * (maxHeight - minHeight);
  
    backgroundBuildings.push({ x, width, height });  
  }
  return backgroundBuildings;
}

function generateBuildings() {
  const buildings = [];
  for (let index = 0; index <= 8; index++) {
    const previousBuilding = buildings[index - 1];

    const x = previousBuilding
      ? previousBuilding.x + previousBuilding.width + 4
      : 0;

    const minWidth = 80;
    const maxWidth = 130;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const platformWithGorilla = index === 1 || index === 6;

    const minHeight = 40;
    const maxHeight = 300;
    const minHeightGorilla = 30;
    const maxHeightGorilla = 150;

    const height = platformWithGorilla
      ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
      : minHeight + Math.random() * (maxHeight - minHeight);

    const lightsOn = [];
    for (let index = 0; index < 50; index++) {
      const light = Math.random() <= 0.33 ? true : false;
      lightsOn.push(light);
    }
    
    buildings.push({ x, width, height, lightsOn });
  }
  return buildings;
}

function initializeBombPosition() {
  const building =
    state.currentPlayer === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second to last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;

  const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
  const gorillaHandOffsetY = 107;

  state.bomb.x = gorillaX + gorillaHandOffsetX;
  state.bomb.y = gorillaY + gorillaHandOffsetY;
  state.bomb.velocity.x = 0;
  state.bomb.velocity.y = 0;
  state.bomb.rotation = 0;

  // initialize position of grab area in HTML
  const grabAreaRadius = 15;
  const left = state.bomb.x * state.scale - grabAreaRadius;
  const bottom = state.bomb.y * state.scale - grabAreaRadius;
  bombGrabAreaDOM.style.left = `${left}px`;
  bombGrabAreaDOM.style.bottom = `${bottom}px`;
}

function draw() {
  ctx.save();
  // flip coordinates upside-down
  ctx.translate(0, window.innerHeight);
  ctx.scale(1, -1);
  ctx.scale(state.scale, state.scale);

  // draw scene
  drawBackground();
  drawBackgroundBuildings();
  drawBuildingsWithBlastHoles();
  drawGorilla(1);
  drawGorilla(2);
  drawBomb();

  // restore transformation
  ctx.restore();
}

// draw() helper functions

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(1, "#F88A85");
  gradient.addColorStop(0, "#FFC28e");

  //draw sky
  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    0,
    window.innerWidth / state.scale,
    window.innerHeight / state.scale
  );

  // draw moon
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(300, 350, 60, 0, 2 * Math.PI);
  ctx.fill();
}

function drawBackgroundBuildings() {
  state.backgroundBuildings.forEach((building) => {
    ctx.fillStyle = "#947285";
    ctx.fillRect(building.x, 0, building.width, building.height);
  });
}

function drawBuildings() {
  state.buildings.forEach((building) => {
    ctx.fillStyle = "#152a47";
    ctx.fillRect(building.x, 0, building.width, building.height);

    // draw windows
    const windowWidth = 10;
    const windowHeight = 12;
    const gap = 15;

    const numberOfFloors = Math.ceil(
      (building.height - gap) / (windowHeight + gap)
    );

    const roomsPerFloor = Math.floor(
      (building.width - gap) / (windowWidth + gap)
    );

    for (let floor = 0; floor < numberOfFloors; floor++) {
      for (let room = 0; room < roomsPerFloor; room++) {
        if(building.lightsOn[floor * roomsPerFloor + room]) {
          ctx.save();
          ctx.translate(building.x + gap, building.height - gap);
          ctx.scale(1, -1);

          const x = room * (windowWidth + gap);
          const y = floor * (windowHeight + gap);

          ctx.fillStyle = "#ebb6a2";
          ctx.fillRect(x,y,windowWidth,windowHeight);

          ctx.restore();
        }
      }
    }
  });
}

function drawBuildingsWithBlastHoles() {
  ctx.save();

  state.blastHoles.forEach((blastHole) => {
    ctx.beginPath();

    // outer shape clockwise
    ctx.rect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    );

    // inner shape c/clockwise
    ctx.arc(blastHole.x, blastHole.y, blastHoleRadius, 0, 2*Math.PI, true);

    ctx.clip();
  });

  drawBuildings();
  ctx.restore();
}

function drawGorilla(player) {
  ctx.save();
  const building =
    player === 1
      ? state.buildings.at(1) // second building - player 1 location
      : state.buildings.at(-2); // second to last building - player 2 location

  ctx.translate(building.x + building.width / 2, building.height);

  drawGorillaBody();
  drawGorillaLeftArm(player);
  drawGorillaRightArm(player);
  drawGorillaFace(player);

  ctx.restore();
}

function drawBomb() {
  ctx.save();
  ctx.translate(state.bomb.x, state.bomb.y);
  // draw throwing trajectory
  if (state.phase === "aiming") {
    // move bomb with mouse while aiming
    ctx.translate(-state.bomb.velocity.x / 6.25, -state.bomb.velocity.y / 6.25);

    ctx.strokeStyle = "rgba (255, 255, 255, 0.7)";
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      state.bomb.velocity.x,
      state.bomb.velocity.y
    );
    ctx.stroke();

    // draw circle
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();
  } else if (state.phase === "in flight") {
    // draw rotated banana
    ctx.fillStyle = "white";
    ctx.rotate(state.bomb.rotation);
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(0, 12, 8, -2);
    ctx.quadraticCurveTo(0,2,-8,-2);
    ctx.fill();
  } else {
    // draw circle
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(state.bomb.x, state.bomb.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

// drawGorilla() helper functions

function drawGorillaBody() {
  ctx.fillStyle = "black";

  ctx.beginPath();

  //starting position
  ctx.moveTo(0, 15);

  // left leg
  ctx.lineTo(-7, 0);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-17, 18);
  ctx.lineTo(-20, 44);

  // main body
  ctx.lineTo(-11, 77);
  ctx.lineTo(0, 84);
  ctx.lineTo(11, 77);

  // right leg
  ctx.lineTo(20, 44);
  ctx.lineTo(17, 18);
  ctx.lineTo(20, 0);
  ctx.lineTo(7, 0);

  ctx.fill();
}

function drawGorillaLeftArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(-13, 50);

  if ((state.phase === "aiming" && state.currentPlayer === 1 && player === 1)){
    ctx.quadraticCurveTo(
      -44, 
      63, 
      -28 - state.bomb.velocity.x / 6.25,
      107 - state.bomb.velocity.y / 6.25
    );
  } else if ((state.phase === "celebrating" && state.currentPlayer === player)) {
    ctx.quadraticCurveTo(-44, 63, -28, 107);
  } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12);
  }

  ctx.stroke();
}

function drawGorillaRightArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;

  ctx.beginPath();
  ctx.moveTo(13, 50);

  if (
    (state.phase === "aiming" && state.currentPlayer === 2 && player === 2)) {
      ctx.quadraticCurveTo(
        44, 
        63, 
        28 - state.bomb.velocity.x / 6.25, 
        107 - state.bomb.velocity.y / 6.25
      );  
  } else if((state.phase === "celebrating" && state.currentPlayer === player)){
    ctx.quadraticCurveTo(44, 63, 28, 107);
  }
  else {
    ctx.quadraticCurveTo(44, 45, 28, 12);
  }

  ctx.stroke();
}

function drawGorillaFace(player) {
  // face  
  ctx.fillStyle = "lightgray";
  ctx.beginPath();
  ctx.arc(0, 63, 9, 0, 2*Math.PI);
  ctx.moveTo(-3.5, 70);
  ctx.arc(-3.5, 70, 4, 0, 2*Math.PI);
  ctx.moveTo(+3.5, 70);
  ctx.arc(+3.5, 70, 4, 0, 2*Math.PI);
  ctx.fill();

  // eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(-3.5, 70 , 1.4, 0, 2*Math.PI);
  ctx.moveTo(+3.5, 70);
  ctx.arc(+3.5, 70, 1.4, 0, 2*Math.PI);
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1.4;

  //nose
  ctx.beginPath();
  ctx.moveTo(-3.5, 66.5);
  ctx.lineTo(-1.5, 65);
  ctx.moveTo(3.5, 66.5);
  ctx.lineTo(1.5, 65);
  ctx.stroke();

  // mouth
  ctx.beginPath();
  if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.moveTo(-5, 60);
    ctx.quadraticCurveTo(0, 56, 5, 60);
  } else {
    ctx.moveTo(-5,56);
    ctx.quadraticCurveTo(0, 60, 5, 56);
  }
  ctx.stroke();
}

function calculateScale() {
  const lastBuilding = state.buildings.at(-1);
  const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;

  state.scale = window.innerWidth / totalWidthOfTheCity;
}

function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angleInRadians = Math.asin(deltaY / hypotenuse);
  const angleInDegrees = (angleInRadians / Math.PI) * 180;

  if (state.currentPlayer === 1) {
    angle1DOM.innerText = Math.round(angleInDegrees);
    velocity1DOM.innerText = Math.round(hypotenuse);
  } else {
    angle2DOM.innerText = Math.round(angleInDegrees);
    velocity2DOM.innerText = Math.round(hypotenuse);
  }
}

function announceWinner() {
  winnerDOM.innerText = `Player ${state.currentPlayer}`;
  congratulationsDOM.style.visibility = "visible";
}

// Event handlers

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  calculateScale();
  initializeBombPosition();
  draw();
});

bombGrabAreaDOM.addEventListener("mousedown", function (e) {
  if (state.phase === "aiming") {
    isDragging = true;

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    document.body.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", function (e) {
  if (isDragging) {
    let deltaX = e.clientX - dragStartX;
    let deltaY = e.clientY - dragStartY;

    state.bomb.velocity.x = -deltaX;
    state.bomb.velocity.y = deltaY;
    setInfo(deltaX, deltaY);

    draw();
  }
});

window.addEventListener("mouseup", function () {
  if (isDragging) {
    isDragging = false;

    document.body.style.cursor = "default";

    throwBomb();
  }
});

newGameButtonDOM.addEventListener("click", newGame);

function throwBomb() {
  state.phase = "in flight";
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (!previousAnimationTimestamp) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }
  const elapsedTime = timestamp - previousAnimationTimestamp;

  const hitDetectionPrecision = 10;
  for (let index = 0; index < hitDetectionPrecision; index++) {
    moveBomb(elapsedTime / hitDetectionPrecision);

    // Hit detection
    const miss = checkFrameHit() || checkBuildingHit(); // bomb hit building or out of screen
    const hit = checkGorillaHit(); // bomb hit enemy player

    // miss case
    if (miss) {
      state.currentPlayer = state.currentPlayer === 1 ? 2 : 1; // switch players
      state.phase = "aiming";
      initializeBombPosition();
      draw();
      return;
    }

    // hit case

    if (hit) {
      state.phase = "celebrating";
      announceWinner();
      draw();
      return;
    }
  }

  draw();

  // continue animation loop
  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(animate);
}

// hit detection helper functions

function checkFrameHit() {
  if (
    state.bomb.y < 0 ||
    state.bomb.x < 0 ||
    state.bomb.x > window.innerWidth / state.scale
  ) {
    return true; // bomb is off screen
  }
}

function checkBuildingHit() {
  for (let index = 0; index < state.buildings.length; index++) {
    const building = state.buildings[index];
    if (
      state.bomb.x + 4 > building.x &&
      state.bomb.x - 4 < building.x + building.width &&
      state.bomb.y - 4 < 0 + building.height
    ) {
      // check if bomb is inside blast hole of previous hit
      for (let j = 0; j < state.blastHoles.length; j++) {
        const blastHole = state.blastHoles[j];
        
        // check distance of bomb from center of previous hit
        const hDistance = state.bomb.x - blastHole.x;
        const vDistance = state.bomb.y - blastHole.y;
        const distance = Math.sqrt(
          hDistance ** 2 + vDistance ** 2
        );
        if (distance < blastHoleRadius) {
          // bomb is inside building boundary but blast hole exists
          return false;
        }
      }
      state.blastHoles.push({ x: state.bomb.x, y: state.bomb.y });
      return true; // building hit
    }
  }
}

function checkGorillaHit() {
  const enemyPlayer = state.currentPlayer === 1 ? 2 : 1;
  const enemyBuilding =
    enemyPlayer === 1 ? state.buildings.at(1) : state.buildings.at(-2);

  ctx.save();

  ctx.translate(
    enemyBuilding.x + enemyBuilding.width / 2,
    enemyBuilding.height
  );

  drawGorillaBody();
  let hit = ctx.isPointInPath(state.bomb.x, state.bomb.y);

  drawGorillaLeftArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);

  drawGorillaRightArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);

  ctx.restore();

  return hit;
}

function moveBomb(elapsedTime) {
  const multiplier = elapsedTime / 200; // Adjust trajectory by gravity

  state.bomb.velocity.y -= 20 * multiplier; // calculate new position

  state.bomb.x += state.bomb.velocity.x * multiplier;
  state.bomb.y += state.bomb.velocity.y * multiplier;

  const direction = state.currentPlayer === 1 ? -1 : +1;
  state.bomb.rotation += direction * 5 * multiplier;
}
