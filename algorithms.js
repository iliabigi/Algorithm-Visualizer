//creating delay for async functions inside algorithms.js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

async function bfs(canvas, grid, drawCell, batchSize = 5) {
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

        drawCell(canvas, current.row, current.col, "lightblue");

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
        drawCell(canvas, cell.row, cell.col, "yellow");
        await nextFrame();
    }

    return path;
}

async function dijkstra(canvas, grid, drawCell, batchSize = 5) {
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
        drawCell(canvas, row, col, "lightblue");

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
        drawCell(canvas, cell.row, cell.col, "yellow");
        await nextFrame();
    }

    console.log("Shortest path:", path);
    console.log("Total cost:", distances[finish.row][finish.col]);

    return path;
}


// Binary min-heap
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



export {
    bfs,
    dijkstra
};