import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import { PointerLockControlsCannon } from "./PointerLockControlsCannon";
import Stats from "three/examples/jsm/libs/stats.module";
import Token from "./tokens";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import {
  MaskPass,
  ClearMaskPass,
} from "three/examples/jsm/postprocessing/MaskPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader";
import { DigitalGlitch } from "three/examples/jsm/shaders/DigitalGlitch";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

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
   */
  constructor(skyboxImage, wallTexture, groundTexture) {
    this.scene = null; // ThreeJS Scene
    this.minimapScene = null;
    this.renderer = null; // ThreeJS Renderer
    this.camera = null; // ThreeJS Perspective Camera for First Person View
    this.composer = null;
    this.mapCamera = null; // ThreeJS Orthographic Camera for the Minimap
    this.rendererMap = null; // The Minimap at the top right of the screen
    this.controls = null; // Character/FPS controls
    this.world = null; // CannonJS Physics World
    this.stats = null; // ThreeJS Addon: Stats -- Appears at the top left of the screen
    this.skybox = null; // The skybox for the game
    this.skyboxImage = skyboxImage; // Skybox image path

    this.wallMaterial = null; // ThreeJS material for the walls
    this.wallTexture = wallTexture; // Path to the wall texture assets
    this.wallHeight = 1000; // Height of the maze walls -- Adjust accordingly to the feel of the game

    this.groundTexture = groundTexture;

    this.maze = null; // The generated maze of the game

    this.exitDoor = {
      mesh: null, // The mesh of the exit door
      body: null, // The body of the exit door
    };
    this.gateNumber = 0;
    this.frameNumber = 0;

    this.ballBodies = []; // List storing the physics bodies of the projectile balls
    this.ballMeshes = []; // List storing the meshes of the projectile balls
    this.lastCallTime = 0;

    this.player = null;
    this.gun = null;
    this.torch = null;
    this.torchTarget = null;

    this.tokens = [];

    this.mainAudio = null;
    this.mainAudioSrc = null;
    this.mainAudioListener = null;
    this.numberOfKeys = 0;

    this.liftWall = false;

    this._Init();
    this._BuildWorld();
    this._BuildLights();
    this._AddCharacter();
    this._BindShooting();
    this._AddMaze();
    this._AddTriggerBoxes();
    this._AddCharacterEquipment();
    this._AddTokens();
    // this.checkProximity();

    this.mainAudio.play();
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
    this._Animate = this._Animate.bind(this);
    this._Animate();
  }

  /**
   * Initialisation function.
   *
   * Sets up and defines the basic components of the game world/scene.
   */
  _Init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    // this.scene.background = new THREE.Color(0x000000);
    // this.scene.fog = new THREE.Fog(0x000000, 1, 7.5);

    this.minimapScene = new THREE.Scene();
    this.minimapScene.background = new THREE.Color(0x000011);

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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.listenToKeyEvents(window); // optional
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.mapCamera = new THREE.OrthographicCamera(
      window.innerWidth / -25, // Left
      window.innerWidth / 25, // Right
      window.innerHeight / 25, // Top
      window.innerHeight / -25, // Bottom
      -5000, // Near
      10000 // Far
    );
    // mapCamera.up = new THREE.Vector3(0,0,-1);
    this.mapCamera.zoom = 3;
    this.mapCamera.lookAt(new THREE.Vector3(0, -1, 0));
    this.mapCamera.position.set(0, 5, 0);
    this.scene.add(this.mapCamera);
    let mapCanvas = document.getElementById("minimap");
    this.rendererMap = new THREE.WebGLRenderer({ canvas: mapCanvas });
    this.rendererMap.setSize(200, 200);

    /**
     * Post-Processing
     * ----------------------------------------------------
     */

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const effectBloom = new BloomPass(0.5);
    // this.composer.addPass(effectBloom);

    const effectFilm = new FilmPass(4);
    this.composer.addPass(effectFilm);

    const effectDotScreen = new DotScreenPass(
      new THREE.Vector2(0, 0),
      0.5,
      0.8
    );
    // this.composer.addPass(effectDotScreen);

    const effectHBlur = new ShaderPass(HorizontalBlurShader);
    const effectVBlur = new ShaderPass(VerticalBlurShader);
    effectHBlur.uniforms["h"].value = 2 / (window.innerWidth / 2);
    effectVBlur.uniforms["v"].value = 2 / (window.innerHeight / 2);
    // this.composer.addPass(effectHBlur);
    // this.composer.addPass(effectVBlur);

    const clearMask = new ClearMaskPass();
    // this.composer.addPass(clearMask);

    // const effect1 = new ShaderPass(DotScreenShader);
    // effect1.uniforms["scale"].value = 4;
    // this.composer.addPass(effect1);

    // const effect2 = new ShaderPass(RGBShiftShader);
    // effect2.uniforms["amount"].value = 0.0015;
    // this.composer.addPass(effect2);

    // const effect3 = new ShaderPass(DigitalGlitch);
    // effect3.uniforms["amount"].value = 0.0015;
    // this.composer.addPass(effect3);

    const effect4 = new OutputPass();
    this.composer.addPass(effect4);

    // ----------------------------------------------------

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
    const base = "../../assets/wallTextures/" + this.wallTexture;
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

    this.mainAudio = new Audio("../../assets/scary.mp3");
    this.mainAudio.loop = true;
    this.mainAudioListener = new THREE.AudioListener();
    this.audioSource = new THREE.Audio(this.mainAudioListener);
    this.audioSource.setMediaElementSource(this.mainAudio);
    this.audioSource.setVolume(0.5);
    this.camera.add(this.mainAudioListener);
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

    const base = "../../assets/groundTextures/" + this.groundTexture;

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

    const geometry = new THREE.PlaneGeometry(1000, 1000);

    const materialPlane = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 5,
      bumpMap: bmap,
      bumpScale: 20,
      displacementMap: dmap,
      displacementScale: 0.1,
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
    // const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    // dirLight1.position.set(1, 1, 1);
    // dirLight1.castShadow = true;
    // this.scene.add(dirLight1);

    // const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    // dirLight2.position.set(-1, -1, -1);
    // dirLight2.castShadow = true;
    // this.scene.add(dirLight2);

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
      this.controls.enabled = false;
      instructions.style.display = null;
    });

    characterBody.position.set(10, radius / 2, 55);
  }

  _AddCharacterEquipment() {
    let gunlight;
    this.torch = new THREE.SpotLight(0xffffff, 200.0, 20, Math.PI * 0.08);
    gunlight = new THREE.SpotLight(0xffffff, 10.0, 1);
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
    let loaderObj = new GLTFLoader();
    loaderObj.load("../../assets/weapons/gun.glb", (gltf) => {
      var gunobj = gltf.scene;
      this.onGunLoaded(gunobj);
    });

    const shootVelocity = 20;
    const ballShape = new CANNON.Sphere(0.1);
    const ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    let loader = new THREE.TextureLoader();
    const vmap = loader.load(
      "/assets/gold/MetalGoldPaint002_COL_1K_METALNESS.png"
    );
    const vbmap = loader.load(
      "/assets/gold/MetalGoldPaint002_BUMP_1K_METALNESS.png"
    );

    const vdmap = loader.load(
      "/assets/gold/MetalGoldPaint002_DISP_1K_METALNESS.png"
    );

    vmap.wrapS = vmap.wrapT = THREE.RepeatWrapping;
    vmap.repeat.set(50, 50);
    vmap.mapping = THREE.CubeReflectionMapping;

    vbmap.wrapS = vbmap.wrapT = THREE.RepeatWrapping;
    vbmap.repeat.set(50, 50);

    vdmap.wrapS = vdmap.wrapT = THREE.RepeatWrapping;
    vdmap.repeat.set(50, 50);

    let ballMaterial = new THREE.MeshPhongMaterial({
      specular: 0x666666,
      shininess: 10,
      bumpMap: vbmap,
      bumpScale: 0.5,
      displacementMap: vdmap,
      displacementScale: 0,
      map: vmap,
      depthTest: true,
      reflectivity: 1,
      refractionRatio: 0.1,
    });
    window.addEventListener("click", (event) => {
      if (!this.controls.enabled || this.gun.toggled == false) {
        return;
      }

      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      });
      const ballBody = new CANNON.Body({ mass: 1 });
      ballBody.addShape(ballShape);
      const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
      ballBody.angularDamping = 0.31;
      ballBody.linearDamping = 0.31;
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;

      this.world.addBody(ballBody);
      this.scene.add(ballMesh);
      this.ballBodies.push(ballBody);
      this.ballMeshes.push(ballMesh);

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
    });

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          // Calculate the distance between the character and sphereTwo
          const characterPosition = this.player.position;
          // const swordPos = sword.position;
          // const mapPos = map.position;
          const gunPos = this.gun.getPosition();
          // console.log(mapPos);
          // console.log(gunPos);

          // let sword_distance = characterPosition.distanceTo(swordPos);
          // let map_distance = characterPosition.distanceTo(mapPos);
          let gun_distance = characterPosition.distanceTo(gunPos);
          // Define a threshold distance for character proximity
          const proximityThreshold = 3; // Adjust this threshold as needed

          if (this.tokens.length > 0){

          let tokenpos = this.tokens[0].getPosition();
          let smallest_dist = characterPosition.distanceTo(tokenpos);
          let test_dist;
          let tokenid = 0
          

          //get smallest distance among tokens
          for (let i = 0; i < this.tokens.length; i++) {
            tokenpos = this.tokens[i].getPosition();
            test_dist  = characterPosition.distanceTo(tokenpos);
            if (test_dist < smallest_dist){
              tokenid = i;
              smallest_dist = test_dist;
            }
          }

          if (smallest_dist < proximityThreshold && this.tokens[tokenid].toggled == false){
            this.tokens[tokenid].toggled = true;
            this.tokens[tokenid].object.position.set(0,0,0);
            this.tokens[tokenid].object.rotation.y = 0;
            this.camera.add(this.tokens[tokenid].object);
            this.tokens[tokenid].object.position.x = this.tokens[tokenid].object.position.x + this.tokens[tokenid].toggledOffsetX;
            this.tokens[tokenid].object.position.y = this.tokens[tokenid].object.position.y + this.tokens[tokenid].toggledOffsetY;
            this.tokens[tokenid].object.position.z = this.tokens[tokenid].object.position.z + this.tokens[tokenid].toggledOffsetZ;
            this.tokens[tokenid].object.rotation.y = this.tokens[tokenid].toggledRotation;
            this.tokens[tokenid].object.scale.x = this.tokens[tokenid].toggledScale.x;
            this.tokens[tokenid].object.scale.y = this.tokens[tokenid].toggledScale.y;
            this.tokens[tokenid].object.scale.z = this.tokens[tokenid].toggledScale.z;
            
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
            this.gun.object.rotation.y = Math.PI /40;
            // this.gun.object.scale.x = 0.9999;
            // this.gun.object.scale.y = 0.9999;
            this.gun.object.scale.z = 2;
          }
        }
      },
      false
    );
  }

  checkProximity(){
    
    const characterPosition = this.player.position;
          // const swordPos = sword.position;
          // const mapPos = map.position;


        if (this.gun.loaded == true){
          const gunPos = this.gun.getPosition();
          
          let gun_distance = characterPosition.distanceTo(gunPos);

          // Define a threshold distance for character proximity
          const proximityThreshold = 3; // Adjust this threshold as needed

          if (this.tokens.length > 0){

          let tokenpos = this.tokens[0].getPosition();
          let smallest_dist = characterPosition.distanceTo(tokenpos);
          let test_dist;
          let tokenid = 0
          

          //get smallest distance among tokens
          for (let i = 0; i < this.tokens.length; i++) {
            tokenpos = this.tokens[i].getPosition();
            test_dist  = characterPosition.distanceTo(tokenpos);
            if (test_dist < smallest_dist){
              tokenid = i;
              smallest_dist = test_dist;
            }
          }

          if (smallest_dist < proximityThreshold && this.tokens[tokenid].toggled == false){
            const newText = "Press 'E' to pick up the " + this.tokens[tokenid].name;
            document.getElementById("tokenText").textContent = newText;
          }
            else{
              document.getElementById("tokenText").textContent ='';
            }
          

        }
          
          

          
          if (gun_distance < proximityThreshold && this.gun.toggled == false) {
            const newText = "Press 'E' to pick up the gun";
            document.getElementById("tokenText").textContent = newText;
          }

        }
        

  };

  onTokenLoaded = (token) => {
    this.tokens.push(token);
    this.scene.add(token.object);
  };

  _AddTokens() {
    let loaderObj = new GLTFLoader();
    loaderObj.load("../../assets/sword/scene.gltf", (gltf) => {
      let token = new Token();
      token.object = gltf.scene;
      token.object.scale.set(0.001, 0.001, 0.001);
      token.setToggledScale(0.0002, 0.0002, 0.0002);
      token.setToggledRotation(Math.PI * 1.5);
      token.setToggledOffsets(0,-0.5,-0.9);
      token.name = "sword";
      token.object.position.set(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z - 10
      );
      token.loaded = true;
      this.onTokenLoaded(token);
      this.setKeyPos(token);
      

    });
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
    const timeStep = 1 / 60;
    const time = performance.now() / 1000;
    const dt = time - this.lastCallTime;
    this.lastCallTime = time;
    
    this.world.step(timeStep, dt);
    while (this.ballBodies.length > 10) {
      let body = this.ballBodies.shift();
      let mesh = this.ballMeshes.shift();
      this.world.removeBody(body);
      this.scene.remove(mesh);
    }

    for (let i = 0; i < this.ballBodies.length; i++) {
      this.ballMeshes[i].position.copy(this.ballBodies[i].position);
      this.ballMeshes[i].quaternion.copy(this.ballBodies[i].quaternion);
    }

    let pos = this.player.position.clone();
    this.mapCamera.position.x = pos.x;
    this.mapCamera.position.z = pos.z;
    this.mapCamera.lookAt(new THREE.Vector3(pos.x, -1, pos.z));

    this.controls.update(dt);
    this.stats.update();

    if (this.liftWall) {
      if (this.gateNumber < 500) {
        this.exitDoor.body.position.copy(this.exitDoor.mesh.position);
        this.exitDoor.body.quaternion.copy(this.exitDoor.mesh.quaternion);
        this.exitDoor.mesh.translateY((this.gateNumber + 15 / 2) * 0.0001);
        this.gateNumber++;
      }
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
      console.log(this.player.position);
      console.log("Token pos: " + this.tokens[0].getPosition().x + "," + this.tokens[0].getPosition().z);
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
    const basePath = "/assets/skybox/";
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

  mesh(x, z) {
    const minimapMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });

    const geometry = new THREE.BoxGeometry(5, this.wallHeight, 5);
    // const material = new THREE.MeshPhongMaterial({ color: 0x000044 });
    const cube = new THREE.Mesh(geometry, this.wallMaterial);
    cube.position.set(x, this.wallHeight / 2, z);
    this.scene.add(cube);

    const mapCube = new THREE.Mesh(geometry, minimapMaterial);
    mapCube.position.set(x, this.wallHeight / 2, z);
    this.minimapScene.add(mapCube);
  }

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

 setKeyPos = (token) =>{
    let wallcounter = 0
    for (let r = 1; r < this.maze.length - 1; r++){
      for (let c = 1; c < this.maze[r].length - 1; c++){
        if (this.maze[r][c] == 0 || this.maze[r][c] == 2 || this.maze[r][c] == 3){
          if (this.maze[r][c + 1] == 1){
            wallcounter += 1;
          }
          if (this.maze[r][c - 1] == 1){
            wallcounter += 1;
          }
          if (this.maze[r + 1][c] == 1){
            wallcounter += 1;
          }
          if (this.maze[r - 1][c] == 1){
            wallcounter += 1;
          }

          if (wallcounter == 3){
            this.maze[r][c] = 5;
            token.object.position.set( 5*(c - 10), 1.1 ,  5*(r - 10));
          }

          wallcounter = 0;

        }



      }
    }

  };

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

    const geometry = new THREE.BoxGeometry(5, this.wallHeight, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, this.wallHeight / 2, -50);
    this.exitDoor.mesh = cube;
    this.scene.add(cube);
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
    this.bounds(); // Adds invisible boundaries to the starting area
  }

  _AddTriggerBoxes() {
    // Trigger body End Game -> Destory Exit Wall
    const triggerGeometry = new THREE.BoxGeometry(4, 1, 1);
    const triggerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
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
        if (this.numberOfKeys == 0) {
          this.liftWall = true;
        } else {
          // alert("Please collect all keys to escape!");
          console.log("Need to collect all Keys!");
        }
      }
    });

    // Trigger body End Game -> Navigate to next level!
    const triggerGeometryEnd = new THREE.BoxGeometry(4, 1, 1);
    const triggerMaterialEnd = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    const triggerEnd = new THREE.Mesh(triggerGeometryEnd, triggerMaterialEnd);
    this.scene.add(triggerEnd);
    const boxShapee = new CANNON.Box(new CANNON.Vec3(4, 1, 1));
    const triggerBodyEnd = new CANNON.Body({ isTrigger: true });
    triggerBodyEnd.addShape(boxShapee);
    triggerBodyEnd.position.set(0, 1.3, -55);
    triggerEnd.position.set(0, 1.3, -55);
    this.world.addBody(triggerBodyEnd);
    triggerBodyEnd.addEventListener("collide", (event) => {
      if (this.numberOfKeys == 2) {
        if (event.body === this.player) {
          window.location = "/levels/Second-Year/Second-Year.html";
        }
      }
    });
  }
}

export { Game };
