// ThreeJS Imports
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ConvexObjectBreaker } from "three/examples/jsm/misc/ConvexObjectBreaker";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";

// Cannon-ES Imports
import * as CANNON from "cannon-es";
import { PointerLockControlsCannon } from "./PointerLockControlsCannon";

// YUKA Imports
import * as YUKA from "yuka";

// Custom Classes
import Token from "./tokens";
import { NPC } from "./NPC";
import CannonUtils from "./cannonUtils";
import { Decorator } from "./Decorator";

/**
 * Base game class.
 *
 * Game class that implements the base functionality for each game.
 */
class Game {
  /**
   * Constructor for the game.
   *
   * Sets up the base initialising for the game.
   *
   * @param {string} skyboxImage Path to the skybox image assets
   * @param {string} wallTexture Path to the wall texture image assets
   * @param {string} groundTexture Path to the ground texture image assets
   * @param {string} exitTexture Path to the exit texture image assets
   * @param {boolean} dynamicSkybox Whether or not the skybox should be dynamic
   */
  constructor(
    skyboxImage, // Path to skybox image assets
    wallTexture, // Path to the wall image assets
    groundTexture, // Path to the ground image assets
    bulletTexture, // Path to the bullet imagee assets
    exitTexture, // Path to the entrance and exit image assets
    dynamicSkybox // Whether or not the skybox should be dynamic
  ) {
    /**@type {THREE.Scene} */
    this.scene = null; // Main ThreeJS Scene
    /**@type {THREE.Scene} */
    this.minimapScene = null; // Minimap ThreeJS Scene
    /**@type {THREE.Scene} */
    this.scopeScene = null; // "Thermal" Scope ThreeJS Scene

    /**@type {THREE.Renderer} */
    this.renderer = null; // ThreeJS Renderer
    /**@type {THREE.Renderer} */
    this.rendererMap = null; // The Minimap at the top right of the screen
    /**@type {THREE.Renderer} */
    this.renderScope = null;

    /**@type {THREE.PerspectiveCamera} */
    this.camera = null; // ThreeJS Perspective Camera for First Person View
    /**@type {THREE.OrthographicCamera} */
    this.mapCamera = null; // ThreeJS Orthographic Camera for the Minimap

    /**@type {PointerLockControlsCannon} */
    this.controls = null; // Character/FPS controls

    /**@type {CANNON.World} */
    this.world = null; // CannonJS Physics World

    /**@type {Stats} */
    this.stats = null; // ThreeJS Addon: Stats -- Appears at the top left of the screen

    /**@type {THREE.Mesh} */
    this.skybox = null; // The skybox for the game
    /**@type {string} */
    this.skyboxImage = skyboxImage; // Skybox image path
    /**@type {boolean} */
    this.dynamicSkybox = dynamicSkybox;

    /**@type {THREE.EffectComposer} */
    this.composer = null;

    /**@type {string} */
    this.wallTexture = wallTexture; // Path to the wall texture assets
    /**@type {THREE.Material} */
    this.wallMaterial = null; // ThreeJS material for the walls
    /**@type {number} */
    this.wallHeight = 50; // Height of the maze walls -- Adjust accordingly to the feel of the game

    /**@type {string} */
    this.groundTexture = groundTexture;
    /**@type {string} */
    this.bulletTexture = bulletTexture;
    /**@type {string} */
    this.exitTexture = exitTexture;

    /**@type {THREE.Mesh} */
    this.glassMaterial = null;

    /**@type {number[][]} */
    this.maze = null; // The generated maze of the game

    /**@type {{mesh: THREE.Mesh, body: CANNON.Body}} */
    this.exitDoor = {
      mesh: null, // The mesh of the exit door
      body: null, // The body of the exit door
    };

    /**@type {{mesh: THREE.Mesh, body: CANNON.Body}} */
    this.entryDoor = {
      mesh: null, // The mesh of the exit door
      body: null, // The body of the exit door
    };

    /**@type {number} */
    this.gateNumber = 0; // Frame number for animating the entrance and exit walls upwards
    /**@type {number} */
    this.gateFallNumber = 0; // Frame number for animating the entrance wall downwards
    /**@type {boolean} */
    this.animateGateOpen = false; // boolean indicating whether or not to animate the gate

    /**@type {number} */
    this.frameNumber = 0; // Stores the current frame number

    /**@type {CANNON.Body[]} */
    this.ballBodies = []; // List storing the physics bodies of the projectile balls
    /**@type {THREE.Mesh[]} */
    this.ballMeshes = []; // List storing the meshes of the projectile balls for the main scene
    /**@type {THREE.Mesh[]} */
    this.scopeBallMeshes = []; // List storing the meshes of the projectile balls for the scope scene

    /**@type {number} */
    this.lastCallTime = 0; // Stores the last time of call

    /**@type {CANNON.Body} */
    this.player = null; // Cannon-es physics body of the player
    /**@type {number} */
    this.playerLives = 3; // Amount of lives the player has
    /**@type {number} */
    this.healthSize = 100; // Maximum health of the player
    /**@type {number} */
    this.currentHealth = this.healthSize; // Set the current health to the maximum

    /**@type {Token} */
    this.gun = null; // Stores all the information about the gun

    /**@type {THREE.SpotLight} */
    this.torch = null; // Torch for the game
    /**@type {THREE.Object3D} */
    this.torchTarget = null; // Target for the torch to look at

    /**@type {number} */
    this.numberOfKeys = 0; // The number of keys the player currently has
    /**@type {number} */
    this.totalKeys = 1; // The total number of keys present in the level
    /**@type {Token[]} */
    this.tokens = []; // List storing all the tokens of the game
    /**@type {boolean} */
    this.notEnoughKeys = false;
    /**@type {number} */
    this.timerKeys = 0;

    /**@type {THREE.AudioListener} */
    this.AudioListener = null; // Handles all the audio for the game
    /**@type {THREE.Audio} */
    this.staticNoise = null; // The static noise that is present at all times of the game
    /**@type {THREE.Audio} */
    this.ambientNoise = null; // The ambient noise that is present at all times of the game
    /**@type {THREE.Audio} */
    this.complimentNoise = null; // The compliment noise that is present at all times of the game
    /**@type {THREE.Audio} */
    this.npcDeathNoise = null; // The sound the NPC makes at random point. Positional audio
    /**@type {THREE.Audio} */
    this.gateNoiseEntrance = null; // The sound the entrance gate makes when moving. Positional audio
    /**@type {THREE.Audio} */
    this.gateNoiseExit = null; // The sound the entrance gate makes when moving. Positional audio
    /**@type {THREE.Audio} */
    this.gunNoise = null; // The sound the gun makes when shooting

    /**@type {ConvexObjectBreaker} */
    this.convexObjectBreaker = null; // Convex Object breaker
    /**@type {THREE.Mesh[]} */
    this.breakableMeshes = []; // A list that stores the meshes of all the objects that can break
    /**@type {CANNON.Body[]} */
    this.breakableBodies = []; // A list that stores the bodies of all the objects that can break
    /**@type {number} */
    this.breakableMeshID = 0; // The ID of the breakable mesh

    /**@type {boolean} */
    this.restartBoolean = false; // Indicates whether or not to restart
    /** @type {number}*/
    this.restartCounter = 0; // The number of times the player has restarted

    //Variables for scoping in
    /**@type {boolean} */
    this.isRightMouseDown = false; // Indicates whether the player is right-clicking their mouse
    /**@type {number} */
    this.zoomFactor = 1.2; // Amount the camera zooms in by when scoping

    /*
     * NPC Variables
     */
    /**@type {CANNON.Body[]} */
    this.enemyBody = []; // A list storing the bodies of all enemy NPC's
    /** @type {THREE.Mesh[]} */
    this.enemy = []; // A list storing the meshes of all enemy NPC's
    /** @type {THREE.Mesh[]} */
    this.scopeEnemy = []; // A list storing the meshes of all enemy NPC's for the thermal vision scope
    /** @type {YUKA.Vehicle[]} */
    this.vehicle = []; // A list storing the YUKA vehicles of all enemy NPC's
    /** @type {YUKA.EntityManager[]} */
    this.entityManager = []; // A list storing the entity managers of all enemy NPC's
    /** @type {YUKA.Time[]}*/
    this.time = [];
    /** @type {YUKA.Path[]} */
    this.enemyPath = []; // Stores the paths of the enemy NPC's

    /** @type {NPC[]} */
    this.npcArr = []; // A list that stores all the NPC's
    /**@type {Number[]} */
    this.npcDeathFrames = [0, 0, 0]; // A list that stores the death frames for each NPC
    /**@type {Boolean[]} */
    this.npcAnimateDeath = [false, false, false]; // A list that stores whether or we animate the deaths of each respective NPC
    /**@type {Number} */
    this.npcId = 0; // The ID of the NPC
    /**@type {boolean} */
    this.hasReloaded = false; // Indicates whether the player has reloaded

    /**@type {boolean} */
    this.liftWall = false; // Whether or not to lift the exit wall

    /**@type {string} */
    this.nextLevel = "/levels/Second-Year/First-Year.html";

    // Init funcions to build the game
    this._Init(); // Initialises the game world
    this._BuildWorld(); // Builds the game world
    this._BuildLights(); // Adds lighting to the game world
    this._AddCharacter(); // Adds the playable character to the game world
    this._BindShooting(); // Binds the shooting feature
    this._AddMaze(); // Adds the maze to the game world
    this._AddTriggerBoxes(); // Adds the trigger boxes for the game world
    this._AddCharacterEquipment(); // Adds the character equipment to the game world
    this._AddTokens(); // Add the tokens to the game world
    this._DecorateLevel(); // Decorates the game world

    this._Animate = this._Animate.bind(this);
    this._Animate(); // Animates the game

    // Event listener for resizing the page
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * Initialisation function.
   *
   * Sets up and defines the basic components of the game world/scene.
   */
  _Init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 1, 10);

    this.minimapScene = new THREE.Scene();
    this.minimapScene.background = new THREE.Color(0x000011);

    this.scopeScene = new THREE.Scene();
    this.scopeScene.background = new THREE.Color(0x000066);

    let scopeCanvas = document.getElementById("scope");
    this.renderScope = new THREE.WebGLRenderer({
      canvas: scopeCanvas,
      antialias: true,
    });
    this.renderScope.setPixelRatio(window.devicePixelRatio);
    this.renderScope.setSize(
      window.innerHeight - 100,
      window.innerHeight - 100
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, 0);

    this.mapCamera = new THREE.OrthographicCamera(
      window.innerWidth / -25, // Left
      window.innerWidth / 25, // Right
      window.innerHeight / 25, // Top
      window.innerHeight / -25, // Bottom
      -5000, // Near
      10000 // Far
    );
    this.mapCamera.zoom = 3;
    this.mapCamera.lookAt(new THREE.Vector3(0, -1, 0));
    this.mapCamera.position.set(0, 5, 0);
    this.scene.add(this.mapCamera);
    let mapCanvas = document.getElementById("minimap");
    this.rendererMap = new THREE.WebGLRenderer({ canvas: mapCanvas });
    this.rendererMap.setSize(200, 200);

    this.composer = new EffectComposer(this.renderer);

    const scopeGeometry = new THREE.BoxGeometry(1.2, 1.5, 1.2);
    const scopeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const scopeEnemyMesh = new THREE.Mesh(scopeGeometry, scopeMaterial);
    scopeEnemyMesh.position.set(2000, 0, 2000);
    this.scopeScene.add(scopeEnemyMesh);
    this.scopeScene.add(scopeEnemyMesh);
    this.scopeScene.add(scopeEnemyMesh);
    this.scopeEnemy.push(scopeEnemyMesh);
    this.scopeEnemy.push(scopeEnemyMesh);
    this.scopeEnemy.push(scopeEnemyMesh);

    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    document.body.appendChild(this.stats.domElement);

    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.8, 0),
    });

    const materialArray = this.createMaterialArray(this.skyboxImage);
    const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    this.skybox = new THREE.Mesh(skyboxGeometry, materialArray);
    this.scene.add(this.skybox);

    // Loading in textures
    const loader = new THREE.TextureLoader();
    const base = "../../assets/textures/wallTextures/" + this.wallTexture;
    const map = loader.load(base + "_COL_2K.png");
    const bmap = loader.load(base + "_BUMP_2K.png");
    const dmap = loader.load(base + "_DISP_2K.png");
    const nmap = loader.load(base + "_NRM_2K.png");
    const amap = loader.load(base + "_AO_2K.png");

    const scale = 1;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(scale, (this.wallHeight / 5) * scale);
    map.mapping = THREE.CubeRefractionMapping;

    bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
    dmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    nmap.wrapS = nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    amap.wrapS = amap.wrapT = THREE.RepeatWrapping;
    amap.repeat.set(scale, (this.wallHeight / 5) * scale);

    this.wallMaterial = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 15,
      bumpMap: bmap,
      bumpScale: 15,
      displacementMap: dmap,
      displacementScale: 0,
      normalMap: nmap,
      aoMap: amap,
      aoMapIntensity: 1,
      map: map,
      depthTest: true,
      refractionRatio: 0.1,
    });

    const gnmap = loader.load(
      "../../assets/textures/glassTexture/DirtWindowStains005_NRM_1K.jpg"
    );
    const gamap = loader.load(
      "../../assets/textures/glassTexture/DirtWindowStains005_ALPHAMASKED_1K.png"
    );
    const ggmap = loader.load(
      "../../assets/textures/glassTexture/DirtWindowStains005_GLOSS_1K.jpg"
    );
    nmap.wrapS = THREE.RepeatWrapping;
    nmap.wrapT = THREE.RepeatWrapping;
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      metalness: 0,
      roughness: 0.1,
      transmission: 1,
      thickness: 0.5,
      normalMap: gnmap,
      clearcoatNormalMap: gnmap,
      alphaMap: gamap,
      sheenColorMap: ggmap,
      reflectivity: 1,
    });

    /*
     * Audio Initialisation
     */
    this.AudioListener = new THREE.AudioListener();
    this.camera.add(this.AudioListener);

    this.staticNoise = new THREE.Audio(this.AudioListener);
    this.ambientNoise = new THREE.Audio(this.AudioListener);
    this.complimentNoise = new THREE.Audio(this.AudioListener);
    this.npcDeathNoise = new THREE.Audio(this.AudioListener);
    this.gateNoiseEntrance = new THREE.PositionalAudio(this.AudioListener);
    this.gateNoiseExit = new THREE.PositionalAudio(this.AudioListener);
    this.gunNoise = new THREE.Audio(this.AudioListener);
    this.damageNoise = new THREE.Audio(this.AudioListener);

    new THREE.AudioLoader().load(
      "../../assets/sounds/tomb_door-95246.mp3",
      (buffer) => {
        this.gateNoiseEntrance.setBuffer(buffer);
        this.gateNoiseEntrance.setLoop(false);
        this.gateNoiseEntrance.setVolume(2);
        this.gateNoiseEntrance.setRefDistance(1);
      }
    );

    new THREE.AudioLoader().load(
      "../../assets/sounds/tomb_door-95246.mp3",
      (buffer) => {
        this.gateNoiseExit.setBuffer(buffer);
        this.gateNoiseExit.setLoop(false);
        this.gateNoiseExit.setVolume(2);
        this.gateNoiseExit.setRefDistance(1);
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/scary-creaking-knocking-wood-6103.mp3",
      (buffer) => {
        this.complimentNoise.setBuffer(buffer);
        this.complimentNoise.setLoop(true);
        this.complimentNoise.setVolume(0.1);
        this.complimentNoise.play();
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/vinyl-crackle-33rpm-6065.mp3",
      (buffer) => {
        this.staticNoise.setBuffer(buffer);
        this.staticNoise.setLoop(true);
        this.staticNoise.setVolume(0.05);
        this.staticNoise.play();
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/thriller-ambient-14563.mp3",
      (buffer) => {
        this.ambientNoise.setBuffer(buffer);
        this.ambientNoise.setLoop(true);
        this.ambientNoise.setVolume(0.1);
        this.ambientNoise.play();
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/demonic-woman-scream-6333.mp3",
      (buffer) => {
        this.npcDeathNoise.setBuffer(buffer);
        this.npcDeathNoise.setLoop(false);
        this.npcDeathNoise.setVolume(0.1);
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/meaty-gunshot-101257.mp3",
      (buffer) => {
        this.gunNoise.setBuffer(buffer);
        this.gunNoise.setLoop(false);
        this.gunNoise.setVolume(0.25);
      }
    );
    new THREE.AudioLoader().load(
      "../../assets/sounds/heartbeat-with-deep-breaths-55210.mp3",
      (buffer) => {
        this.damageNoise.setBuffer(buffer);
        this.damageNoise.setLoop(false);
        this.damageNoise.setVolume(0.7);
      }
    );

    this.convexObjectBreaker = new ConvexObjectBreaker();
  }

  /**
   * Defines the physical world of the game.
   *
   * Sets and defines the friction that the world obeys.
   * Adds the default contact material to the game's physics world.
   * Sets up the ground plane as well as the textures for the ground plane.
   */
  _BuildWorld() {
    // Contact stiffness - use to make softer/harder contacts
    this.world.defaultContactMaterial.contactEquationStiffness = 1e9;

    // Stabilization time in number of timesteps
    this.world.defaultContactMaterial.contactEquationRelaxation = 4;
    this.world.broadphase.useBoundingBoxes = true;

    // Create friction material:
    let physicsMaterial = new CANNON.Material("physics");
    const physicsContactMat = new CANNON.ContactMaterial(
      physicsMaterial,
      physicsMaterial,
      {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
      }
    );
    this.world.addContactMaterial(physicsContactMat);

    // Create the ground plane
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0,
      material: physicsContactMat,
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Loading in textures for the ground plane
    const loader = new THREE.TextureLoader();

    const base = "../../assets/textures/groundTextures/" + this.groundTexture;

    const map = loader.load(base + "_COL_2K.jpg");
    const bmap = loader.load(base + "_BUMP_2K.jpg");
    const dmap = loader.load(base + "_DISP_2K.jpg");
    const nmap = loader.load(base + "_NRM_2K.jpg");
    const amap = loader.load(base + "_AO_2K.jpg");

    const scale = 1000 / 3;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(scale, scale);

    bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set(scale, scale);

    dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
    dmap.repeat.set(scale, scale);

    nmap.wrapS = nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set(scale, scale);

    amap.wrapS = amap.wrapT = THREE.RepeatWrapping;
    amap.repeat.set(scale, scale);

    const geometry = new THREE.PlaneGeometry(500, 500);

    const materialPlane = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 5,
      bumpMap: bmap,
      bumpScale: 20,
      displacementMap: dmap,
      displacementScale: 0,
      displacementBias: 0.01,
      normalMap: nmap,
      aoMap: amap,
      aoMapIntensity: 1,
      map: map,
      depthTest: true,
    });
    // Finished loading in textures

    const plane = new THREE.Mesh(geometry, materialPlane);
    plane.rotateX(-Math.PI / 2);
    plane.castShadow = true;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  /**
   * Initial lighting for the game world.
   *
   * Sets up the default lighting for the game scene.
   * Initial lights comprise of a single hemisphere light and the ambient lighting for the game.
   */
  _BuildLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    this.scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(ambientLight);
  }

  /**
   * Adds the necessary features to our character.
   *
   * Sets up the collision body of our first-person character.
   * Initialises the player controls.
   * Defines the spawn point of the character.
   */
  _AddCharacter() {
    // Create the user collision sphere
    let physicsMaterial = new CANNON.Material("physics");
    const physicsContactMat = new CANNON.ContactMaterial(
      physicsMaterial,
      physicsMaterial,
      {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
      }
    );
    const radius = 1.3;
    let characterShape = new CANNON.Sphere(radius);
    let characterBody = new CANNON.Body({
      mass: 5,
      material: physicsContactMat,
    });
    characterBody.addShape(characterShape);
    characterBody.linearDamping = 0.9;
    this.player = characterBody;
    this.world.addBody(this.player);
    this.controls = new PointerLockControlsCannon(this.camera, this.player);
    this.scene.add(this.controls.getObject());

    instructions.addEventListener("click", () => {
      this.controls.lock();
    });

    this.controls.addEventListener("lock", () => {
      this.controls.enabled = true;
      instructions.style.display = "none";
    });

    this.controls.addEventListener("unlock", () => {
      scope.style.display = "none";
      zoomedImage.style.display = "none";
      this.controls.enabled = false;
      instructions.style.display = null;
    });

    characterBody.position.set(10, radius / 2, 55);
  }

  _AddCharacterEquipment() {
    this.torch = new THREE.SpotLight(
      0xffffff,
      200.0,
      20,
      Math.PI * 0.1,
      0.5,
      2
    );
    this.torch.castShadow = true;

    this.torchTarget = new THREE.Object3D();
    this.torchTarget.position.set(0, 1, -2);
    this.camera.add(this.torchTarget);
    this.torch.target = this.torchTarget;
    this.camera.add(this.torch);
    this.torch.position.z = this.torch.position.z + 5;
  }

  onGunLoaded = (object) => {
    this.gun = new Token();
    this.gun.object = object;
    this.gun.object.scale.set(3, 3, 3);
    this.gun.object.position.set(10, 0.2, 55);
    this.scene.add(this.gun.object);
    this.gun.loaded = true;
  };

  // Function to zoom in
  zoomIn() {
    this.camera.fov -= 30;
    this.camera.updateProjectionMatrix();
  }

  // Function to zoom out
  zoomOut() {
    this.camera.fov += 30;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Sets up the shooting functionality.
   *
   * Defines the physics of the projectiles.
   * Defines the shape of the projectiles.
   * Defines the texture of the projectiles.
   * Sets the velocity of the projectiles.
   * Gets the direction that the projectile needs to be shot at.
   */

  _BindShooting() {

    /*source: https://sketchfab.com/3d-models/pso-1-1-sniper-scope-lowpoly-gameready-423a3bd9e2344f26b3aff82e0ae185d7 */
    let loaderObj = new GLTFLoader();
    loaderObj.load("../../assets/models/weapons/gun.glb", (gltf) => {
      var gunobj = gltf.scene;
      this.onGunLoaded(gunobj);
    });

    const shootVelocity = 20;
    const ballShape = new CANNON.Sphere(0.1);
    const ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    const base = "../../assets/textures/bulletTextures/" + this.bulletTexture;
    let loader = new THREE.TextureLoader();
    const map = loader.load(base + "_COL_1K_METALNESS.png");
    const bmap = loader.load(base + "_BUMP_1K_METALNESS.png");
    const dmap = loader.load(base + "_DISP_1K_METALNESS.png");
    const mmap = loader.load(base + "_METALNESS_1K_METALNESS.png");
    const rmap = loader.load(base + "_ROUGHNESS_1K_METALNESS.png");
    const nmap = loader.load(base + "_NRM_1K_METALNESS.png");

    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 1);
    map.mapping = THREE.CubeReflectionMapping;

    bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set(1, 1);

    dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
    dmap.repeat.set(1, 1);

    mmap.wrapS = mmap.wrapT = THREE.RepeatWrapping;
    mmap.repeat.set(1, 1);

    rmap.wrapS = rmap.wrapT = THREE.RepeatWrapping;
    rmap.repeat.set(1, 1);

    nmap.wrapS = nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set(1, 1);

    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1,
      map: map,
      bumpMap: bmap,
      displacementMap: dmap,
      displacementScale: 0,
      metalnessMap: mmap,
      roughnessMap: rmap,
      normalMap: nmap,
    });

    const scopeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const scope = document.getElementById("scope");
    scope.style.display = "none";
    window.addEventListener("click", (event) => {
      if (!this.controls.enabled || this.gun.toggled == false) {
        return;
      }

      if (event.button === 2) {
        event.preventDefault();

        if (this.isRightMouseDown) {
          //Zoom in when the right mouse button is held down
          this.zoomOut();
          this.isRightMouseDown = false;
          scope.style.display = "none";
          zoomedImage.style.display = "none";
          this.gun.object.position.z = this.gun.object.position.z - 100;
        } else {
          scope.style.display = "block";
          zoomedImage.style.display = "block";
          scope.style.border = "5px solid black";
          // Return to normal view when the right mouse button is released
          this.zoomIn();
          this.isRightMouseDown = true;
          this.gun.object.position.z = this.gun.object.position.z + 100;
        }
      }
    });

    window.addEventListener("click", (event) => {
      if (
        !this.controls.enabled ||
        this.gun.toggled == false ||
        event.button == 2
      ) {
        return;
      }
      const ballBody = new CANNON.Body({ mass: 1 });
      ballBody.addShape(ballShape);
      const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
      ballBody.angularDamping = 0.31;
      ballBody.linearDamping = 0.31;
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;

      const scopeBallMesh = new THREE.Mesh(ballGeometry, scopeMaterial);

      this.world.addBody(ballBody);
      this.scene.add(ballMesh);
      this.scopeScene.add(scopeBallMesh);
      this.ballBodies.push(ballBody);
      this.ballMeshes.push(ballMesh);
      this.scopeBallMeshes.push(scopeBallMesh);

      // Returns a vector pointing the the diretion the camera is at
      const vector = new THREE.Vector3(0, 0, 1);
      vector.unproject(this.camera);
      const ray = new THREE.Ray(
        this.player.position,
        vector.sub(this.player.position).normalize()
      );
      const shootDirection = ray.direction;
      ballBody.velocity.set(
        shootDirection.x * shootVelocity,
        shootDirection.y * shootVelocity,
        shootDirection.z * shootVelocity
      );

      // Move the ball outside the player sphere
      const x =
        this.player.position.x +
        shootDirection.x * (1.3 * 1.02 + ballShape.radius);
      const y =
        this.player.position.y +
        shootDirection.y * (1.3 * 1.02 + ballShape.radius);
      const z =
        this.player.position.z +
        shootDirection.z * (1.3 * 1.02 + ballShape.radius);
      ballBody.position.set(x, y, z);
      ballMesh.position.copy(ballBody.position);
      scopeBallMesh.position.copy(ballBody.position);
      if (this.gunNoise.isPlaying) {
        this.gunNoise.stop();
        this.gunNoise.play();
      } else {
        this.gunNoise.play();
      }
      ballBody.addEventListener("collide", (e) => {
        if (e.body.userData) {
          if (e.body.userData.numberLives) {
            if (e.body.userData.numberLives > 1) {
              let id = e.body.userData.meshId;
              e.body.userData.numberLives -= 1;
            } else {
              let id = e.body.userData.meshId;
              if (this.enemyBody[id] != null) {
                this.world.removeBody(this.enemyBody[id]);
                this.enemyBody[id] = null;
                this.npcAnimateDeath[id] = true;
                this.npcArr[id].dead = true;
                this.npcArr[id].sound.stop();
                this.npcArr[id].humm.stop();
              }
            }
          } else {
            if (e.body.userData.splitCount < 3) {
              this.splitObject(e.body.userData, e.contact);
            }
          }
        }
      });
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          // Calculate the distance between the character and sphereTwo
          const characterPosition = this.player.position;
          const gunPos = this.gun.getPosition();

          let gun_distance = characterPosition.distanceTo(gunPos);
          // Define a threshold distance for character proximity
          const proximityThreshold = 3; // Adjust this threshold as needed

          if (this.tokens.length > 0) {
            let tokenpos = this.tokens[0].getPosition();
            let smallest_dist = characterPosition.distanceTo(tokenpos);
            let test_dist;
            let tokenid = 0;

            //get smallest distance among tokens
            for (let i = 0; i < this.tokens.length; i++) {
              tokenpos = this.tokens[i].getPosition();
              test_dist = characterPosition.distanceTo(tokenpos);
              if (test_dist < smallest_dist) {
                tokenid = i;
                smallest_dist = test_dist;
              }
            }

            if (
              smallest_dist < proximityThreshold &&
              this.tokens[tokenid].toggled == false
            ) {
              this.tokens[tokenid].toggled = true;
              this.tokens[tokenid].object.position.set(0, 0, 0);
              this.tokens[tokenid].object.rotation.y = 0;
              this.scene.remove(this.tokens[tokenid].object);
              this.numberOfKeys += 1;
              numTokensText.textContent = `${this.numberOfKeys}/${this.totalKeys}`;
              this.tokens[tokenid].sound.stop();
            }
          }

          if (gun_distance < proximityThreshold && this.gun.toggled == false) {
            this.gun.toggled = true;
            this.gun.object.position.set(0, 0, 0);
            this.gun.object.rotation.y = 0;

            this.camera.add(this.gun.object);

            this.gun.object.position.y = this.gun.object.position.y - 0.7;
            this.gun.object.position.z = this.gun.object.position.z - 0.8;
            this.gun.object.position.x = this.gun.object.position.x + 0.2;
            this.gun.object.rotation.x = Math.PI / 15;
            this.gun.object.rotation.y = Math.PI / 40;
            this.gun.object.scale.z = 2;
            this.animateGateOpen = true;
          }
        }
      },
      false
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key.toLowerCase() === "r") {
          event.preventDefault();
          // Calculate the distance between the character and sphereTwo
          document.getElementById("deathText").textContent = "Restarting...";
          this.restartBoolean = true;
          //window.location = this.restartLevel;
        }
      },
      false
    );
  }

  updateFraction() {
    var numTokensText = document.getElementById("numTokensText");
    var totalTokens = 100; // You can hard-code the denominator here

    // Sample input string
    var inputString = "Your text containing number tokens goes here.";

    // Call the function to count number tokens
    var tokenCount = countNumberTokens(inputString);

    // Update the content of the <p> element with the fraction
    numTokensText.textContent = "Found " + tokenCount + "/" + totalTokens;
  }

  checkProximity() {
    const characterPosition = this.player.position;
    // const swordPos = sword.position;
    // const mapPos = map.position;

    if (this.gun.loaded == true) {
      const gunPos = this.gun.getPosition();

      let gun_distance = characterPosition.distanceTo(gunPos);

      // Define a threshold distance for character proximity
      const proximityThreshold = 3; // Adjust this threshold as needed

      if (this.tokens.length > 0) {
        let tokenpos = this.tokens[0].getPosition();
        let smallest_dist = characterPosition.distanceTo(tokenpos);
        let test_dist;
        let tokenid = 0;

        //get smallest distance among tokens
        for (let i = 0; i < this.tokens.length; i++) {
          tokenpos = this.tokens[i].getPosition();
          test_dist = characterPosition.distanceTo(tokenpos);
          if (test_dist < smallest_dist) {
            tokenid = i;
            smallest_dist = test_dist;
          }
        }

        if (
          smallest_dist < proximityThreshold &&
          this.tokens[tokenid].toggled == false
        ) {
          const newText =
            "Press 'E' to pick up the " + this.tokens[tokenid].name;
          document.getElementById("tokenText").textContent = newText;
        } else {
          document.getElementById("tokenText").textContent = "";
        }
      }

      if (gun_distance < proximityThreshold && this.gun.toggled == false) {
        const newText = "Press 'E' to pick up the gun";
        document.getElementById("tokenText").textContent = newText;
      }
    }
  }

  onTokenLoaded = (token) => {
    this.tokens.push(token);
    this.scene.add(token.object);
  };

  _AddTokens() {
    let loaderObj = new GLTFLoader();
    /* source:    https://sketchfab.com/3d-models/sword-91879718299e473e8ac55743d510aa68
    author:    shedmon (https://sketchfab.com/shedmon)*/
    loaderObj.load("../../assets/models/tokens/sword/scene.gltf", (gltf) => {
      let token = new Token();
      token.object = gltf.scene;
      token.object.scale.set(0.001, 0.001, 0.001);
      token.setToggledScale(0.0002, 0.0002, 0.0002);
      token.setToggledRotation(Math.PI * 1.5);
      token.setToggledOffsets(0, -0.5, -0.9);
      token.name = "sword";
      token.loaded = true;
      this.onTokenLoaded(token);
      this.setKeyPos(token);
      console.log(
        "This is the first token position " +
          token.object.position.x +
          " " +
          token.object.position.z
      );
      token.sound = new THREE.PositionalAudio(this.AudioListener);
      token.object.add(token.sound);
      new THREE.AudioLoader().load(
        "../../assets/sounds/wind-chimes-bells-115747.mp3",
        (buffer) => {
          token.sound.setBuffer(buffer);
          token.sound.setLoop(true);
          token.sound.setVolume(1);
          token.sound.setRefDistance(0.1);
          token.sound.play();
        }
      );
      this._SpawnNPC(token);
    });
  }

  _SpawnNPC(token) {

    /* source:    https://sketchfab.com/3d-models/batman-arkham-asylum-harley-quinn-46b5868a4a8d4a2b9389221a039b24b2
author:    EWTube0 (https://sketchfab.com/EWTube0)*/
    let loaderObj = new GLTFLoader();
    loaderObj.load("../../assets/models/characters/npc/scene.gltf", (gltf) => {
      console.log("Spawning npc: " + this.npcId);
      let t_npc = new NPC();
      let result = t_npc.getNPC(this.npcId);
      t_npc.mesh = gltf.scene;
      t_npc.loaded = true;
      let t_enemy = gltf.scene;
      let t_enemyBody = result[1];
      t_enemy.position.set(token.object.position);
      t_enemyBody.position.copy(t_enemy.position);
      this.world.addBody(t_enemyBody);
      t_enemy.matrixAutoUpdate = false;
      this.scene.add(t_enemy);
      let t_time = new YUKA.Time();
      let t_enemyPath = new YUKA.Path();
      let t_vehicle = new YUKA.Vehicle();
      let t_entityManager = new YUKA.EntityManager();

      t_vehicle.setRenderComponent(t_enemy, this.sync);
      t_entityManager.add(t_vehicle);

      t_npc.sound = new THREE.PositionalAudio(this.AudioListener);
      t_npc.mesh.add(t_npc.sound);
      new THREE.AudioLoader().load(
        "../../assets/sounds/banshie-scream-70413.mp3",
        (buffer) => {
          t_npc.sound.setBuffer(buffer);
          t_npc.sound.setVolume(1);
          t_npc.sound.play();
        }
      );
      t_npc.humm = new THREE.PositionalAudio(this.AudioListener);
      t_npc.mesh.add(t_npc.humm);
      new THREE.AudioLoader().load(
        "../../assets/sounds/ghostly-humming-63204.mp3",
        (buffer) => {
          t_npc.humm.setBuffer(buffer);
          t_npc.humm.setVolume(1);
        }
      );

      this.npcArr[this.npcId] = t_npc;
      this.enemyBody[this.npcId] = t_enemyBody;
      this.enemy[this.npcId] = t_enemy;
      this.vehicle[this.npcId] = t_vehicle;
      this.entityManager[this.npcId] = t_entityManager;
      this.time[this.npcId] = t_time;
      this.enemyPath[this.npcId] = t_enemyPath;
      this.npcId++;
    });
  }

  hurt() {
    this.currentHealth -= 1;
    console.log(this.currentHealth);
    if (this.currentHealth < 0 && this.playerLives != 0) {
      if (this.playerLives == 3) {
        Heart1.style.display = "none";
      }
      if (this.playerLives == 2) {
        Heart2.style.display = "none";
      }
      if (this.playerLives == 1) {
        Heart3.style.display = "none";
      }
      this.currentHealth = this.healthSize;
      this.playerLives -= 1;
    }
  }

  /**
   * Animates our game world.
   *
   * Handles all the animation of our game.
   * Updates position of all the moving pieces.
   * Updates the controls.
   * Updates the camera.
   * Updates the Stats.
   */
  _Animate() {
    requestAnimationFrame(this._Animate);
    console.log(this.renderer.info.render.calls);
    if (this.dynamicSkybox) {
      this.skybox.rotation.x += 0.001;
      this.skybox.rotation.y += 0.001;
    }

    const timeStep = 1 / 60;
    const time = performance.now() / 1000;
    const dt = time - this.lastCallTime;
    this.lastCallTime = time;
    this.world.step(timeStep, dt);

    Object.keys(this.breakableMeshes).forEach((m) => {
      this.breakableMeshes[m].position.set(
        this.breakableBodies[m].position.x,
        this.breakableBodies[m].position.y,
        this.breakableBodies[m].position.z
      );
      this.breakableMeshes[m].quaternion.set(
        this.breakableBodies[m].quaternion.x,
        this.breakableBodies[m].quaternion.y,
        this.breakableBodies[m].quaternion.z,
        this.breakableBodies[m].quaternion.w
      );
    });

    while (this.ballBodies.length > 10) {
      let body = this.ballBodies.shift();
      let mesh = this.ballMeshes.shift();
      let smesh = this.scopeBallMeshes.shift();
      this.world.removeBody(body);
      this.scene.remove(mesh);
      this.scopeScene.remove(smesh);
    }

    for (let i = 0; i < this.ballBodies.length; i++) {
      this.ballMeshes[i].position.copy(this.ballBodies[i].position);
      this.ballMeshes[i].quaternion.copy(this.ballBodies[i].quaternion);

      this.scopeBallMeshes[i].position.copy(this.ballBodies[i].position);
      this.scopeBallMeshes[i].quaternion.copy(this.ballBodies[i].quaternion);
    }

    let pos = this.player.position.clone();
    this.mapCamera.position.x = pos.x;
    this.mapCamera.position.z = pos.z;
    this.mapCamera.lookAt(new THREE.Vector3(pos.x, -1, pos.z));

    for (let i = 0; i < this.enemy.length; i++) {
      if (this.enemy[i] != null) {
        if (this.enemyBody[i] != null) {
          this.entityManager[i].update(dt);
          if (pos.z <= 5 * (19 - 10)) {
            this.animateGateOpen = false;
            if (this.frameNumber > 50) {
              this.npcArr[i].regeneratePath(
                this.maze,
                this.player,
                this.enemy[i],
                this.enemyPath[i],
                this.vehicle[i]
              );
              this.frameNumber = 0;
            }
          }
          this.enemy[i].position.copy(this.vehicle[i].position);
          this.scopeEnemy[i].position.copy(this.enemy[i].position);
          this.enemyBody[i].position.copy(this.enemy[i].position);
          if (this.enemyBody[i] != null) {
            if (
              this.player.position.distanceTo(this.enemyBody[i].position) < 3
            ) {
              this.damageNoise.play();
              this.hurt();
            } else {
              this.damageNoise.stop();
            }
          }
        }
      }
    }

    this.controls.update(dt);
    this.stats.update();

    if (this.liftWall) {
      if (this.gateNumber < 500) {
        if (!this.gateNoiseExit.isPlaying) {
          this.gateNoiseExit.play();
        }
        this.exitDoor.body.position.copy(this.exitDoor.mesh.position);
        this.exitDoor.body.quaternion.copy(this.exitDoor.mesh.quaternion);
        this.exitDoor.mesh.translateY((this.gateNumber + 15 / 2) * 0.0001);
        this.gateNumber++;
      }
    }

    if (this.animateGateOpen) {
      if (this.gateFallNumber < 500) {
        if (!this.gateNoiseEntrance.isPlaying) {
          this.gateNoiseEntrance.play();
        }
        this.entryDoor.body.position.copy(this.entryDoor.mesh.position);
        this.entryDoor.body.quaternion.copy(this.entryDoor.mesh.quaternion);
        this.entryDoor.mesh.translateY((this.gateFallNumber + 15 / 2) * 0.0001);
        this.gateFallNumber++;
      } else {
        this.gateNoiseEntrance.stop();
      }
    } else {
      if (this.entryDoor.mesh.position.y != 0) {
        if (this.gateFallNumber > 0) {
          if (!this.gateNoiseEntrance.isPlaying) {
            this.gateNoiseEntrance.play();
          }
          this.entryDoor.body.position.set(10, this.wallHeight / 2, 50);
          this.entryDoor.mesh.translateY(
            -(this.gateFallNumber + 15 / 2) * 0.0001
          );
          this.gateFallNumber--;
        } else {
          this.gateNoiseEntrance.stop();
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      if (this.npcAnimateDeath[i]) {
        if (this.npcDeathFrames[i] < 100) {
          if (!this.npcDeathNoise.isPlaying) {
            this.npcDeathNoise.play();
          }
          console.log(this.npcDeathFrames[i]);
          this.enemy[i].translateY(0.5 * this.npcDeathFrames[i]);
          this.npcDeathFrames[i]++;
        } else {
          this.scene.remove(this.enemy[i]);
          this.enemy[i] = null;
          this.npcAnimateDeath[i] = false;
        }
      }
    }

    if (this.playerLives <= 0 && !this.hasReloaded) {
      document.getElementById("deathText").textContent = "You died. Try again.";
      this.restartBoolean = true;
    }

    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].toggled === false && this.tokens[i].loaded) {
        this.tokens[i].animateObject(this.frameNumber);
      }
    }
    this.frameNumber += 1;
    this._Render();

    if (this.tokens.length > 0) {
      this.checkProximity();
    }

    if (this.notEnoughKeys == true) {
      if (this.notEnoughKeys && this.timerKeys < 500) {
        this.timerKeys += 1;
        document.getElementById("tokenText").textContent =
          "You must find all the artifacts in order to escape!";
      } else {
        this.notEnoughKeys = false;
        this.timerKeys = 0;
        document.getElementById("tokenText").textContent = "";
      }
    }

    if (this.restartBoolean == true) {
      this.restartCounter += 1;
      if (this.restartCounter > 50 && !this.hasReloaded) {
        this.hasReloaded = true;
        window.location = this.restartLevel;
      }
    }
  }

  /**
   * Renders our game.
   *
   * Renders the first-person view of the game.
   * Renders the orthograpic, minimap view of the game.
   */
  _Render() {
    this.renderer.render(this.scene, this.camera);
    this.rendererMap.render(this.minimapScene, this.mapCamera);
    this.renderScope.render(this.scopeScene, this.camera);
    this.composer.render();
  }

  /**
   * Creates an array of path strings.
   *
   * Creates an array of paths strings that correspond to the correct face of the skybox.
   *
   * @param {string} filename Filename of the skybox image assets.
   * @returns {string[]} An array of string containing the filename for each of the corresponding side of the skybox.
   */
  createPathStrings(filename) {
    const basePath = "../../assets/skybox/";
    const baseFilename = basePath + filename;
    const fileType = ".jpg";
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    const pathStings = sides.map((side) => {
      return baseFilename + "_" + side + fileType;
    });

    return pathStings;
  }

  /**
   * Creates an array of materials.
   *
   * Creates an array of materials for each of the faces of the skybox.
   *
   * @param {string} filename Path to the skybox image assets
   * @returns {THREE.MeshBasicMaterial[]} Array of materials for each of the skybox faces
   */
  createMaterialArray(filename) {
    const skyboxImagepaths = this.createPathStrings(filename);
    const materialArray = skyboxImagepaths.map((image) => {
      let texture = new THREE.TextureLoader().load(image);
      return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        fog: false,
        transparent: true,
        opacity: 0.75,
      });
    });
    return materialArray;
  }

  /**
   * Creates a mesh at a specified location
   * @param {number} x x-coordinate of where the mesh should be placed
   * @param {number} z z-coordinate of where the mesh should be placed
   */
  mesh(x, z) {
    const minimapMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });

    const geometry = new THREE.BoxGeometry(5, this.wallHeight, 5);
    const cube = new THREE.Mesh(geometry, this.wallMaterial);
    cube.position.set(x, this.wallHeight / 2, z);
    this.scene.add(cube);

    const mapCube = new THREE.Mesh(geometry, minimapMaterial);
    mapCube.position.set(x, this.wallHeight / 2, z);
    this.minimapScene.add(mapCube);

    const scopeCube = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    scopeCube.position.set(x, this.wallHeight / 2, z);
    this.scopeScene.add(scopeCube);
  }

  /**
   * Creates a body at a specified location
   * @param {number} x x-coordinate of where the body should go
   * @param {number} z z-coordinate fo where the body should go
   */
  body(x, z) {
    const shape = new CANNON.Box(
      new CANNON.Vec3(5 * 0.5, this.wallHeight * 0.5, 5 * 0.5)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      shape,
    });
    body.position.set(x, this.wallHeight / 2, z);
    this.world.addBody(body);
  }

  /**
   * Creates a basic block.
   *
   * Creates a block mesh with the correct physics and places the block at the specified coordinates.
   *
   * @param {number} x The x-coordinate of the position of the block.
   * @param {number} z The z-coordinate of the position of the block.
   */
  block(x, z) {
    this.body(x, z);
    this.mesh(x, z);
  }

  /**
   * Generates a solvable maze.
   *
   * Generates a solvable maze with an entrance and an exit that is in the same position each time.
   *
   * @param {number} rows The numbers of rows in the maze.
   * @param {number} cols The number of collumns in the maze.
   * @returns {number[][]} A solvable with the specified number of rows and collumns.
   */
  generateMaze(rows, cols) {
    const maze = new Array(rows).fill(null).map(() => new Array(cols).fill(1));

    // Set the entrance and exit
    const entranceRow = rows - 1;
    const exitRow = 0;
    const entranceCol = Math.floor(cols / 2);
    const exitCol = Math.floor(cols / 2);

    maze[entranceRow][entranceCol] = 0;
    maze[exitRow][exitCol] = 0;

    function createMaze(row, col) {
      maze[row][col] = 0;

      const directions = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2],
      ];

      directions.sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          if (maze[newRow][newCol] === 1) {
            maze[row + dx / 2][col + dy / 2] = 0;
            createMaze(newRow, newCol);
          }
        }
      }
    }

    createMaze(entranceRow, entranceCol);

    return maze;
  }

  /**
   * Places the token
   * @param {Token} token The token to be placed
   */
  setKeyPos = (token) => {
    for (let r = 1; r < this.maze.length - 1; r++) {
      for (let c = 1; c < this.maze[r].length - 1; c++) {
        if (
          this.maze[r][c] == 0 ||
          this.maze[r][c] == 2 ||
          this.maze[r][c] == 3
        ) {
          const decorator = new Decorator(this.maze, this.scene, this.world);
          if (decorator.isDeadEnd(r, c)) {
            this.maze[r][c] = 5;
            token.object.position.set(5 * (c - 10), 1.1, 5 * (r - 10));
            break;
          }
        }
      }
    }
  };

  /**
   * Creates the invisible bounding box of the starting area
   */
  bounds() {
    this.body(20, 55);
    this.body(0, 55);
    this.body(20, 60);
    this.body(0, 60);
    this.body(20, 65);
    this.body(0, 65);
    this.body(15, 65);
    this.body(5, 65);
    this.body(10, 65);
  }

  /**
   * Visualises the maze.
   *
   * Converts the maze from a primitive array to a 3D representation.
   *
   * @param {number[][]} maze The 2D array containing the maze details.
   */
  visualise(maze) {
    const w = maze.length;
    const h = maze[0].length;

    for (let row = 0; row < w; row++) {
      for (let col = 0; col < h; col++) {
        if (maze[col][row] == 1) {
          this.block(5 * (row - w / 2), 5 * (col - h / 2));
        }
      }
    }

    for (let i = -50; i < 50; i += 5) {
      if (i != Math.floor(20 / 2)) {
        this.block(i, 50);
      }
    }

    for (let i = -50; i <= 50; i += 5) {
      this.block(-55, i);
    }
  }

  exit() {
    const shape = new CANNON.Box(
      new CANNON.Vec3(5 * 0.5, this.wallHeight * 0.5, 5 * 0.5)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      shape,
    });
    body.position.set(0, this.wallHeight / 2, -50);
    this.exitDoor.body = body;
    this.world.addBody(body);

    // Loading in textures
    const loader = new THREE.TextureLoader();
    const base = "../../assets/textures/wallTextures/" + this.exitTexture;
    const map = loader.load(base + "_COL_2K.png");
    const bmap = loader.load(base + "_BUMP_2K.png");
    const dmap = loader.load(base + "_DISP_2K.png");
    const nmap = loader.load(base + "_NRM_2K.png");
    const amap = loader.load(base + "_AO_2K.png");

    const scale = 1;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(scale, (this.wallHeight / 5) * scale);
    map.mapping = THREE.CubeRefractionMapping;

    bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
    dmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    nmap.wrapS = nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    amap.wrapS = amap.wrapT = THREE.RepeatWrapping;
    amap.repeat.set(scale, (this.wallHeight / 5) * scale);

    const material = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 15,
      bumpMap: bmap,
      bumpScale: 15,
      displacementMap: dmap,
      displacementScale: 0,
      normalMap: nmap,
      aoMap: amap,
      aoMapIntensity: 1,
      map: map,
      depthTest: true,
      refractionRatio: 0.1,
    });

    const geometry = new THREE.BoxGeometry(5, this.wallHeight, 5);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, this.wallHeight / 2, -50);
    this.exitDoor.mesh = cube;
    this.scene.add(cube);
    this.gateNoiseExit.position.set(this.exitDoor.mesh.position);
  }

  enter() {
    const shape = new CANNON.Box(
      new CANNON.Vec3(5 * 0.5, this.wallHeight * 0.5, 5 * 0.5)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      shape,
    });
    body.position.set(10, this.wallHeight / 2, 50);
    this.entryDoor.body = body;
    this.world.addBody(body);

    // Loading in textures
    const loader = new THREE.TextureLoader();
    const base = "../../assets/textures/wallTextures/" + this.exitTexture;
    const map = loader.load(base + "_COL_2K.png");
    const bmap = loader.load(base + "_BUMP_2K.png");
    const dmap = loader.load(base + "_DISP_2K.png");
    const nmap = loader.load(base + "_NRM_2K.png");
    const amap = loader.load(base + "_AO_2K.png");

    const scale = 1;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(scale, (this.wallHeight / 5) * scale);
    map.mapping = THREE.CubeRefractionMapping;

    bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
    bmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
    dmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    nmap.wrapS = nmap.wrapT = THREE.RepeatWrapping;
    nmap.repeat.set(scale, (this.wallHeight / 5) * scale);

    amap.wrapS = amap.wrapT = THREE.RepeatWrapping;
    amap.repeat.set(scale, (this.wallHeight / 5) * scale);

    const material = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 15,
      bumpMap: bmap,
      bumpScale: 15,
      displacementMap: dmap,
      displacementScale: 0,
      normalMap: nmap,
      aoMap: amap,
      aoMapIntensity: 1,
      map: map,
      depthTest: true,
      refractionRatio: 0.1,
    });

    const geometry = new THREE.BoxGeometry(5, this.wallHeight, 5);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(10, this.wallHeight / 2, 50);
    this.entryDoor.mesh = cube;
    this.scene.add(cube);
    this.gateNoiseEntrance.position.set(this.entryDoor.mesh.position);
  }

  /**
   * Adds the maze to the game scene.
   *
   * Generates the maze to be used in the game.
   * Visualises the maze.
   * Adds the visual representation to the game world.
   */
  _AddMaze() {
    this.maze = this.generateMaze(20, 20); // Generates the maze
    this.visualise(this.maze); // Visualises the maze
    this.exit(); // Adds the exit door
    this.enter(); // Adds the entry door
    this.bounds(); // Adds invisible boundaries to the starting area
  }

  /**
   * Adds the trigger boxes to the game
   */
  _AddTriggerBoxes() {
    // Trigger body End Game -> Destory Exit Wall
    const triggerGeometry = new THREE.BoxGeometry(4, 1, 1);
    const triggerMaterial = new THREE.MeshPhysicalMaterial({
      transmission: 0,
    });
    const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
    trigger.material.visible = false;
    this.scene.add(trigger);
    const boxShape = new CANNON.Box(new CANNON.Vec3(4, 1, 1));
    const triggerBody = new CANNON.Body({ isTrigger: true });
    triggerBody.addShape(boxShape);
    triggerBody.position.set(0, 1.3, -45);
    trigger.position.set(0, 1.3, -45);
    this.world.addBody(triggerBody);

    // It is possible to run code on the exit/enter
    // of the trigger.
    triggerBody.addEventListener("collide", (event) => {
      if (event.body === this.player) {
        if (this.numberOfKeys == this.tokens.length) {
          this.liftWall = true;
          this.notEnoughKeys = false;
        } else {
          this.notEnoughKeys = true;
          this.timerKeys = 0;
        }
      }
    });

    // Trigger body End Game -> Navigate to next level!
    const triggerGeometryEnd = new THREE.BoxGeometry(4, 1, 1);
    const triggerMaterialEnd = new THREE.MeshPhysicalMaterial({
      transmission: 0,
      // wireframe: true,
    });
    const triggerEnd = new THREE.Mesh(triggerGeometryEnd, triggerMaterialEnd);
    trigger.material.visible = false;
    this.scene.add(triggerEnd);
    const boxShapee = new CANNON.Box(new CANNON.Vec3(4, 1, 1));
    const triggerBodyEnd = new CANNON.Body({ isTrigger: true });
    triggerBodyEnd.addShape(boxShapee);
    triggerBodyEnd.position.set(0, 1.3, -55);
    triggerEnd.position.set(0, 1.3, -55);
    this.world.addBody(triggerBodyEnd);
    triggerBodyEnd.addEventListener("collide", (event) => {
      if (this.numberOfKeys == this.tokens.length) {
        if (event.body === this.player) {
          window.location = this.nextLevel;
        }
      }
    });
  }

  sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
  }

  geometryToShape(geometry) {
    const position = geometry.attributes.position.array;
    const points = [];
    for (let i = 0; i < position.length; i += 3) {
      points.push(
        new THREE.Vector3(position[i], position[i + 1], position[i + 2])
      );
    }
    const convexHull = new ConvexGeometry(points);
    const shape = CannonUtils.CreateConvexPolyhedron(convexHull);
    return shape;
  }

  splitObject(userData, contact) {
    const contactId = userData.id;
    if (this.breakableMeshes[contactId]) {
      const poi = this.breakableBodies[contactId].pointToLocalFrame(
        contact.bj.position.vadd(contact.rj)
      );
      const n = new THREE.Vector3(
        contact.ni.x,
        contact.ni.y,
        contact.ni.z
      ).negate();
      const shards = this.convexObjectBreaker.subdivideByImpact(
        this.breakableMeshes[contactId],
        new THREE.Vector3(poi.x, poi.y, poi.z),
        n,
        1,
        0
      );

      if (this.breakableMeshes[contactId] && this.breakableBodies[contactId]) {
        this.scene.remove(this.breakableMeshes[contactId]);
        delete this.breakableMeshes[contactId];
        this.world.removeBody(this.breakableBodies[contactId]);
        delete this.breakableBodies[contactId];
      }

      shards.forEach((d) => {
        const nextId = this.breakableMeshID++;

        this.scene.add(d);
        this.breakableMeshes[nextId] = d;
        d.geometry.scale(0.99, 0.99, 0.99);
        const shape = this.geometryToShape(d.geometry);

        const body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        body.userData = {
          splitCount: userData.splitCount + 1,
          id: nextId,
        };
        body.position.x = d.position.x;
        body.position.y = d.position.y;
        body.position.z = d.position.z;
        body.quaternion.x = d.quaternion.x;
        body.quaternion.y = d.quaternion.y;
        body.quaternion.z = d.quaternion.z;
        body.quaternion.w = d.quaternion.w;
        this.world.addBody(body);
        this.breakableBodies[nextId] = body;
      });
    }
  }

  /**
   * Places a breakable block of a specified size at a specified location
   *
   * @param {number} sx Size in the x-direction
   * @param {number} sy Size in the y-direction
   * @param {number} sz Size in the z-direction
   * @param {number} px x-coordinate of the position to be placed
   * @param {number} py y-coordinate of the position to be placed
   * @param {number} pz z-coordinate of the position to be placed
   */
  _CreateBreakableObject(sx, sy, sz, px, py, pz) {
    const size = {
      x: sx,
      y: sy,
      z: sz,
    };
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const cube = new THREE.Mesh(geo, this.glassMaterial);
    cube.position.set(px, py, pz);
    cube.setRotationFromAxisAngle(new CANNON.Vec3(0, 1, 0));

    this.scene.add(cube);
    this.breakableMeshes[this.breakableMeshID] = cube;
    this.convexObjectBreaker.prepareBreakableObject(
      this.breakableMeshes[this.breakableMeshID],
      1,
      new THREE.Vector3(),
      new THREE.Vector3(),
      true
    );

    const cubeShape = new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    const cubeBody = new CANNON.Body({ mass: 1 });
    cubeBody.userData = { splitCount: 0, id: this.breakableMeshID };
    cubeBody.addShape(cubeShape);
    cubeBody.position.x = cube.position.x;
    cubeBody.position.y = cube.position.y;
    cubeBody.position.z = cube.position.z;

    this.world.addBody(cubeBody);
    this.breakableBodies[this.breakableMeshID] = cubeBody;

    this.breakableMeshID++;
  }

  /**
   * Decorates the level
   *
   * Goes through the level and places glasses cubes in the corridors
   */
  _DecorateLevel() {
    const decorator = new Decorator(this.maze, this.scene, this.world);

    let count = 0;
    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (
          count % 15 == 0 &&
          !decorator.isDeadEnd(i, j) &&
          this.maze[i][j] != 1
        ) {
          this._CreateBreakableObject(1, 1, 1, 5 * (j - 10), 0.5, 5 * (i - 10));
        }
        count++;
      }
    }
  }
}

export { Game };
