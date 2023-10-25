class Node {
  constructor(row, col, parent = null) {
    this.row = row;
    this.col = col;
    this.parent = parent;
    this.g = 0;
    this.h = 0;
  }

  get f() {
    return this.g + this.h;
  }
}

class AStar {
  constructor(maze) {
    this.maze = maze;
  }

  findPathAStar() {
    const rows = this.maze.length;
    const cols = this.maze[0].length;
    const start = new Node(0, 0);
    const end = new Node(0, 0);

    // Find the start and end nodes
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (this.maze[i][j] === 2) {
          start.row = i;
          start.col = j;
        } else if (this.maze[i][j] === 3) {
          end.row = i;
          end.col = j;
        }
      }
    }

    const openList = [];
    const closedList = [];

    openList.push(start);

    while (openList.length > 0) {
      // Find the node with the lowest f in the open list
      let currentNode = openList[0];
      let currentIndex = 0;

      for (let i = 0; i < openList.length; i++) {
        if (openList[i].f < currentNode.f) {
          currentNode = openList[i];
          currentIndex = i;
        }
      }

      // Move the current node to the closed list
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      // If we've reached the end node, reconstruct the path
      if (currentNode.row === end.row && currentNode.col === end.col) {
        const path = [];
        let current = currentNode;
        while (current !== null) {
          path.unshift([current.row, current.col]);
          current = current.parent;
        }
        return path;
      }

      // Generate neighboring nodes
      const neighbors = [];
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [dr, dc] of directions) {
        const newRow = currentNode.row + dr;
        const newCol = currentNode.col + dc;

        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          this.maze[newRow][newCol] !== 1
        ) {
          const neighbor = new Node(newRow, newCol, currentNode);
          neighbors.push(neighbor);
        }
      }

      for (const neighbor of neighbors) {
        if (
          closedList.some(
            (node) => node.row === neighbor.row && node.col === neighbor.col
          )
        ) {
          continue;
        }

        neighbor.g = currentNode.g + 1;
        neighbor.h =
          Math.abs(neighbor.row - end.row) + Math.abs(neighbor.col - end.col);

        if (
          openList.some(
            (node) =>
              node.row === neighbor.row &&
              node.col === neighbor.col &&
              neighbor.g >= node.g
          )
        ) {
          continue;
        }

        openList.push(neighbor);
      }
    }

    return []; // No path found
  }

  markPathInMaze(path) {
    for (const [row, col] of path) {
      this.maze[row][col] = 9;
    }
  }
}

export { AStar };
