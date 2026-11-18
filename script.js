import * as algorithms from "./algorithms.js";

const body = document.querySelector("body");
const canvas = document.querySelector("#canvas");


canvas.style.backgroundColor = "white";
canvas.style.border = "1px solid red";

canvas.width = 250;
canvas.height = 250;


const cell = 5;
const row = canvas.height / cell;
const column = canvas.width / cell;
const grid = []

class Map {
    constructor(canvas, x, y) {
        this.x = x;
        this.y = y;
        this.noise = Math.random();
        this.ctx = canvas.getContext("2d");
    }
    drawWhiteNoise() {
        if (this.noise <= 0.4) {
            this.ctx.fillStyle = "white";
            this.value = 0;
            this.weight = 1;
        }
        else if (this.noise > 0.4 && this.noise <= 0.8) {
            this.ctx.fillStyle = "gray";
            this.value = 0;
            this.weight = 5;
        } else {
            this.ctx.fillStyle = "black";
            this.value = 1;
            this.weight = Infinity;
        }
        this.ctx.fillRect(this.x, this.y, cell, cell);
    }
}

//generate a white noise on a canvas
function initWhiteNoise(canvas) {
    for (let i = 0; i < row; i++) {
        const currentRow = [];
        for (let j = 0; j < column; j++) {
            let obj = new Map(canvas, j*5, i*5);
            obj.drawWhiteNoise();
            currentRow.push(obj);
        }
        grid.push(currentRow);
    }
}

//for copying the original canvas into newly created canvases
function initCopy(canvas, grid) {
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < column; j++) {
            let obj =  grid[i][j];
            if (obj.weight === 1) {
                ctx.fillStyle = "white" 
            } else if (obj.weight === 5) {
                ctx.fillStyle = "gray"
            } else {
                ctx.fillStyle = "black"
            }
            ctx.fillRect(j*5, i*5, cell, cell);
        }
    }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function drawCell(row, col, color) {
    const cell = grid[row][col]
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, 5, 5);
}

initWhiteNoise(canvas);

let newCanvas = document.createElement("canvas");
body.appendChild(newCanvas);
newCanvas.style.backgroundColor = "white";
newCanvas.style.border = "1px solid red";

newCanvas.width = 250;
newCanvas.height = 250;

// initWhiteNoise(newCanvas);
initCopy(newCanvas, grid);

// algorithms.dijkstra(grid, drawCell, sleep);