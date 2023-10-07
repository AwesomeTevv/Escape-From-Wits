import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";

let scene;
let camera;
let renderer;

const clock = new THREE.Clock();

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
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccee);
  scene.fog = new THREE.Fog(0x88ccee, 0, 50);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  worldLight();
  worldPlane();

  helpers(); // ! Temporary -- Remove at the end
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

init();

animate();
