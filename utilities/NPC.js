import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as YUKA from "yuka";

// Custom Classes
import { AStar } from "./PathFinder";

/**
 * NPC class.
 *
 * Custom class that handles all the logic and creation of the NPC.
 */
class NPC {
  /**
   * Constructor class for the NPC.
   *
   * Initialises the object.
   */
  constructor() {}

  /**
   * Builds the NPC.
   *
   * Builds and returns the mesh for the NPC.
   *
   * @returns THREE.Mesh
   */
  getNPC() {
    const geometry = new THREE.BoxGeometry(2, 10, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  /**
   * Regenerates the path.
   *
   * Function that regenerates the path to the player.
   *
   * @param {number[][]} maze The 2D array representing the game's maze
   * @param {CANNON.Body} player The mesh of the player
   * @param {THREE.Mesh} enemy The mesh of the enemy NPC
   * @param {YUKA.Path} enemyPath The path of the enemy NPC
   * @param {YUKA.Vehicle} vehicle The YUKA vehicle representing the enemy NPC
  */

  regeneratePath(maze, player, enemy, enemyPath, vehicle) {
    /*
     * Converting the enemy's world coordinates
     * to maze coordinates
     */
    let mazeCopy = new Array(maze.length).fill(null).map(() => new Array(maze.length).fill(1))
    for (var i = 0; i < maze.length; i++){
      for (let j = 0; j < maze[i].length; j++) {
        mazeCopy[i][j] = maze[i][j];       
      }
    } 
  
    const enemyPos = enemy.position.clone();
    let enemyX = 0;
    let enemyZ = 0;
  
    if (
      Math.abs(Math.floor(enemyPos.x) - enemyPos.x) <=
      Math.abs(Math.ceil(enemyPos.x) - enemyPos.x)
    ) {
      enemyX = Math.floor(enemyPos.x);
    } else {
      enemyX = Math.ceil(enemyPos.x);
    }
    enemyX = Math.floor(enemyX / 5) * 5;

    if (
      Math.abs(Math.floor(enemyPos.z) - enemyPos.z) <=
      Math.abs(Math.ceil(enemyPos.z) - enemyPos.z)
    ) {
      enemyZ = Math.floor(enemyPos.z);
    } else {
      enemyZ = Math.ceil(enemyPos.z);
    }
    enemyX = Math.round(enemyX/5) * 5;
    enemyZ = Math.round(enemyZ/5) * 5;
    mazeCopy[Math.floor(enemyZ / 5 + 10)][Math.floor(enemyX / 5 + 10)] = 2;
    //console.log("Enemy z " + enemyZ);
    //mazeCopy[10][10] = 3;
  
    const playerPos = player.position.clone();
    let playerX = 0;
    let playerZ = 0;
  
    // console.log(`z pos = ${playerPos.z}\nFloor = ${Math.floor(playerPos.z)}`);
    if (
      Math.abs(Math.floor(playerPos.x) - playerPos.x) <=
      Math.abs(Math.ceil(playerPos.x) - playerPos.x)
    ) {
      playerX = Math.floor(playerPos.x);
    } else {
      playerX = Math.ceil(playerPos.x);
    }
    playerX = Math.floor(playerX / 5) * 5;

    if (
      Math.abs(Math.floor(playerPos.z) - playerPos.z) <=
      Math.abs(Math.ceil(playerPos.z) - playerPos.z)
    ) {
      playerZ = Math.floor(playerPos.z);
    } else {
      playerZ = Math.ceil(playerPos.z);
    }
    playerX = Math.round(playerX/5) * 5;
    playerZ = Math.round(playerZ/5) * 5;
    mazeCopy[Math.floor(playerZ / 5 + 10)][Math.floor(playerX / 5 + 10)] = 3; // !
  
    if (
      enemyZ / 5 + 10 != playerZ / 5 + 10 ||
      enemyX / 5 + 10 != playerX / 5 + 10
    ) {
      let aStar = new AStar(mazeCopy);
      let path = aStar.findPathAStar();
  
      if (path.length > 1) {
        //path.shift();
        console.log(
          "Enemy Z: " + (enemyZ / 5 + 10) + " Enemy X: " + (enemyX / 5 + 10)
        );
        console.log(
          "Player Z: " + (playerZ / 5 + 10) + " Player Z: " + (playerX / 5 + 10)
        );
        console.log("Current path place: " + path[0]);
        console.log("Next path place: " + path[1]);
        console.log(path.length);
  
        // if ((path[0][0] !=  (enemyZ / 5 + 10)) && ((path[0][1] !=  (enemyZ / 5 + 10)))){
        //   path.shift();
        // }
  
        enemyPath.clear();
  
        for (let i = 1; i < path.length; i++) {
          enemyPath.add(
            new YUKA.Vector3(5 * (path[i][1] - 10), 1, 5 * (path[i][0] - 10))
          );
        }
        // vehicle.position.copy(enemy.position);
  
        vehicle.maxSpeed = 5;
  
        mazeCopy[Math.floor(enemyZ / 5 + 10)][Math.floor(enemyX / 5 + 10)] = 0;
        //enemy.position.copy(enemyPath.current());
  
        const followPathBehavior = new YUKA.FollowPathBehavior(enemyPath, 0.1);
        vehicle.steering.clear();
        vehicle.steering.add(followPathBehavior);
  
        const onPathBehavior = new YUKA.OnPathBehavior(enemyPath);
        vehicle.steering.add(onPathBehavior);
  
        // entityManager.clear();
        // entityManager.add(vehicle);
      }
    }
  }
}

export { NPC };
