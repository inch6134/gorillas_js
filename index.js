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