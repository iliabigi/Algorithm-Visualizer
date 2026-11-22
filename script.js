import * as algorithms from "./algorithms.js";

const body = document.querySelector("body");
const canvasDiv = document.querySelector(".canvases");
const canvas = document.querySelector(".mainCanvas");

const startButton = document.querySelector(".startButton");
const addButton = document.querySelector(".addButton");
const regenarateButton = document.querySelector(".regenButton");
const noiseSwitch = document.querySelector(".noiseSwitch")

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

let isPerlin = false;

console.log(row);
console.log(column);

class Map {
    constructor(canvas, x, y, seed) {
        this.x = x;
        this.y = y;
        this.noiseSeed = seed;
        this.ctx = canvas.getContext("2d");
    }
    drawWhiteNoise() {
        if (this.noiseSeed < 0.9) {
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
    drawPerlinNoise() {
        // let brightness = Math.floor((this.noiseSeed + 1) * 127.5);
        // this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

        if (this.weight === 1) {
            this.ctx.fillStyle = "#ffdeb8";
        } else if (this.weight === 5) {
            this.ctx.fillStyle = "aqua";
        } else if (this.weight === 10) {
            this.ctx.fillStyle = "#ffdeb8";
        } else {
            this.ctx.fillStyle = "#ffdeb8";
        }

        this.ctx.fillRect(this.x, this.y, cell, cell);
    }
}

//generate a white noise on a canvas
function initWhiteNoise(canvas) {
    grid = [];
    isPerlin = false;
    for (let i = 0; i < row; i++) {
        const currentRow = [];
        for (let j = 0; j < column; j++) {
            let obj = new Map(canvas, j * 5, i * 5, Math.random());
            obj.drawWhiteNoise();
            currentRow.push(obj);
        }
        grid.push(currentRow);
    }
}

const scale = 0.05;
function initPerlinNoise(canvas) {
    grid = [];
    isPerlin = true;
    noise.seed(Math.random());
    for (let i = 0; i < row; i++) {
        const rows = [];
        for (let j = 0; j < column; j++) {
            const value = noise.perlin2(scale * j, scale * i);
            let obj = new Map(canvas, j * 5, i * 5, value);

            if (value < -0.2) {
                obj.weight = 1;
            } else if (value < 0.3) {
                obj.weight = 5;
            } else if (value < 0.65) {
                obj.weight = 10; 
            } else {
                obj.weight = Infinity;
            }

            obj.drawPerlinNoise();
            rows.push(obj);
        }
        grid.push(rows);
    }
}

//for copying the original canvas into newly created canvases
function initCopy(canvas, grid) {
    if (!isPerlin) {
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                let obj = grid[i][j];
                if (obj.weight === 1) {
                    ctx.fillStyle = "white";
                } else if (obj.weight === 3) {
                    ctx.fillStyle = "#ffb35c";
                } else {
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(j * 5, i * 5, cell, cell);
            }
        }
    } else if (isPerlin) {
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                let obj = grid[i][j];
                console.log(obj.weight);

                if (obj.weight === 1) {
                    ctx.fillStyle = "#ffdeb8";
                } else if (obj.weight === 5) {
                    ctx.fillStyle = "aqua";
                } else if (obj.weight === 10) {
                    ctx.fillStyle = "#ffdeb8";
                } else {
                    ctx.fillStyle = "#ffdeb8";
                }

                ctx.fillRect(j * 5, i * 5, cell, cell);
            }
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
        if (canvasDiv.children.length === 1) return
        canvasDiv.lastElementChild.remove();
        selects.pop();
        allCanvases.pop();
    }
})

noiseSwitch.addEventListener("change", e => {
    if (noiseSwitch.checked) {
        isPerlin = true;
        initPerlinNoise(canvas);

    } else {
        isPerlin = false;
        initWhiteNoise(canvas);
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


// initPerlinNoise();

// console.log(noise.seed());