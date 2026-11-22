import * as algorithms from "./algorithms.js";

const body = document.querySelector("body");
const canvasDiv = document.querySelector(".canvases");
const canvas = document.querySelector(".mainCanvas");

const startButton = document.querySelector(".startButton");
const addButton = document.querySelector(".addButton");
const regenarateButton = document.querySelector(".regenButton");

const mainSelect = document.querySelector(".mainSelect");
const canvasSize = document.querySelector(".sizeInput");

const selects = [];
selects.push(mainSelect);
const allCanvases = [];
allCanvases.push(canvas);

const algorithmsList = ["A*", "Weighted A*", "BFS", "Dijkstra"];

window.stopAlgorithm = false;

let canvasHeight = 500;
let canvasWidth = 500;

canvas.style.backgroundColor = "white";
canvas.width = canvasWidth;
canvas.height = canvasHeight;


const cell = 5;
let row = canvas.height / cell;
let column = canvas.width / cell;
let grid = [];

console.log(row);
console.log(column);

class Map {
    constructor(canvas, x, y) {
        this.x = x;
        this.y = y;
        this.noise = Math.random();
        this.ctx = canvas.getContext("2d");
    }
    drawWhiteNoise() {
        if (this.noise < 0.9) {
            this.ctx.fillStyle = "white";
            this.value = 0;
            this.weight = 1;
        } 
        // else if (this.noise > 0.9 && this.noise <= 1) {
        //     this.ctx.fillStyle = "green";
        //     this.value = 0;
        //     this.weight = 3;
        // } 
        else {
            this.ctx.fillStyle = "black";
            this.value = 1;
            this.weight = Infinity;
        }
        this.ctx.fillRect(this.x, this.y, cell, cell);
    }
}

//generate a white noise on a canvas
function initWhiteNoise(canvas) {
    grid = [];
    for (let i = 0; i < row; i++) {
        const currentRow = [];
        for (let j = 0; j < column; j++) {
            let obj = new Map(canvas, j * 5, i * 5);
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
            let obj = grid[i][j];
            if (obj.weight === 1) {
                ctx.fillStyle = "white";
            } else if (obj.weight === 3) {
                ctx.fillStyle = "green";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(j * 5, i * 5, cell, cell);
        }
    }
    console.log(row);
    console.log(column);
}

canvasSize.addEventListener("input", e => {
    const size = Number(canvasSize.value);
    canvas.height = size;
    canvas.width = size;
    canvasHeight = size;
    canvasWidth = size;
    row = canvas.height / cell;
    column = canvas.width / cell;
    initWhiteNoise(canvas);
    console.log(row);
    console.log(column);

    while (allCanvases.length != 1) {
        canvasDiv.lastElementChild.remove();
        selects.pop();
        allCanvases.pop();
    }
})

canvasSize.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        canvasSize.blur();
    }
})

startButton.addEventListener("click", e => {
    window.stopAlgorithm = false;

    clearCanvas(canvas);
    for (let i = 0; i < selects.length; i++) {
        clearCanvas(allCanvases[i]);
    }

    for (let i = 0; i < selects.length; i++) {
        switch (selects[i].value) {
            case "A*":
                algorithms.A_star(allCanvases[i], grid, drawCell);
                break;
            case "Weighted A*":
                algorithms.A_star(allCanvases[i], grid, drawCell, 3);
                break;
            case "BFS":
                algorithms.bfs(allCanvases[i], grid, drawCell);
                break;
            case "Dijkstra":
                algorithms.dijkstra(allCanvases[i], grid, drawCell);
                break;
        }
    }
});

//to create another copy canvas using shift + "+" button shortcut
document.addEventListener("keydown", e => {
    if (e.shiftKey && e.key.toLowerCase() === "+") {
        let newCanvas = document.createElement("canvas");
        newCanvas.classList.add("canvas");

        let newDiv = document.createElement("div");
        newDiv.classList.add("containCanvas");

        newDiv.appendChild(newCanvas);
        canvasDiv.appendChild(newDiv);

        let newSelect = document.createElement("select");

        algorithmsList.forEach((val) => {
            let newOption = document.createElement("option");
            newOption.value = val;
            newOption.textContent = val;

            newSelect.appendChild(newOption);
        });

        newDiv.appendChild(newSelect);
        selects.push(newSelect);

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
        allCanvases.push(newCanvas);
    }
});

//to remove one of the canvases
document.addEventListener("keydown", e => {
    if (e.shiftKey && e.key.toLowerCase() === "_") {
        canvasDiv.lastElementChild.remove();
        selects.pop();
        allCanvases.pop();
    }
})

//to change the color of canvas' cells
function drawCell(canvas, row, col, color) {
    const cell = grid[row][col];
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, 5, 5);
}

//Clear canvas used in the start button
function clearCanvas(canvas) {
    initCopy(canvas, grid);
}

function regenarate() {
    grid = [];
    window.stopAlgorithm = true;
    initWhiteNoise(canvas);
    if (allCanvases.length != 1) {
        for (let i = 1; i < allCanvases.length; i++) {
            initCopy(allCanvases[i], grid);
        }
    }
}


regenarateButton.addEventListener("click", e => {
    regenarate();
})


initWhiteNoise(canvas);
