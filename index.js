// state of the game
let state = {};

// references to HTML elements

// canvas element and drawing context
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Initial state

newGame();

function newGame() {
    // Initialize game state
    state = {
        phase: "aiming", // aiming | in flight | celebrating
        currentPlayer: 1,
        bomb: {
            x: undefined,
            y: undefined,
            velocity: { x: 0, y: 0 },
        },
        buildings: generateBuildings(),
    }

    initializeBombPosition();

    draw();
}

// Utility functions

function generateBuildings() {
    const buildings = [];
    for (let index = 0; index < 8; index++) {
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

}

function draw(){
    ctx.save();
    // flip coordinates upside-down
    ctx.translate(0, window.innerHeight);
    ctx.scale(1, -1);

    // draw scene
    drawBackground();
    drawBuildings();
    drawGorilla(1);
    drawGorilla(2);
    drawBomb;

    // restore transformation
    ctx.restore();
}

// drawing formulas
function drawBackground(){
    ctx.fillStyle = "#58a8d8";
    ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}

function drawBuildings(){
    
}

function drawGorilla(player) {

}

function drawBomb() {

}

// Event handlers

function throwBomb(){

}

function animate(timestamp){

}