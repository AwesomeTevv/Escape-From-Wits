import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import { PointerLockControlsCannon } from "./PointerLockControlsCannon";
import Stats from "three/examples/jsm/libs/stats.module";

class Game {
  constructor(skyboxImage) {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.mapCamera = null;
    this.rendererMap = null;
    this.controls = null;
    this.world = null;
    this.stats = null;

    this.skybox = null;
    this.skyboxImage = skyboxImage;

    this.ballBodies = [];
    this.ballMeshes = [];
    this.lastCallTime = 0;

    this.player = null;

    this._Init();
    this._BuildWorld();
    this._BuildLights();
    this._AddCharacter();
    this._BindShooting();
    this._AddMaze();

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this._Animate = this._Animate.bind(this);
    this._Animate();
  }

  _Init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

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
      gravity: new CANNON.Vec3(0, -9.8, 0),
    });

    const materialArray = this.createMaterialArray(this.skyboxImage);
    const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    this.skybox = new THREE.Mesh(skyboxGeometry, materialArray);
    this.scene.add(this.skybox);
  }

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

    // Loading in textures
    const loader = new THREE.TextureLoader();
    const map = loader.load(
      "../../assets/ground/GroundDirtRocky020_COL_1K.jpg"
    );
    const bmap = loader.load(
      "../../assets/ground/GroundDirtRocky020_BUMP_1K.jpg"
    );
    const dmap = loader.load(
      "../../assets/ground/GroundDirtRocky020_DISP_1K.jpg"
    );
    const nmap = loader.load(
      "../../assets/ground/GroundDirtRocky020_NRM_1K.jpg"
    );
    const amap = loader.load(
      "../../assets/ground/GroundDirtRocky020_AO_1K.jpg"
    );

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
      displacementScale: 0,
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

  _BuildLights() {
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    dirLight2.position.set(-1, -1, -1);
    dirLight2.castShadow = true;
    this.scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x555555);
    this.scene.add(ambientLight);
  }

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

  _BindShooting() {
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
    });
    window.addEventListener("click", (event) => {
      if (!this.controls.enabled) {
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
  }

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
    this._Render();
  }

  _Render() {
    this.renderer.render(this.scene, this.camera);
    this.rendererMap.render(this.scene, this.mapCamera);
  }

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

  createMaterialArray(filename) {
    const skyboxImagepaths = this.createPathStrings(filename);
    const materialArray = skyboxImagepaths.map((image) => {
      let texture = new THREE.TextureLoader().load(image);
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

  block(x, z) {
    const height = 5;

    const shape = new CANNON.Box(
      new CANNON.Vec3(5 * 0.5, height * 0.5, 5 * 0.5)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      shape,
    });
    body.position.set(x, height / 2, z);
    this.world.addBody(body);

    const geometry = new THREE.BoxGeometry(5, height, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0x0088ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, height / 2, z);
    this.scene.add(cube);
  }

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

  _AddMaze() {
    const maze = this.generateMaze(20, 20);
    this.visualise(maze);

    /**
     * ! Temporary
     * REMOVE AT END
     * This is just to show us where the exit is
     */
    const height = 5;

    const shape = new CANNON.Box(
      new CANNON.Vec3(5 * 0.5, height * 0.5, 5 * 0.5)
    );
    const body = new CANNON.Body({
      type: CANNON.Body.KINEMATIC,
      shape,
    });
    body.position.set(0, height / 2, -50);
    this.world.addBody(body);

    const geometry = new THREE.BoxGeometry(5, height, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, height / 2, -50);
    this.scene.add(cube);
  }
}

export { Game };
