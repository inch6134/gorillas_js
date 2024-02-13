// state of the game
let state = {};

// references to HTML elements
const canvas = document.getElementById("game");

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

}

// Event handlers

function throwBomb(){

}

function animate(timestamp){

}