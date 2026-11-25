import * as algorithms from "./algorithms.js";


const canvasDiv = document.querySelector(".canvases");
const canvas = document.querySelector(".mainCanvas");

const startButton = document.querySelector(".startButton");
const regenerationButton = document.querySelector(".regenButton");
const noiseSwitch = document.querySelector(".noiseSwitch");


const mainSelect = document.querySelector(".mainSelect");
const canvasSize = document.querySelector(".sizeInput");
const cellSize = document.querySelector(".cellInput");


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

let cell = 5;


let row = canvas.height / cell;
let column = canvas.width / cell;
let grid = [];

const start = {};
let hasStart = false;
const finish = {};
let hasFinish = false;

let isPerlin = false;


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
        } else {
            this.ctx.fillStyle = "black";
            this.value = 1;
            this.weight = Infinity;
        }
        this.ctx.fillRect(this.x, this.y, cell, cell);
    }
    drawPerlinNoise() {
        this.ctx.fillRect(this.x, this.y, cell, cell);
    }
}

//generate a white noise on a canvas
function initWhiteNoise(canvas) {
    hasStart = false;
    hasFinish = false;

    canvasDiv.classList.remove("canvasesPerlin");
    canvas.classList.remove("canvasPerlin");
    grid = [];
    isPerlin = false;
    for (let i = 0; i < row; i++) {
        const currentRow = [];
        for (let j = 0; j < column; j++) {
            let obj = new Map(canvas, j * cell, i * cell, Math.random());
            obj.drawWhiteNoise();
            currentRow.push(obj);
        }
        grid.push(currentRow);
    }
}

const scale = 0.01;
// const scale = 3 / column; 
function initPerlinNoise(canvas) {
    hasStart = false;
    hasFinish = false;
    
    canvasDiv.classList.add("canvasesPerlin");
    canvas.classList.add("canvasPerlin");
    grid = [];
    isPerlin = true;
    noise.seed(Math.random());
    for (let i = 0; i < row; i++) {
        const rows = [];
        for (let j = 0; j < column; j++) {
            const nx = (j / column) * 2 - 1;
            const ny = (i / row) * 2 - 1;
            const dist = Math.sqrt(nx * nx + ny * ny);   // 0 at center, ~1.4 at corners
            const value = fractal(scale * j, scale * i) - dist * 0.5 + 0.3;
            // const value = fractal(scale * j, scale * i);
            let obj = new Map(canvas, j * cell, i * cell, value);
            
            if (value < 0.0) {
                // deep water -> shallow water
                obj.ctx.fillStyle = lerpColor("#0a3d91", "#4fd8f0", band(value, -0.4, 0.0));
                obj.weight = Infinity;
            } else if (value < 0.07) {
                // wet sand -> dry sand
                obj.ctx.fillStyle = lerpColor("#E8C98F", "#F6DCBD", band(value, 0.0, 0.07));
                obj.weight = 3;
            } else if (value < 0.3) {
                // light grass -> dark grass
                obj.ctx.fillStyle = lerpColor("#7CFC00", "#2E8B2E", band(value, 0.07, 0.3));
                obj.weight = 1;
            } else {
                // forest -> mountain/rock
                obj.ctx.fillStyle = lerpColor("#05472A", "#8a8a8a", band(value, 0.3, 0.6));
                obj.weight = 10;
            }
            obj.drawPerlinNoise();
            rows.push(obj);
        }
        grid.push(rows);
    }
}

function fractal(x, y) {
    let value = 0, amp = 1, freq = 1, total = 0;
    for (let o = 0; o < 6; o++) {
        value += noise.perlin2(x * freq, y * freq) * amp;
        total += amp;
        amp *= 0.5;
        freq *= 2;
    }
    return value / total;
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(c1, c2, t) {
    const a = hexToRgb(c1), b = hexToRgb(c2);
    const r = Math.round(a[0] + (b[0] - a[0]) * t);
    const g = Math.round(a[1] + (b[1] - a[1]) * t);
    const bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return `rgb(${r}, ${g}, ${bl})`;
}

// t = how far value is between lo and hi, clamped to 0..1
function band(value, lo, hi) {
    return Math.min(1, Math.max(0, (value - lo) / (hi - lo)));
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
                ctx.fillRect(j * cell, i * cell, cell, cell);
            }
        }
    } 
    console.log(row);
    console.log(column);
}

function handleStartButton() {
    console.log(start);
    console.log(finish);
    
    window.stopAlgorithm = false;

    clearCanvas(canvas);
    for (let i = 0; i < selects.length; i++) {
        clearCanvas(allCanvases[i]);
    }

    for (let i = 0; i < selects.length; i++) {
        switch (selects[i].value) {
            case "A*":
                if (hasStart === true && hasFinish === false) {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 1, start);
                } else if (hasStart === true && hasFinish === true) {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 1, start, finish);
                } else {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 1);
                }
                
                break;

            case "Weighted A*":
                if (hasStart === true && hasFinish === false) {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 3, start);
                } else if (hasStart === true && hasFinish === true) {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 3, start, finish);
                } else {
                    algorithms.A_star(allCanvases[i], grid, drawCell, 3);
                }
                break;

            case "BFS":
                if (hasStart === true && hasFinish === false) {
                    algorithms.bfs(allCanvases[i], grid, drawCell, start);
                } else if (hasStart === true && hasFinish === true) {
                    algorithms.bfs(allCanvases[i], grid, drawCell, start, finish);
                } else {
                    algorithms.bfs(allCanvases[i], grid, drawCell);
                }
                break;

            case "Dijkstra":
                if (hasStart === true && hasFinish === false) {
                    algorithms.dijkstra(allCanvases[i], grid, drawCell, start);
                } else if (hasStart === true && hasFinish === true) {
                    algorithms.dijkstra(allCanvases[i], grid, drawCell, start, finish);
                } else {
                    algorithms.dijkstra(allCanvases[i], grid, drawCell);
                }
                break;
        }
    }

    hasStart = false;
    hasFinish = false;
}

//to change the color of canvas' cells
function drawCell(canvas, row, col, color, drawLineDimension = cell) {
    const cellObject = grid[row][col];
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cellObject.x, cellObject.y, drawLineDimension, drawLineDimension);
}

//Clear canvas used in the start button
function clearCanvas(canvas) {
    initCopy(canvas, grid);
}

function handleRegenerateButton() {
    grid = [];
    window.stopAlgorithm = true;
    (isPerlin) ? initPerlinNoise(canvas) : initWhiteNoise(canvas);
    //to regenerate other whitenoise canvases
    if (allCanvases.length != 1) {
        for (let i = 1; i < allCanvases.length; i++) {
            initCopy(allCanvases[i], grid);
        }
    }
    hasStart = false;
    hasFinish = false;
}

canvas.addEventListener("click", e => {
    if (hasStart === false && hasFinish === false) {
        hasStart = true;
        let canvasXposition = canvas.getBoundingClientRect().left;
        let canvasYposition = canvas.getBoundingClientRect().top;

        let mouseX = (e.x - canvasXposition) * (canvas.width / canvas.getBoundingClientRect().width);
        let mouseY = (e.y - canvasYposition) * (canvas.height / canvas.getBoundingClientRect().height);

        let row = Math.floor(mouseY / cell);
        let column = Math.floor(mouseX / cell)

        start.row = row;
        start.col = column;

        drawCell(canvas, row, column, "aqua", cell * 4);
        console.log(start);
    } else if (hasStart === true && hasFinish === false) {
        hasFinish = true;
        let canvasXposition = canvas.getBoundingClientRect().left;
        let canvasYposition = canvas.getBoundingClientRect().top;

        let mouseX = (e.x - canvasXposition) * (canvas.width / canvas.getBoundingClientRect().width);
        let mouseY = (e.y - canvasYposition) * (canvas.height / canvas.getBoundingClientRect().height);

        let row = Math.floor(mouseY / cell);
        let column = Math.floor(mouseX / cell)

        finish.row = row;
        finish.col = column;

        drawCell(canvas, row, column, "red", cell * 4);
        console.log(finish);
    } else if (hasStart === true && hasFinish === true) {
        hasStart = false;
    } else {
        hasFinish = false
    }

})

canvasSize.addEventListener("input", e => {
    const size = Number(canvasSize.value);
    canvas.height = size;
    canvas.width = size;
    canvasHeight = size;
    canvasWidth = size;
    row = canvas.height / cell;
    column = canvas.width / cell;
    (isPerlin) ? initPerlinNoise(canvas) : initWhiteNoise(canvas);
    console.log(row);
    console.log(column);

    //remove all the other canvases to reset upon changing the size
    while (allCanvases.length != 1) {
        canvasDiv.lastElementChild.remove();
        selects.pop();
        allCanvases.pop();
    }
})

cellSize.addEventListener("change", e => {
    const size = Number(cellSize.value);
    cell = size;
    row = canvas.height / cell;
    column = canvas.width / cell;
    (isPerlin) ? initPerlinNoise(canvas) : initWhiteNoise(canvas);

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

cellSize.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        canvasSize.blur();
    }
})


startButton.addEventListener("click", e => {
    handleStartButton();
});

regenerationButton.addEventListener("click", e => {
    handleRegenerateButton();
})

//to create another copy canvas using shift + "+" button shortcut
document.addEventListener("keydown", e => {
    if (!isPerlin) {
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
            } else if (canvasChildren.length === 2) {
                canvasChildren[0].style.gridColumn = "2";
                canvasChildren[1].style.gridColumn = "3";
            } else if (canvasChildren.length === 3) {
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
    }
});

document.addEventListener("keydown", e => {
    //shortcut for removing one of the canvases
    if (e.shiftKey && e.key.toLowerCase() === "_") {
        if (canvasDiv.children.length === 1) return
        canvasDiv.lastElementChild.remove();
        selects.pop();
        allCanvases.pop();
    }

    //shortcut for the start button
    if (e.shiftKey && e.key.toLowerCase() === "s") {
        handleStartButton();
    }

    //shortcut for the regenerate button
    if (e.shiftKey && e.key.toLowerCase() === "r") {
        handleRegenerateButton();
    }
})

noiseSwitch.addEventListener("change", e => {
    if (noiseSwitch.checked) {
        isPerlin = true;
        while (canvasDiv.children.length !== 1) {
            canvasDiv.lastElementChild.remove();
            selects.pop();
            allCanvases.pop();
        }
        initPerlinNoise(canvas);

    } else {
        isPerlin = false;
        initWhiteNoise(canvas);
    }
})

initWhiteNoise(canvas);

// initPerlinNoise(canvas);

// initPerlinNoise();