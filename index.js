// state of the game
let state = {};

// global variables for drag event handling
let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;

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
const angle2DOM = document.querySelector("#info-rightS .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");

// bomb's grab area
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");

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
            velocity: { x: 0, y: 0 },
        },
        buildings: generateBuildings(),
    }

    calculateScale();

    initializeBombPosition();

    draw();
}

// Utility functions

function generateBuildings() {
    const buildings = [];
    for (let index = 0; index <= 8; index++) {
        const previousBuilding = buildings[index -1];

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

        buildings.push({ x, width, height });
    }
    return buildings;
}

function initializeBombPosition() {
    const building = 
        state.currentPlayer === 1
            ? state.buildings.at(1) // Second building
            : state.buildings.at(-2) // Second to last building

    const gorillaX = building.x + building.width / 2;
    const gorillaY = building.height;

    const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
    const gorillaHandOffsetY = 107;

    state.bomb.x = gorillaX + gorillaHandOffsetX;
    state.bomb.y = gorillaY + gorillaHandOffsetY;
    state.bomb.velocity.x = 0;
    state.bomb.velocity.y = 0;

    // initialize position of grab area in HTML
    const grabAreaRadius = 15;
    const left = state.bomb.x * state.scale - grabAreaRadius;
    const bottom = state.bomb.y * state.scale - grabAreaRadius;
    bombGrabAreaDOM.style.left = `${left}px`;
    bombGrabAreaDOM.style.bottom = `${bottom}px`;
}

function draw(){
    ctx.save();
    // flip coordinates upside-down
    ctx.translate(0, window.innerHeight);
    ctx.scale(1, -1);
    ctx.scale(state.scale, state.scale);

    // draw scene
    drawBackground();
    drawBuildings();
    drawGorilla(1);
    drawGorilla(2);
    drawBomb();

    // restore transformation
    ctx.restore();
}

// draw() helper functions

function drawBackground(){
    ctx.fillStyle = "#58a8d8";
    ctx.fillRect(0,
        0,
        window.innerWidth / state.scale,
        window.innerHeight / state.scale
    );
}


function drawBuildings(){
    state.buildings.forEach((building) => {
        ctx.fillStyle = "#152a47";
        ctx.fillRect(building.x, 0, building.width, building.height);
    })
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
    drawGorillaFace();
    
    ctx.restore();
}


function drawBomb() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(state.bomb.x, state.bomb.y, 6, 0, 2 * Math.PI);
    ctx.fill();
}


// drawGorilla() helper functions

function drawGorillaBody(){
    ctx.fillStyle = "black";

    ctx.beginPath();

    //starting position
    ctx.moveTo(0, 15);

    // left leg
    ctx.lineTo(-7, 0);
    ctx.lineTo(-20, 0);

    // main body
    ctx.lineTo(-13, 77);
    ctx.lineTo(0, 84);
    ctx.lineTo(13, 77);
    
    // right leg
    ctx.lineTo(20, 0);
    ctx.lineTo(7, 0);

    ctx.fill();
};

function drawGorillaLeftArm(player){
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(-13, 50);

    if(
        (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) ||
        (state.phase === "celebrating" && state.currentPlayer === player)
    ) {
        ctx.quadraticCurveTo(-44, 63, -28, 107);
    } else {
        ctx.quadraticCurveTo(-44, 45, -28, 12);
    }

    ctx.stroke();
};

function drawGorillaRightArm(player){
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(13, 50);

    if(
        (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) ||
        (state.phase === "celebrating" && state.currentPlayer === player)
    ) {
        ctx.quadraticCurveTo(44, 63, 28, 107);
    } else {
        ctx.quadraticCurveTo(44, 45, 28, 12);
    }

    ctx.stroke();
};

function drawGorillaFace(){
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 3;

    ctx.beginPath();

    // left eye
    ctx.moveTo(-5, 70);
    ctx.lineTo(-2, 70);

    // right eye
    ctx.moveTo(2, 70);
    ctx.lineTo(5, 70);

    // mouth
    ctx.moveTo(-5, 62);
    ctx.lineTo(5, 62);

    ctx.stroke();
};

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

// Event handlers

window.addEventListener("resize", () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calculateScale();
    initializeBombPosition();
    draw();
})

bombGrabAreaDOM.addEventListener("mousedown", function (e) {
    if(state.phase === "aiming") {
        isDragging = true;

        dragStartX = e.clientX;
        dragStartY = e.clientY;

        document.body.style.cursor = "grabbing";
    }
})

window.addEventListener("mousemove", function (e) {
    if(isDragging) {
        let deltaX = e.clientX - dragStartX;
        let deltaY = e.clientY - dragStartY;

        state.bomb.velocity.x = -deltaX;
        state.bomb.velocity.y = deltaY;
        setInfo(deltaX, deltaY);

        draw();
    }
})

window.addEventListener("mouseup", function () {
    if (isDragging) {
        isDragging = false;

        document.body.style.cursor = "default";

        throwBomb();
    }
});

function throwBomb(){

}

function animate(timestamp){

}