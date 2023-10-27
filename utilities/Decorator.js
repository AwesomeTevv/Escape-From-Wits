import * as THREE from "three";
import * as CANNON from "cannon-es";

class Decorator {
  /**
   *
   * @param {number[][]} maze A 2D maze of numbers that represent the game maze
   * @param {THREE.Scene} scene The ThreeJS scene of the main game world
   * @param {CANNON.World} world The Cannon-ES world of the main game world
   */
  constructor(maze, scene, world) {
    this.maze = maze;
    this.scene = scene;
    this.world = world;
  }

  loadBlock = (block) => {
    block.translateY(-2.7);
    this.scene.add(block);
  };

  DeadEnds() {
    let deadEndsList = [];

    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (this.isDeadEnd(i, j)) {
          deadEndsList.push([i, j]);
        }
      }
    }
    return deadEndsList;
  }

  isDeadEnd(i, j) {
    const directions = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];

    let wallcount = 0;

    for (const [a, b] of directions) {
      if (i + a >= 0 && i + a < 20 && j + b >= 0 && j + b < 20) {
        if (this.maze[i + a][j + b] == 1) {
          wallcount++;
        }
      }
    }

    if (wallcount == 3) {
      return true;
    }

    return false;
  }

  GlassBlocks() {
    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if ((i + j) % 7 == 0 && !this.isDeadEnd(i, j)) {
          const mesh = new THREE.Mesh(this.glassGeometry, this.glassMaterial);
          mesh.position.set(5 * (j - 10), 0.5, 5 * (i - 10));
          this.scene.add(mesh);
        }
      }
    }
  }
}

export { Decorator };
