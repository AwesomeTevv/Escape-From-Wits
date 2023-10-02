import { Component, HostListener } from '@angular/core';
import RAPIER, { ColliderDesc, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier3d';
import { CONTROLLER_BODY_RADIUS, CharacterControls } from 'src/utilities/characterControls';
import { body } from 'src/utilities/utils';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-level-one',
  templateUrl: './level-one.component.html',
  styleUrls: ['./level-one.component.css'],
})

export class LevelOneComponent {
  togglePause = false;  
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.key === "Escape"){
      console.log("Toggled Pause!\n");
      this.togglePause = !this.togglePause;  
    }
  }
}

// Scene and Renderer
const scene = new THREE.Scene(); // initialising the scene
scene.background = new THREE.Color(0x89cff0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

/**
 * Controls
 */
const orbitcontrols = new OrbitControls(camera, renderer.domElement);
// orbitcontrols.enableDamping = true;
// orbitcontrols.minDistance = 2;
// orbitcontrols.maxDistance = 3;
// orbitcontrols.enablePan = false;
// orbitcontrols.maxPolarAngle = Math.PI / 2 - 0.05;
// orbitcontrols.minPolarAngle = Math.PI / 4;
orbitcontrols.update();

const loader = new GLTFLoader();

/**
 * Environmental Lighting
 */

const dLight = new THREE.DirectionalLight('white', 0.6);
dLight.position.x = 20;
dLight.position.y = 30;
dLight.castShadow = true;
dLight.shadow.mapSize.width = 100;
dLight.shadow.mapSize.height = 100;
const d = 35;
dLight.shadow.camera.left = - d;
dLight.shadow.camera.right = d;
dLight.shadow.camera.top = d;
dLight.shadow.camera.bottom = - d;
scene.add(dLight);

const aLight = new THREE.AmbientLight('white', 0.4);
scene.add(aLight);

// const light = new THREE.AmbientLight(0x404040); // soft white light
// scene.add(light);

// // White directional light at half intensity shining from the top.
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// scene.add(directionalLight);

/**
 * Helpers
 * REMOVE AT THE END
 */
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Using Rapier module from here
let gravity = { x: 0.0, y: -9.81, z: 0.0 };
let world = new RAPIER.World(gravity);

// Bodys
const bodys: { rigid: RigidBody, mesh: THREE.Mesh }[] = [];

// Creating Ground Plane
let scale = new RAPIER.Vector3(100.0, 3.0, 100.0);
const planeGeometry = new THREE.PlaneGeometry(100,100);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;

scene.add(plane);

let groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
let groundBody = world.createRigidBody(groundBodyDesc);
let groundCollider = RAPIER.ColliderDesc.cuboid(
  50,0,50
);
world.createCollider(groundCollider,groundBody);

// Creating Some Shape
const staticB = body(scene, world, 'kinematicPositionBased', 'cube',
{ hx: 10, hy: 0.8, hz: 10 }, { x: 0, y: 2.5, z: 0 },
{ x: 0, y: 0, z: Math.PI/2 }, 'pink');
bodys.push(staticB);

const cubeBody = body(scene, world, 'dynamic', 'cube',
{ hx: 0.5, hy: 0.5, hz: 0.5 }, { x: 0, y: 15, z: 0 },
{ x: 0, y: 0.4, z: 0.7 }, 'orange');
bodys.push(cubeBody);

const sphereBody = body(scene, world, 'dynamic', 'sphere',
{ radius: 0.7 }, { x: 4, y: 15, z: 2 },
{ x: 0, y: 1, z: 0 }, 'blue');
bodys.push(sphereBody);

const sphereBody2 = body(scene, world, 'dynamic', 'sphere',
{ radius: 0.7 }, { x: 0, y: 15, z: 0 },
{ x: 0, y: 1, z: 0 }, 'red');
bodys.push(sphereBody2);

const cylinderBody = body(scene, world, 'dynamic', 'cylinder',
{ hh: 1.0, radius: 0.7 }, { x: -7, y: 15, z: 8 },
{ x: 0, y: 1, z: 0 }, 'green');
bodys.push(cylinderBody);

const coneBody = body(scene, world, 'dynamic', 'cone',
{ hh: 1.0, radius: 1 }, { x: 7, y: 15, z: -8 },
{ x: 0, y: 1, z: 0 }, 'purple');
bodys.push(coneBody);

// Character
var characterControls: CharacterControls;
loader.load('../../assets/Soldier.glb', function(gltf){
  const model = gltf.scene;
  model.traverse(function (object: any){
    if(object.isMesh){
      object.castShadow = true;
    }
  });
  model.position.set(10,0,10);
  scene.add(model);
  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: Map<string, THREE.AnimationAction> = new Map()
  gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
      animationsMap.set(a.name, mixer.clipAction(a))
  })


  // RIGID BODY
  let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(10, 0, 10)
  let rigidBody = world.createRigidBody(bodyDesc);
  let dynamicCollider = RAPIER.ColliderDesc.ball(CONTROLLER_BODY_RADIUS);
  world.createCollider(dynamicCollider, rigidBody);

  characterControls = new CharacterControls(model, mixer, 
      animationsMap, orbitcontrols, 
      camera,  'Idle',
      new RAPIER.Ray( 
          { x: 0, y: 0, z: 0 },
          { x: 0, y: -1, z: 0} 
      ),
      new RAPIER.Ray(
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 1}
        ),
      new RAPIER.Ray(
        {x: 0, y: 0, z: 0},
        {x: 1, y: 0, z: 0}
      ),rigidBody)
});

const clock = new THREE.Clock();
function animate() {
  let deltaT = clock.getDelta();

  if (characterControls) {
    characterControls.update(world, deltaT, keysPressed);
}

  world.step();
  bodys.forEach(body => {
    let position = body.rigid.translation();
    let rotation = body.rigid.rotation();

    body.mesh.position.x = position.x
    body.mesh.position.y = position.y
    body.mesh.position.z = position.z

    body.mesh.setRotationFromQuaternion(
        new THREE.Quaternion(rotation.x,
            rotation.y,
            rotation.z,
            rotation.w));
  });
 
  requestAnimationFrame(animate);
  orbitcontrols.update();
  renderer.render(scene, camera);
}
animate();

const keysPressed: any = {}
document.addEventListener('keydown', (event) => {
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    }
    keysPressed[event.key.toLowerCase()] = true
}, false);
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false
}, false);