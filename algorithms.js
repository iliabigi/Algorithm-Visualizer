//creating delay for async functions inside algorithms.js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

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
        if (head % 2 === 0) {
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

async function dijkstra(canvas, grid, drawCell) {
    const rows = grid.length;
    const cols = grid[0].length;

    const start = { row: 0, col: 0 };
    const finish = { row: rows - 1, col: cols - 1 };

    // Make sure start and finish are walkable
    grid[start.row][start.col].value = 0;
    grid[start.row][start.col].weight = 1;

    grid[finish.row][finish.col].value = 0;
    grid[finish.row][finish.col].weight = 1;

    // Initialize distances
    const distances = Array.from(
        { length: rows },
        () => Array(cols).fill(Infinity)
    );

    // Store the previous cell for path reconstruction
    const parents = Array.from(
        { length: rows },
        () => Array(cols).fill(null)
    );

    const visited = Array.from(
        { length: rows },
        () => Array(cols).fill(false)
    );

    // Starting distance is zero
    distances[start.row][start.col] = 0;

    // Priority queue (simple array implementation)
    const queue = [start];

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    while (queue.length > 0) {

        // Get the cell with the smallest distance
        queue.sort((a, b) =>
            distances[a.row][a.col] - distances[b.row][b.col]
        );

        const current = queue.shift();

        // Ignore already visited cells
        if (visited[current.row][current.col]) continue;

        visited[current.row][current.col] = true;

        // Visualize the current cell
        drawCell(canvas, current.row, current.col, "lightblue");

        await sleep(0.1);

        // Stop when we reach the finish
        if (
            current.row === finish.row &&
            current.col === finish.col
        ) {
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {

            const newRow = current.row + dr;
            const newCol = current.col + dc;

            // Check grid boundaries
            if (
                newRow < 0 ||
                newRow >= rows ||
                newCol < 0 ||
                newCol >= cols
            ) {
                continue;
            }

            const neighbor = grid[newRow][newCol];

            // Skip obstacles and already visited cells
            if (neighbor.value === 1 || visited[newRow][newCol]) {
                continue;
            }

            // Calculate the new distance
            const newDistance =
                distances[current.row][current.col] +
                neighbor.weight;

            // Update if we found a cheaper path
            if (newDistance < distances[newRow][newCol]) {

                distances[newRow][newCol] = newDistance;

                parents[newRow][newCol] = current;

                queue.push({
                    row: newRow,
                    col: newCol
                });
            }
        }
    }

    // Check whether a path was found
    if (distances[finish.row][finish.col] === Infinity) {
        console.log("No path found");
        return;
    }

    // Reconstruct the shortest path
    const path = [];

    let current = finish;

    while (current !== null) {
        path.push(current);
        current = parents[current.row][current.col];
    }

    path.reverse();

    // Draw the shortest path
    for (const cell of path) {
        drawCell(canvas, cell.row, cell.col, "yellow");
        await sleep(0.001);
    }

    console.log("Shortest path:", path);
    console.log("Total cost:", distances[finish.row][finish.col]);
}


export {
    bfs,
    dijkstra
};