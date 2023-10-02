import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-level-one',
  templateUrl: './level-one.component.html',
  styleUrls: ['./level-one.component.css'],
})
export class LevelOneComponent {}

const scene = new THREE.Scene(); // initialising the scene
scene.background = new THREE.Color(0x89cff0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

/**
 * Controls
 */
const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.enableDamping = true;
orbitcontrols.minDistance = 2;
orbitcontrols.maxDistance = 3;
orbitcontrols.enablePan = false;
orbitcontrols.maxPolarAngle = Math.PI / 2 - 0.05;
orbitcontrols.update();

const loader = new GLTFLoader();

/**
 * Environmental Lighting
 */

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  orbitcontrols.update();
  renderer.render(scene, camera);
}
animate();
