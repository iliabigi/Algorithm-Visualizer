//creating delay for async functions inside algorithms.js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

const speed1 = document.querySelector('[data-speed="1"]');
const speed2 = document.querySelector('[data-speed="2"]');
const speed5 = document.querySelector('[data-speed="5"]');
const speed15 = document.querySelector('[data-speed="15"]');

let batchSize = 5;

speed1.addEventListener("click", e => {
    batchSize = 1;
})

speed2.addEventListener("click", e => {
    batchSize = 2;
})

speed5.addEventListener("click", e => {
    batchSize = 5;
})

speed15.addEventListener("click", e => {
    batchSize = 15;
})

document.addEventListener("keydown", e => {
    if (e.key === "1") {
        batchSize = 1;
    }
    if (e.key === "2") {
        batchSize = 2;
    }
    if (e.key === "3") {
        batchSize = 5;
    } 
    if (e.key === "4") {
        batchSize = 15;
    }
})

//Binary min-heap
class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        const heap = this.heap;

        heap.push(item);

        let index = heap.length - 1;

        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (heap[parent].distance <= heap[index].distance) {
                break;
            }

            [heap[parent], heap[index]] = [heap[index], heap[parent]];

            index = parent;
        }
    }

    pop() {
        const heap = this.heap;

        if (heap.length === 0) return null;

        const min = heap[0];
        const last = heap.pop();

        if (heap.length > 0) {
            heap[0] = last;

            let index = 0;

            while (true) {
                const left = 2 * index + 1;
                const right = 2 * index + 2;

                let smallest = index;

                if (
                    left < heap.length &&
                    heap[left].distance < heap[smallest].distance
                ) {
                    smallest = left;
                }

                if (
                    right < heap.length &&
                    heap[right].distance < heap[smallest].distance
                ) {
                    smallest = right;
                }

                if (smallest === index) break;

                [heap[index], heap[smallest]] =
                    [heap[smallest], heap[index]];

                index = smallest;
            }
        }

        return min;
    }

    get length() {
        return this.heap.length;
    }
}

async function bfs(canvas, grid, drawCell) {
    const rows = grid.length;
    const cols = grid[0].length;

    const start = {
        row: 0, 
        col: 0
    };

    const finish = {
        row: rows - 1, 
        col: cols - 1
    };

    const visited = Array.from(
        {length: rows},
        () => Array(cols).fill(false)
    );

    const parents = Array.from(
        {length: rows},
        () => Array(cols).fill(null)
    );

    const queue = [start];
    let head = 0;

    visited[start.row][start.col] = true;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (head < queue.length) {
        const current = queue[head++];

        drawCell(canvas, current.row, current.col, "#646fe6");

        // Check if we reached the finish
        if (current.row === finish.row && current.col === finish.col) {
            break;
        }

        for (const [dr, dc] of directions) {
            const newRow = current.row + dr;
            const newCol = current.col + dc;

            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = grid[newRow][newCol];

            if (neighbor.value === 1 || visited[newRow][newCol]) {
                continue;
            }

            visited[newRow][newCol] = true;

            parents[newRow][newCol] = current;

            queue.push({
                row: newRow,
                col: newCol
            });
        }

        // Allow the browser to render every 2 explored cells
        if (head % batchSize === 0) {
            if (window.stopAlgorithm) return
            await nextFrame();
        }
    }

    if (!visited[finish.row][finish.col]) {
        console.log("No path found");
        return null;
    }

    // Reconstruct path
    const path = [];

    let current = finish;

    while (current !== null) {
        path.push(current);
        current = parents[current.row][current.col];
    }

    path.reverse();

    // Draw final path
    for (const cell of path) {
        if (window.stopAlgorithm) return
        drawCell(canvas, cell.row, cell.col, "orange");
        await nextFrame();
    }

    return path;
}

async function dijkstra(canvas, grid, drawCell) {
    const rows = grid.length;
    const cols = grid[0]?.length;

    if (!rows || !cols) return null;

    const start = { row: 0, col: 0 };
    const finish = { row: rows - 1, col: cols - 1 };

    // Initialize distances
    const distances = Array.from(
        { length: rows },
        () => Array(cols).fill(Infinity)
    );

    // Store previous cells
    const parents = Array.from(
        { length: rows },
        () => Array(cols).fill(null)
    );

    const visited = Array.from(
        { length: rows },
        () => Array(cols).fill(false)
    );

    distances[start.row][start.col] = 0;

    // Priority queue
    const queue = new MinHeap();

    queue.push({
        ...start,
        distance: 0
    });

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    let processed = 0;

    while (queue.length > 0) {

        // Get the cell with the smallest distance
        const current = queue.pop();

        const { row, col, distance } = current;

        // Skip outdated or already visited entries
        if (
            visited[row][col] ||
            distance !== distances[row][col]
        ) {
            continue;
        }

        visited[row][col] = true;

        // Visualize explored cell
        drawCell(canvas, row, col, "#646fe6");

        processed++;

        // Stop when we reach the finish
        if (
            row === finish.row &&
            col === finish.col
        ) {
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            // Check boundaries
            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = grid[newRow][newCol];

            // Skip obstacles and visited cells
            if (
                neighbor.value === 1 ||
                visited[newRow][newCol]
            ) {
                continue;
            }

            // Calculate new distance
            const newDistance =
                distance + neighbor.weight;

            // Update if a cheaper path is found
            if (newDistance < distances[newRow][newCol]) {

                distances[newRow][newCol] = newDistance;

                parents[newRow][newCol] = { row, col };

                queue.push({
                    row: newRow,
                    col: newCol,
                    distance: newDistance
                });
            }
        }

        // Allow the browser to render periodically
        if (processed % batchSize === 0) {
            if (window.stopAlgorithm) return
            await nextFrame();
        }
    }

    // Check whether a path was found
    if (distances[finish.row][finish.col] === Infinity) {
        console.log("No path found");
        return null;
    }

    // Reconstruct shortest path
    const path = [];

    let current = finish;

    while (current !== null) {
        path.push(current);
        current = parents[current.row][current.col];
    }

    path.reverse();

    // Draw shortest path
    for (const cell of path) {
        if (window.stopAlgorithm) return
        drawCell(canvas, cell.row, cell.col, "orange");
        await nextFrame();
    }

    console.log("Shortest path:", path);
    console.log("Total cost:", distances[finish.row][finish.col]);

    return path;
}

async function A_star(canvas, grid, drawCell, weight = 1) {
    const rows = grid.length;
    const cols = grid[0]?.length;

    if (!rows || !cols) return null;

    const start = { row: 0, col: 0 };
    const finish = { row: rows - 1, col: cols - 1 };

    // Manhattan distance heuristic (4-directional movement)
    // Admissible as long as the minimum cell weight is 1, which it is in your grid
    const heuristic = (row, col) =>
        Math.abs(row - finish.row) + Math.abs(col - finish.col);

    // gScore = cost of the cheapest known path from start to this cell
    const gScore = Array.from(
        { length: rows },
        () => Array(cols).fill(Infinity)
    );

    const parents = Array.from(
        { length: rows },
        () => Array(cols).fill(null)
    );

    const visited = Array.from(
        { length: rows },
        () => Array(cols).fill(false)
    );

    gScore[start.row][start.col] = 0;

    // Priority queue ordered by f = g + h
    // NOTE: your MinHeap must compare on the `distance` field.
    // Here, `distance` holds the f-score, and `g` is stored separately.
    const queue = new MinHeap();

    queue.push({
        ...start,
        g: 0,
        distance: heuristic(start.row, start.col) * weight
    });

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    let processed = 0;

    while (queue.length > 0) {
        const current = queue.pop();
        const { row, col, g } = current;

        // Skip stale entries (a cheaper path to this cell was already found)
        if (visited[row][col] || g !== gScore[row][col]) {
            continue;
        }

        visited[row][col] = true;

        drawCell(canvas, row, col, "#646fe6");

        processed++;

        if (row === finish.row && col === finish.col) {
            break;
        }

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = grid[newRow][newCol];

            if (neighbor.value === 1 || visited[newRow][newCol]) {
                continue;
            }

            const tentativeG = g + neighbor.weight;

            if (tentativeG < gScore[newRow][newCol]) {
                gScore[newRow][newCol] = tentativeG;
                parents[newRow][newCol] = { row, col };

                const h = heuristic(newRow, newCol);

                queue.push({
                row: newRow,
                col: newCol,
                g: tentativeG,
                distance: tentativeG + h * weight   // weight is 1 in a standard A*
                });
            }
        }

        if (processed % batchSize === 0) {
            if (window.stopAlgorithm) return
            await nextFrame();
        }
    }

    if (gScore[finish.row][finish.col] === Infinity) {
        console.log("No path found");
        return null;
    }

    // Reconstruct path
    const path = [];
    let current = finish;

    while (current !== null) {
        path.push(current);
        current = parents[current.row][current.col];
    }

    path.reverse();

    // Draw final path
    for (const cell of path) {
        if (window.stopAlgorithm) return
        drawCell(canvas, cell.row, cell.col, "orange");
        await nextFrame();
    }

    console.log("Path length (cells):", path.length);
    console.log("Total cost:", gScore[finish.row][finish.col]);

    return path;
}

export {
    bfs,
    dijkstra,
    A_star
};