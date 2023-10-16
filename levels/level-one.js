import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";

import { PointerLockControlsCannon } from "../utilities/PointerLockControlsCannon";
import { VoxelLandscape } from "../utilities/VoxelLandscape.js";

let scene;
let camera;
let renderer;
let stats;

let mapCamera;
let mapCanvas;
let rendererMap;

let skybox;
const skyboxImage = "nebula3/nebula3";

const modelLoader = new GLTFLoader();

// let controls;
// let material = new THREE.MeshPhongMaterial({ color: 0xdddddd });
// let material = new THREE.MeshNormalMaterial();
const clock = new THREE.Clock();
const loader = new THREE.TextureLoader();

const vmap = loader.load("/assets/gold/MetalGoldPaint002_COL_1K_METALNESS.png");

const vbmap = loader.load(
  "/assets/gold/MetalGoldPaint002_BUMP_1K_METALNESS.png"
);

const vdmap = loader.load(
  "/assets/gold/MetalGoldPaint002_DISP_1K_METALNESS.png"
);

vmap.wrapS = vmap.wrapT = THREE.RepeatWrapping;
vmap.repeat.set(50, 50);

vbmap.wrapS = vbmap.wrapT = THREE.RepeatWrapping;
vbmap.repeat.set(50, 50);

vdmap.wrapS = vdmap.wrapT = THREE.RepeatWrapping;
vdmap.repeat.set(50, 50);

let material = new THREE.MeshPhongMaterial({
  specular: 0x666666,
  shininess: 10,
  bumpMap: vbmap,
  bumpScale: 0.5,
  displacementMap: vdmap,
  displacementScale: 0.01,
  map: vmap,
});

// let mirrorSphereCamera;
// let mirrorSphere;

let world = new CANNON.World();
let sphereShape = new CANNON.Sphere();
let sphereBody = new CANNON.Body();
let physicsMaterial = new CANNON.Material();
let torch;
let torchTarget;
let toggleSword = true;
let sword;
let voxels;
let controls;
const timeStep = 1 / 60;
let lastCallTime = performance.now() / 1000;

const balls = [];
const ballMeshes = [];
const boxes = [];
const boxMeshes = [];

// Number of voxels
const nx = 100;
const ny = 4;
const nz = 100;

// Scale of voxels
const sx = 1;
const sy = 1;
const sz = 1;

init();
animate();

window.addEventListener("resize", onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function maze() {
  modelLoader.load(
    "/assets/mcMaze.glb",
    function (gltf) {
      gltf.scene.position.set(0, 1, 0);
      gltf.scene.castShadow = true;
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}


function loadSword(){
  modelLoader.load('/assets/weapons/gun.glb',function(gltf){
    sword = gltf.scene;
    // sword.traverse((node) =>{
  
    //   if(node.isMesh){
    //     sceneMeshes.push(node);
    //     // node.material.wireframe = true;
    //   }
    // })
    
    sword.scale.set(3,3,3)
    camera.add(sword)
    sword.position.y = sword.position.y - 0.7
    sword.position.z = sword.position.z - 0.9
    sword.position.x = sword.position.x + 0.3
    sword.rotation.x = Math.PI/15
    //body.add(sword)
  });
}

function generateCharacterEquipment(){
  let gunlight;
  let gunTarget;
  torch = new THREE.SpotLight( 0xffffff, 200.0, 20, Math.PI* 0.08);
  gunlight = new THREE.SpotLight( 0xffffff, 10.0, 1);
  torch.castShadow = true;
 
  
 
   torchTarget = new THREE.Object3D();
   gunTarget = new THREE.Object3D();
 //important, set the intitial position of the target in front of the character so that when it moves, it always remains in front of it
  torchTarget.position.set(0,1,-2);
  gunTarget.position.set(camera.position.x,camera.position.y,camera.position.z)
  camera.add(torchTarget);
  camera.add(gunTarget);
  torch.target = torchTarget;
  //gunlight.target = gunTarget;
  camera.add(torch);
  //camera.add(gunlight);
  torch.position.z = torch.position.z + 5;
  //gunlight.position.y = gunlight.position.y ;
  // gunlight.target.position.z = camera.position.z;
  // gunlight.target.position.y = camera.position.y;
  //torch.position.y = torch.position.y 
  
 
 }

function worldLight() {
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0x808080, 0x080820, 1);
  scene.add(hemisphereLight);

  // const helper = new THREE.HemisphereLightHelper(hemisphereLight, 5);
  // scene.add(helper);
}

function worldPlane() {
  // Loading in textures
  const map = loader.load("/assets/ground/GroundDirtRocky020_COL_1K.jpg");
  const bmap = loader.load("/assets/ground/GroundDirtRocky020_BUMP_1K.jpg");
  const dmap = loader.load("/assets/ground/GroundDirtRocky020_DISP_1K.jpg");

  const scale = 500;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(scale, scale);

  bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
  bmap.repeat.set(scale, scale);

  dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
  dmap.repeat.set(scale, scale);

  const geometry = new THREE.PlaneGeometry(1000, 1000);

  const material = new THREE.MeshPhongMaterial({
    specular: 0x666666,
    shininess: 25,
    bumpMap: bmap,
    bumpScale: 0.5,
    displacementMap: dmap,
    displacementScale: 0.1,
    map: map,
  });

  // Finished loading in textures

  // const material = new THREE.MeshPhongMaterial({color: 0xff86});

  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);
}

function createPathStrings(filename) {
  const basePath = "/assets/skybox/";
  const baseFilename = basePath + filename;
  const fileType = ".png";
  const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
  const pathStings = sides.map((side) => {
    return baseFilename + "_" + side + fileType;
  });

  return pathStings;
}
function createMaterialArray(filename) {
  const skyboxImagepaths = createPathStrings(filename);
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = loader.load(image);
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      fog: false,
      transparent: true,
      opacity: 0.5,
    });
  });
  return materialArray;
}

function initSkybox() {
  const materialArray = createMaterialArray(skyboxImage);
  const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
  skybox = new THREE.Mesh(skyboxGeometry, materialArray);
  scene.add(skybox);
}

function helpers() {
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
}

function init() {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x88ccee);
  scene.background = new THREE.Color(0x000000);
  // scene.fog = new THREE.Fog(0x88ccee, 0, 50);
  scene.fog = new THREE.Fog(0x000000, 0, 50); // Commented for dev purposes

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 0, 0);

  // var light = new THREE.SpotLight(0xffffff);
  // light.castShadow = true;
  
  // camera.add(light);
  loadSword();
  generateCharacterEquipment();

  // light.shadow.mapSize.width = 512; // default
  // light.shadow.mapSize.height = 512; // default
  // light.shadow.camera.near = 0.5; // default
  // light.shadow.camera.far = 500; // default

  // orthographic cameras
  mapCamera = new THREE.OrthographicCamera(
    window.innerWidth / -25, // Left
    window.innerWidth / 25, // Right
    window.innerHeight / 25, // Top
    window.innerHeight / -25, // Bottom
    -5000, // Near
    10000
  ); // Far
  // mapCamera.up = new THREE.Vector3(0,0,-1);
  mapCamera.lookAt(new THREE.Vector3(0, -1, 0));
  mapCamera.position.set(0, 5, 0);
  scene.add(mapCamera);
  mapCanvas = document.getElementById("minimap");
  rendererMap = new THREE.WebGLRenderer({ canvas: mapCanvas });
  rendererMap.setSize(200, 200);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.body.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.05;

  initCannon();
  initPointerLock();

  initSkybox();
  worldLight();
  worldPlane();

  helpers(); // ! Temporary -- Remove at the end

  maze();
  
}

function initCannon() {
  // Setup world
  world = new CANNON.World();

  // Tweak contact properties.
  // Contact stiffness - use to make softer/harder contacts
  world.defaultContactMaterial.contactEquationStiffness = 1e9;

  // Stabilization time in number of timesteps
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  const solver = new CANNON.GSSolver();
  solver.iterations = 7;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);
  // use this to test non-split solver
  // world.solver = solver

  world.gravity.set(0, -20, 0);

  world.broadphase.useBoundingBoxes = true;

  // Create a slippery material (friction coefficient = 0.0)
  physicsMaterial = new CANNON.Material("physics");
  const physics_physics = new CANNON.ContactMaterial(
    physicsMaterial,
    physicsMaterial,
    {
      friction: 0.4,
      restitution: 0.3,
    }
  );

  // We must add the contact materials to the world
  world.addContactMaterial(physics_physics);

  // Create the user collision sphere
  const radius = 1.3;
  sphereShape = new CANNON.Sphere(radius);
  sphereBody = new CANNON.Body({ mass: 5, material: physics_physics });
  sphereBody.addShape(sphereShape);
  sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5);
  sphereBody.linearDamping = 0.9;
  world.addBody(sphereBody);

  // Create the ground plane
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0, material: physics_physics });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Voxels
  // VoxelsWorld();

  // The shooting balls
  const shootVelocity = 25;
  const ballShape = new CANNON.Sphere(0.2);
  const ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);

  // Returns a vector pointing the the diretion the camera is at
  function getShootDirection() {
    const vector = new THREE.Vector3(0, 0, 1);
    vector.unproject(camera);
    const ray = new THREE.Ray(
      sphereBody.position,
      vector.sub(sphereBody.position).normalize()
    );
    return ray.direction;
  }

  window.addEventListener("click", (event) => {
    if (!controls.enabled) {
      return;
    }

    const ballBody = new CANNON.Body({ mass: 1 });
    ballBody.addShape(ballShape);
    const ballMesh = new THREE.Mesh(ballGeometry, material);

    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;

    world.addBody(ballBody);
    scene.add(ballMesh);
    balls.push(ballBody);
    ballMeshes.push(ballMesh);

    const shootDirection = getShootDirection();
    ballBody.velocity.set(
      shootDirection.x * shootVelocity,
      shootDirection.y * shootVelocity,
      shootDirection.z * shootVelocity
    );

    // Move the ball outside the player sphere
    const x =
      sphereBody.position.x +
      shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius);
    const y =
      sphereBody.position.y +
      shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius);
    const z =
      sphereBody.position.z +
      shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius);
    ballBody.position.set(x, y, z);
    ballMesh.position.copy(ballBody.position);
  });

  // Create the user collision sphere

  // const mirrorRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
  //   generateMipmaps: true,
  //   minFilter: THREE.LinearMipMapLinearFilter,
  // });
  // var sphereGeom = new THREE.SphereGeometry(2, 32, 16); // radius, segmentsWidth, segmentsHeight
  // // mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
  // mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, mirrorRenderTarget);
  // scene.add(mirrorSphereCamera);
  // var mirrorSphereMaterial = new THREE.MeshBasicMaterial({
  //   envMap: mirrorSphereCamera.renderTarget.texture,
  // });
  // mirrorSphere = new THREE.Mesh(sphereGeom, mirrorSphereMaterial);
  // mirrorSphere.position.set(2, 2, 0);
  // mirrorSphereCamera.position.copy(mirrorSphere.position);
  // scene.add(mirrorSphere);
}

function initPointerLock() {
  controls = new PointerLockControlsCannon(camera, sphereBody);
  scene.add(controls.getObject());

  instructions.addEventListener("click", () => {
    controls.lock();
  });

  controls.addEventListener("lock", () => {
    controls.enabled = true;
    instructions.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    controls.enabled = false;
    instructions.style.display = null;
  });
}

function animate() {
  requestAnimationFrame(animate);

  skybox.rotation.x += 0.0005;
  skybox.rotation.y += 0.0005;

  const time = performance.now() / 1000;
  const dt = time - lastCallTime;
  lastCallTime = time;

  if (controls.enabled) {
    world.step(timeStep, dt);

    // Update ball positions
    for (let i = 0; i < balls.length; i++) {
      ballMeshes[i].position.copy(balls[i].position);
      ballMeshes[i].quaternion.copy(balls[i].quaternion);
    }

    // // Update box positions
    // for (let i = 0; i < voxels.boxes.length; i++) {
    //   boxMeshes[i].position.copy(voxels.boxes[i].position);
    //   boxMeshes[i].quaternion.copy(voxels.boxes[i].quaternion);
    // }
  }

  let pos = sphereBody.position.clone();
  mapCamera.position.x = pos.x;
  mapCamera.position.z = pos.z;
  mapCamera.lookAt(new THREE.Vector3(pos.x, -1, pos.z));
  // let rot = camera.rotation.clone();
  // mapCamera.rotation.y = rot.y;

  // mirrorSphere.visible = false;
  // mirrorSphereCamera.update(renderer, scene);
  // mirrorSphere.visible = true;

  controls.update(dt);
  stats.update();
  renderer.render(scene, camera);
  rendererMap.render(scene, mapCamera);
  // if (torch === null || torch === undefined){
  //   generateCharacterEquipment();
  //  // sphereBody.add(torch);
  // }
}

function VoxelsWorld() {
  // Voxels
  voxels = new VoxelLandscape(world, nx, ny, nz, sx, sy, sz);

  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        let filled = true;

        // Insert map constructing logic here
        if (Math.sin(i * 0.1) * Math.sin(k * 0.1) < (j / ny) * 2 - 1) {
          filled = false;
        }

        voxels.setFilled(i, j, k, filled);
      }
    }
  }

  voxels.update();

  console.log(`${voxels.boxes.length} voxel physics bodies`);

  // Voxel meshes
  for (let i = 0; i < voxels.boxes.length; i++) {
    const box = voxels.boxes[i];
    const voxelGeometry = new THREE.BoxGeometry(
      voxels.sx * box.nx,
      voxels.sy * box.ny,
      voxels.sz * box.nz
    );
    const voxelMesh = new THREE.Mesh(voxelGeometry, material);
    voxelMesh.castShadow = true;
    voxelMesh.receiveShadow = true;
    boxMeshes.push(voxelMesh);
    scene.add(voxelMesh);
  }
}
