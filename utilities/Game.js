import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { PointerLockControlsCannon } from "./PointerLockControlsCannon";
import Stats from "three/examples/jsm/libs/stats.module";

class Game{
  constructor(){
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.mapCamera = null;
    this.rendererMap = null;
    this.controls = null;
    this.world = null;
    this.stats = null;

    this.ballBodies = [];
    this.ballMeshes = [];
    this.lastCallTime = 0;

    this.player = null;

    this._Init();
    this._BuildWorld();
    this._BuildLights();
    this._AddCharacter();
    this._BindShooting();

    window.addEventListener( 'resize', () =>{
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    
      this.renderer.setSize( window.innerWidth, window.innerHeight );  
    });

    this._Animate = this._Animate.bind(this);
    this._Animate();
  }

  _Init(){
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;  
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, 0);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.listenToKeyEvents( window ); // optional
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
    this.mapCamera.lookAt(new THREE.Vector3(0, -1, 0));
    this.mapCamera.position.set(0, 5, 0);
    this.scene.add(this.mapCamera);
    let mapCanvas = document.getElementById("minimap");
    this.rendererMap = new THREE.WebGLRenderer({ canvas: mapCanvas });
    this.rendererMap.setSize(200, 200);

    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    document.body.appendChild(this.stats.domElement);

    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0,-9.8,0)
    });
  }

  _BuildWorld(){
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
    const groundBody = new CANNON.Body({ mass: 0, material: physicsContactMat });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Loading in textures
    const loader = new THREE.TextureLoader();
    const map = loader.load("../../assets/ground/GroundDirtRocky020_COL_1K.jpg");
    const bmap = loader.load("../../assets/ground/GroundDirtRocky020_BUMP_1K.jpg");
    const dmap = loader.load("../../assets/ground/GroundDirtRocky020_DISP_1K.jpg");
    const nmap = loader.load("../../assets/ground/GroundDirtRocky020_NRM_1K.jpg");
    const amap = loader.load("../../assets/ground/GroundDirtRocky020_AO_1K.jpg");

    const scale = 500;
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
      shininess: 10,
      bumpMap: bmap,
      bumpScale: 1,
      displacementMap: dmap,
      displacementScale: 0.1,
      normalMap: nmap,
      aoMap: amap,
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

  _BuildLights(){
    const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight1.position.set( 1, 1, 1 );
    this.scene.add( dirLight1 );
  
    const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
    dirLight2.position.set( - 1, - 1, - 1 );
    this.scene.add( dirLight2 );
  
    const ambientLight = new THREE.AmbientLight( 0x555555 );
    this.scene.add( ambientLight );
  }

  _AddCharacter(){
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
    let characterBody = new CANNON.Body({ mass: 5, material: physicsContactMat });
    characterBody.addShape(characterShape);
    characterBody.linearDamping = 0.9;
    this.player = characterBody;
    this.world.addBody(this.player);
    this.controls = new PointerLockControlsCannon(this.camera,this.player);
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
  }

  _BindShooting(){
    const shootVelocity = 10;
    const ballShape = new CANNON.Sphere(0.2);
    const ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
  
    window.addEventListener("click", (event) => {
      if (!this.controls.enabled) {
        return;
      }
      
      const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
      const ballBody = new CANNON.Body({ mass: 1 });
      ballBody.addShape(ballShape);
      const ballMesh = new THREE.Mesh(ballGeometry, material);
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
  }

  _Animate(){
    requestAnimationFrame(this._Animate);
    const timeStep = 1/60;
    const time = performance.now() / 1000;
    const dt = time - this.lastCallTime;
    this.lastCallTime = time;
    
    this.world.step(timeStep,dt);
    while(this.ballBodies.length > 10){
      let body = this.ballBodies.shift();
      let mesh = this.ballMeshes.shift();
      this.world.removeBody(body);
      this.scene.remove(mesh);
    }

    for(let i = 0; i < this.ballBodies.length; i++){
      this.ballMeshes[i].position.copy(this.ballBodies[i].position);
      this.ballMeshes[i].quaternion.copy(this.ballBodies[i].quaternion);
    }

    let pos = this.player.position.clone();
    this.mapCamera.position.x = pos.x;
    this.mapCamera.position.z = pos.z;
    this.mapCamera.lookAt(new THREE.Vector3(pos.x, -1, pos.z));

    this.controls.update(dt);
    this.stats.update();
    this._Render();
  }

  _Render(){
    this.renderer.render(this.scene, this.camera);
    this.rendererMap.render(this.scene, this.mapCamera);
  }
}

export { Game }