import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

let scene;
let camera;
let renderer;
let stats;
let controls;

let cube;

const keyStates = {};
let mouseTime = 0;

const clock = new THREE.Clock();

init();
animate();

window.addEventListener("resize", onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener("keydown", (event) => {
  keyStates[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  keyStates[event.code] = false;
});

// document.body.addEventListener("mousedown", () => {
//   document.body.requestPointerLock();

//   mouseTime = performance.now();
// });

// document.addEventListener("mouseup", () => {});

// document.body.addEventListener("mousemove", (event) => {
//   if (document.pointerLockElement === document.body) {
//     camera.rotation.y -= event.movementX / 500;
//     camera.rotation.x -= event.movementY / 500;
//   }
// });

function worldLight() {
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(hemisphereLight);
}

function worldPlane() {
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);
}

function helpers() {
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccee);
  //   scene.fog = new THREE.Fog(0x88ccee, 0, 50);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // camera.lookAt(0, 0, 0);
  camera.position.set(10, 1, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.05;
  controls = new PointerLockControls(camera, document.body);
  controls.lock();

  worldLight();
  worldPlane();

  helpers(); // ! Temporary -- Remove at the end

  box();
}

function box() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.5, 0);
  scene.add(cube);
}

function animate() {
  requestAnimationFrame(animate);

  update();

  renderer.render(scene, camera);
}

function update() {
  var delta = clock.getDelta(); // seconds.
  var moveDistance = 10 * delta; // 10 pixels per second
  var rotateAngle = (Math.PI / 2) * delta; // pi/2 radians (90 degrees) per second

  // if (keyStates["KeyW"]) {
  //   cube.translateZ(-moveDistance);
  // }

  // if (keyStates["KeyS"]) {
  //   cube.translateZ(moveDistance);
  // }

  // if (keyStates["KeyA"]) {
  //   cube.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
  // }

  // if (keyStates["KeyD"]) {
  //   cube.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
  // }

  if (keyStates["KeyW"]) {
    controls.moveForward(moveDistance);
  }

  if (keyStates["KeyS"]) {
    controls.moveForward(-moveDistance);
  }

  if (keyStates["KeyA"]) {
    controls.moveRight(-moveDistance);
  }

  if (keyStates["KeyD"]) {
    controls.moveRight(moveDistance);
  }

  stats.update();
  // controls.update();
}
