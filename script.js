import * as algorithms from "./algorithms.js";

const body = document.querySelector("body");
const canvasDiv = document.querySelector(".canvases");
const canvas = document.querySelector(".mainCanvas");


const addButton = document.querySelector(".addButton");

const algorithmsList = [
    "A*", "Weighted A*",
    "BFS", "Dijkstra"
];

const canvasHeight = 500;
const canvasWidth= 500;

canvas.style.backgroundColor = "white";
canvas.width = canvasWidth;
canvas.height = canvasHeight;

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
        if (this.noise <= 0.8) {
            this.ctx.fillStyle = "white";
            this.value = 0;
            this.weight = 1;
        }
        else if (this.noise > 0.9 && this.noise <= 1) {
            this.ctx.fillStyle = "green";
            this.value = 0;
            this.weight = 3;
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
            } else if (obj.weight === 3) {
                ctx.fillStyle = "green"
            } else {
                ctx.fillStyle = "black"
            }
            ctx.fillRect(j*5, i*5, cell, cell);
        }
    }
}

//to create another copy canvas using the add button

addButton.addEventListener("click", e => {
    let newCanvas = document.createElement("canvas");
    newCanvas.classList.add("canvas");

    let newDiv = document.createElement("div");
    newDiv.classList.add("containCanvas");

    newDiv.appendChild(newCanvas);
    canvasDiv.appendChild(newDiv);
    
    let newSelect = document.createElement("select");

    algorithmsList.forEach(val => {
        let newOption = document.createElement("option");
        newOption.value = val;
        newOption.textContent = val;

        newSelect.appendChild(newOption);
    })

    newDiv.appendChild(newSelect);

    let canvasChildren = canvasDiv.children;

    if (canvasChildren.length === 1) {
        canvasChildren[0].style.gridColumn = "2";
    } 
    else if (canvasChildren.length === 2) {
        canvasChildren[0].style.gridColumn = "2";
        canvasChildren[1].style.gridColumn = "3";
    } 
    else if (canvasChildren.length === 3) {
        canvasChildren[0].style.gridColumn = "2";
        canvasChildren[1].style.gridColumn = "3";
        canvasChildren[2].style.gridColumn = "1";
        canvasChildren[2].style.gridRow = "1";
    }

    newCanvas.style.backgroundColor = "white";
    newCanvas.width = canvasWidth;
    newCanvas.height = canvasHeight;

    initCopy(newCanvas, grid);
})

//to change the color of canvas' cells
function drawCell(canvas, row, col, color) {
    const cell = grid[row][col]
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, 5, 5);
}


initWhiteNoise(canvas);

console.log(algorithms.A_starWeighted(canvas, grid, drawCell, 3));
