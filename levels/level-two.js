import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry'
import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker'
import CannonUtils from '../utilities/cannonUtils'
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
let voxels;
let controls;
const timeStep = 1 / 60;
let lastCallTime = performance.now() / 1000;
const balls = [];
const ballMeshes = [];
const boxes = [];
const boxMeshes = [];

const convexObjectBreaker = new ConvexObjectBreaker();
const bodies = [];
const meshes = [];
let meshId = 0;
let bulletId = 0;

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
      gltf.scene.traverse(function (obj){
        if(obj.isMesh){
          // var boundingBox = new THREE.Box3();
          // boundingBox.expandByObject(obj);
          // // Calculate the dimensions of the bounding box
          // var width = boundingBox.max.x - boundingBox.min.x;
          // var length = boundingBox.max.z - boundingBox.min.z;
          // var height = boundingBox.max.y - boundingBox.min.y;
          // console.log("Width: " + width + ", Length: " + length + ", Height: " + height);
        }
      });
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function worldLight() {
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
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
  // scene.fog = new THREE.Fog(0x000000, 0, 50); // Commented for dev purposes

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 0, 0);

  const light = new THREE.PointLight(0xffffff, 10, 10);
  light.castShadow = true;
  camera.add(light);

  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 500; // default

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
  const shootVelocity = 10;
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

    // balls[bulletId] = ballBody;
    // ballMeshes[bulletId] = ballMesh;
    balls.push(ballBody);
    ballMeshes.push(ballMesh);

    ballBody.addEventListener('collide', (e)=>{
      if(e.body.userData){
        if(e.body.userData.splitCount < 2){
          splitObject(e.body.userData, e.contact);
        }
      }
    });
    bulletId++;

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

  // const geo = new THREE.BoxGeometry(4,4,4);
  // const materialBreak = new THREE.MeshStandardMaterial({
  //   // color: 0xa2ffb8,
  //   color: 0xffffff,
  //   // color: 0xffffff,
  //   //reflectivity: 0.15,
  //   metalness: 1.0,
  //   roughness: 0.25,
  //   transparent: true,
  //   opacity: 0.75,
  //   //transmission: 1.0,
  //   side: THREE.DoubleSide,
  //   //clearcoat: 1.0,
  //   //clearcoatRoughness: 0.35,
  // });

  // const cube = new THREE.Mesh(geo, materialBreak);
  // scene.add(cube);
  // meshes[meshId] = cube;

  // convexObjectBreaker.prepareBreakableObject(
  //   meshes[meshId],
  //   1,
  //   new THREE.Vector3(),
  //   new THREE.Vector3(),
  //   true
  // )
  // const cubeShape = new CANNON.Box(
  //     new CANNON.Vec3(1,1,1)
  // )
  // const cubeBody = new CANNON.Body({ mass: 1 });
  // cubeBody.userData = { splitCount: 0, id: meshId }
  // cubeBody.addShape(cubeShape)
  // cubeBody.position.x = cube.position.x
  // cubeBody.position.y = cube.position.y
  // cubeBody.position.z = cube.position.z

  // world.addBody(cubeBody)
  // bodies[meshId] = cubeBody
  // meshId++

  const convexObjectBreaker = new ConvexObjectBreaker()

for (let i = 0; i < 20; i++) {
    const size = {
        x: Math.random() * 1 + 2,
        y: Math.random() * 1 + 5,
        z: Math.random() * 1 + 2,
    }
    const geo = new THREE.BoxGeometry(
        size.x,
        size.y,
        size.z
    )
    const cube = new THREE.Mesh(geo, material)

    cube.position.x = Math.random() * 50 - 25
    cube.position.y = size.y / 2 + 0.1
    cube.position.z = Math.random() * 50 - 25

    scene.add(cube)
    meshes[meshId] = cube
    convexObjectBreaker.prepareBreakableObject(
        meshes[meshId],
        1,
        new THREE.Vector3(),
        new THREE.Vector3(),
        true
    )

    const cubeShape = new CANNON.Box(
        new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    )
    const cubeBody = new CANNON.Body({ mass: 1 })
    ;(cubeBody).userData = { splitCount: 0, id: meshId }
    cubeBody.addShape(cubeShape)
    cubeBody.position.x = cube.position.x
    cubeBody.position.y = cube.position.y
    cubeBody.position.z = cube.position.z

    world.addBody(cubeBody)
    bodies[meshId] = cubeBody

    meshId++
}

}

function splitObject(userData, contact) {
  const contactId = userData.id
  if (meshes[contactId]) {
      const poi = bodies[contactId].pointToLocalFrame(
          contact.bj.position.vadd(contact.rj)
      )
      const n = new THREE.Vector3(
          contact.ni.x,
          contact.ni.y,
          contact.ni.z
      ).negate()
      const shards = convexObjectBreaker.subdivideByImpact(
          meshes[contactId],
          new THREE.Vector3(poi.x, poi.y, poi.z),
          n,
          1,
          0
      )
      
      if(meshes[contactId] && bodies[contactId]){
        scene.remove(meshes[contactId])
        delete meshes[contactId]
        world.removeBody(bodies[contactId])
        delete bodies[contactId]
      }

      shards.forEach((d) => {
          const nextId = meshId++

          scene.add(d)
          meshes[nextId] = d;
          d.geometry.scale(0.99, 0.99, 0.99)
          const shape = geometryToShape(d.geometry)

          const body = new CANNON.Body({ mass: 1 })
          body.addShape(shape);
          body.userData = {
              splitCount: userData.splitCount + 1,
              id: nextId,
          }
          body.position.x = d.position.x
          body.position.y = d.position.y
          body.position.z = d.position.z
          body.quaternion.x = d.quaternion.x
          body.quaternion.y = d.quaternion.y
          body.quaternion.z = d.quaternion.z
          body.quaternion.w = d.quaternion.w
          world.addBody(body)
          bodies[nextId] = body
        })
    }
}

function geometryToShape(geometry) {
    const position = (geometry.attributes.position).array
    const points = []
    for (let i = 0; i < position.length; i += 3) {
        points.push(
            new THREE.Vector3(position[i], position[i + 1], position[i + 2])
        )
    }
    const convexHull = new ConvexGeometry(points)
    const shape = CannonUtils.CreateConvexPolyhedron(convexHull)
    return shape
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
  let dt = clock.getDelta();
  if(dt > 0.1){
    dt = 0.1;
  }
  let diff = time - lastCallTime;
  lastCallTime = time;
  if (controls.enabled) {
    world.step(dt, diff);

    // Update ball positions
    for (let i = 0; i < balls.length; i++) {
      ballMeshes[i].position.copy(balls[i].position);
      ballMeshes[i].quaternion.copy(balls[i].quaternion);
    }

    Object.keys(meshes).forEach((m) =>{
      meshes[m].position.set(
        bodies[m].position.x,
        bodies[m].position.y,
        bodies[m].position.z,
      );
      meshes[m].quaternion.set(
        bodies[m].quaternion.x,
        bodies[m].quaternion.y,
        bodies[m].quaternion.z,
        bodies[m].quaternion.w,
      );
    });

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



// ############################## WORKING CODE BELOW ##############################
// import * as THREE from 'three'
// import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
// import Stats from 'three/examples/jsm/libs/stats.module'
// import * as CANNON from 'cannon-es'
// import CannonUtils from '../utilities/cannonUtils'
// import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry'
// import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker'
// import { Reflector } from 'three/examples/jsm/objects/Reflector'

// const scene = new THREE.Scene()

// const light1 = new THREE.DirectionalLight()
// light1.position.set(20, 20, 20)
// scene.add(light1)

// const light2 = new THREE.DirectionalLight()
// light2.position.set(-20, 20, 20)
// scene.add(light2)

// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// )

// const renderer = new THREE.WebGLRenderer({ antialias: true })
// renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement)

// const menuPanel = document.getElementById('menuPanel')
// const startButton = document.getElementById('startButton')
// startButton.addEventListener(
//     'click',
//     function () {
//         controls.lock()
//     },
//     false
// )

// const controls = new PointerLockControls(camera, renderer.domElement)
// controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
// controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))

// camera.position.y = 1
// camera.position.z = 2

// const onKeyDown = function (event) {
//     switch (event.key) {
//         case 'w':
//             controls.moveForward(0.25)
//             break
//         case 'a':
//             controls.moveRight(-0.25)
//             break
//         case 's':
//             controls.moveForward(-0.25)
//             break
//         case 'd':
//             controls.moveRight(0.25)
//             break
//     }
// }
// document.addEventListener('keydown', onKeyDown, false)

// const world = new CANNON.World()
// world.gravity.set(0, -9.82, 0)
// //;(world.solver as CANNON.GSSolver).iterations = 20
// //world.allowSleep = true

// const material = new THREE.MeshStandardMaterial({
//     //color: 0xa2ffb8,
//     color: 0xffffff,
//     //reflectivity: 0.15,
//     metalness: 1.0,
//     roughness: 0.25,
//     transparent: true,
//     opacity: 0.75,
//     //transmission: 1.0,
//     side: THREE.DoubleSide,
//     //clearcoat: 1.0,
//     //clearcoatRoughness: 0.35,
// })

// const pmremGenerator = new THREE.PMREMGenerator(renderer)
// const envTexture = new THREE.TextureLoader().load(
//     'img/pano-equirectangular.jpg',
//     () => {
//         material.envMap = pmremGenerator.fromEquirectangular(envTexture).texture
//     }
// )

// const meshes = {}
// const bodies = {}
// let meshId = 0

// const groundMirror = new Reflector(new THREE.PlaneGeometry(1024, 1024), {
//     color: new THREE.Color(0x222222),
//     clipBias: 0.003,
//     textureWidth: window.innerWidth * window.devicePixelRatio,
//     textureHeight: window.innerHeight * window.devicePixelRatio,
// })
// groundMirror.position.y = -0.05
// groundMirror.rotateX(-Math.PI / 2)
// scene.add(groundMirror)

// const planeShape = new CANNON.Plane()
// const planeBody = new CANNON.Body({ mass: 0 })
// planeBody.addShape(planeShape)
// planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
// world.addBody(planeBody)

// const convexObjectBreaker = new ConvexObjectBreaker()

// for (let i = 0; i < 20; i++) {
//     const size = {
//         x: Math.random() * 1 + 2,
//         y: Math.random() * 1 + 5,
//         z: Math.random() * 1 + 2,
//     }
//     const geo = new THREE.BoxGeometry(
//         size.x,
//         size.y,
//         size.z
//     )
//     const cube = new THREE.Mesh(geo, material)

//     cube.position.x = Math.random() * 50 - 25
//     cube.position.y = size.y / 2 + 0.1
//     cube.position.z = Math.random() * 50 - 25

//     scene.add(cube)
//     meshes[meshId] = cube
//     convexObjectBreaker.prepareBreakableObject(
//         meshes[meshId],
//         1,
//         new THREE.Vector3(),
//         new THREE.Vector3(),
//         true
//     )

//     const cubeShape = new CANNON.Box(
//         new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
//     )
//     const cubeBody = new CANNON.Body({ mass: 1 })
//     ;(cubeBody).userData = { splitCount: 0, id: meshId }
//     cubeBody.addShape(cubeShape)
//     cubeBody.position.x = cube.position.x
//     cubeBody.position.y = cube.position.y
//     cubeBody.position.z = cube.position.z

//     world.addBody(cubeBody)
//     bodies[meshId] = cubeBody

//     meshId++
// }

// const bullets = {}
// const bulletBodies = {}
// let bulletId = 0

// const bulletMaterial = new THREE.MeshPhysicalMaterial({
//     map: new THREE.TextureLoader().load('img/marble.png'),
//     clearcoat: 1.0,
//     clearcoatRoughness: 0,
//     clearcoatMap: null,
//     clearcoatRoughnessMap: null,
//     metalness: 0.4,
//     roughness: 0.3,
//     color: 'white',
// })
// document.addEventListener('click', onClick, false)
// function onClick() {
//     if (controls.isLocked) {
//         const bullet = new THREE.Mesh(
//             new THREE.SphereGeometry(1, 16, 16),
//             bulletMaterial
//         )
//         bullet.position.copy(camera.position)
//         scene.add(bullet)
//         bullets[bulletId] = bullet

//         const bulletShape = new CANNON.Sphere(1)
//         const bulletBody = new CANNON.Body({ mass: 1 })
//         bulletBody.addShape(bulletShape)
//         bulletBody.position.x = camera.position.x
//         bulletBody.position.y = camera.position.y
//         bulletBody.position.z = camera.position.z

//         world.addBody(bulletBody)
//         bulletBodies[bulletId] = bulletBody

//         bulletBody.addEventListener('collide', (e) => {
//             if (e.body.userData) {
//                 if (e.body.userData.splitCount < 2) {
//                     splitObject(e.body.userData, e.contact)
//                 }
//             }
//         })
//         const v = new THREE.Vector3(0, 0, -1)
//         v.applyQuaternion(camera.quaternion)
//         v.multiplyScalar(50)
//         bulletBody.velocity.set(v.x, v.y, v.z)
//         bulletBody.angularVelocity.set(
//             Math.random() * 10 + 1,
//             Math.random() * 10 + 1,
//             Math.random() * 10 + 1
//         )

//         bulletId++

//         //remove old bullets
//         while (Object.keys(bullets).length > 5) {
//             scene.remove(bullets[bulletId - 6])
//             delete bullets[bulletId - 6]
//             world.removeBody(bulletBodies[bulletId - 6])
//             delete bulletBodies[bulletId - 6]
//         }
//     }
// }

// function splitObject(userData, contact) {
//     const contactId = userData.id
//     if (meshes[contactId]) {
//         const poi = bodies[contactId].pointToLocalFrame(
//             (contact.bj.position).vadd(contact.rj)
//         )
//         const n = new THREE.Vector3(
//             contact.ni.x,
//             contact.ni.y,
//             contact.ni.z
//         ).negate()
//         const shards = convexObjectBreaker.subdivideByImpact(
//             meshes[contactId],
//             new THREE.Vector3(poi.x, poi.y, poi.z),
//             n,
//             1,
//             0
//         )

//         scene.remove(meshes[contactId])
//         delete meshes[contactId]
//         world.removeBody(bodies[contactId])
//         delete bodies[contactId]

//         shards.forEach((d) => {
//             const nextId = meshId++

//             scene.add(d)
//             meshes[nextId] = d
//             ;(d).geometry.scale(0.99, 0.99, 0.99)
//             const shape = gemoetryToShape((d).geometry)

//             const body = new CANNON.Body({ mass: 1 })
//             body.addShape(shape)
//             ;(body).userData = {
//                 splitCount: userData.splitCount + 1,
//                 id: nextId,
//             }
//             body.position.x = d.position.x
//             body.position.y = d.position.y
//             body.position.z = d.position.z
//             body.quaternion.x = d.quaternion.x
//             body.quaternion.y = d.quaternion.y
//             body.quaternion.z = d.quaternion.z
//             body.quaternion.w = d.quaternion.w
//             world.addBody(body)
//             bodies[nextId] = body
//         })
//     }
// }

// function gemoetryToShape(geometry) {
//     const position = (geometry.attributes.position).array
//     const points = []
//     for (let i = 0; i < position.length; i += 3) {
//         points.push(
//             new THREE.Vector3(position[i], position[i + 1], position[i + 2])
//         )
//     }
//     const convexHull = new ConvexGeometry(points)
//     const shape = CannonUtils.CreateConvexPolyhedron(convexHull)
//     return shape
// }

// window.addEventListener('resize', onWindowResize, false)
// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight
//     camera.updateProjectionMatrix()
//     renderer.setSize(window.innerWidth, window.innerHeight)
//     render()
// }

// const stats = new Stats()
// document.body.appendChild(stats.dom)

// const options = {
//     side: {
//         FrontSide: THREE.FrontSide,
//         BackSide: THREE.BackSide,
//         DoubleSide: THREE.DoubleSide,
//     },
// }

// const clock = new THREE.Clock()
// let delta

// function animate() {
//     requestAnimationFrame(animate)

//     delta = clock.getDelta()
//     if (delta > 0.1) delta = 0.1
//     world.step(delta)

//     Object.keys(meshes).forEach((m) => {
//         meshes[m].position.set(
//             bodies[m].position.x,
//             bodies[m].position.y,
//             bodies[m].position.z
//         )
//         meshes[m].quaternion.set(
//             bodies[m].quaternion.x,
//             bodies[m].quaternion.y,
//             bodies[m].quaternion.z,
//             bodies[m].quaternion.w
//         )
//     })

//     Object.keys(bullets).forEach((b) => {
//         bullets[b].position.set(
//             bulletBodies[b].position.x,
//             bulletBodies[b].position.y,
//             bulletBodies[b].position.z
//         )
//         bullets[b].quaternion.set(
//             bulletBodies[b].quaternion.x,
//             bulletBodies[b].quaternion.y,
//             bulletBodies[b].quaternion.z,
//             bulletBodies[b].quaternion.w
//         )
//     })

//     render()

//     stats.update()
// }

// function render() {
//     renderer.render(scene, camera)
// }

// animate()