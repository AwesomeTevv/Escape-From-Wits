import * as THREE from "three";
import * as CANNON from "cannon-es";

import { Game } from "../../utilities/Game";

/**
 * ThreeJS variables
 */
let scene;
let camera;
let renderer;

/**
 * Cannon-es variables
 */
let world;

/**
 * Game runtime
 */

init();
animate();

/**
 * Game runtime functions
 */
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  world = new CANNON.World();

  let game = new Game(scene, world);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
