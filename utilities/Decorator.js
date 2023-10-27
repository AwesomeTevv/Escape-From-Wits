import * as THREE from "three";
import * as CANNON from "cannon-es";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Decoration } from "./Decoration";

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

    // this.loader = new GLTFLoader();

    // this.decoration = new Decoration();

    // this.glassMeshes = [];
    // this.glassBodies = [];

    // this.glassMaterial = new THREE.MeshPhysicalMaterial({
    //   metalness: 0,
    //   transmission: 0.9,
    //   thickness: 5,
    //   roughness: 0.1,
    //   reflectivity: 1,
    //   color: 0xd7e2d5,
    // });
    // this.glassGeometry = new THREE.BoxGeometry(1, 1, 1);
  }

  loadBlock = (block) => {
    block.translateY(-2.7);
    this.scene.add(block);
  };

  DecorateDeadEnds(level = 1) {
    const deadEndsList = this.DeadEnds();

    for (const [i, j] of deadEndsList) {
      //   const geometry = new THREE.BoxGeometry(1, 1, 1);
      //   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      //   const cube = new THREE.Mesh(geometry, material);
      //   cube.position.set(5 * (j - 10), 0.5, 5 * (i - 10));
      //   this.scene.add(cube);

      const model = new THREE.Object3D();

      this.loader.load(
        "../../assets/models/decorations/cemetery_angel_-_furey.glb",
        function (gltf) {
          gltf.scene.scale.set(2.5, 2.5, 2.5);
          gltf.scene.translateY(-5.2);
          gltf.scene.position.set(5 * (j - 10), 2.5, 5 * (i - 10));
          model.add(gltf.scene);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );

      this.loadBlock(model);

      //   /** @type {THREE.Object3D} */
      //   const block = this.decoration.getDecoration(
      //     count % this.decoration.decorationList.length
      //   );
      //   block.position.set(5 * (j - 10), 2.5, 5 * (i - 10));
      //   this.scene.add(block);

      console.log("placed.");
    }
  }

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
