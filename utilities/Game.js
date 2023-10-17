import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Game{
  constructor(){
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;

    this._Init();
    this._BuildWorld();
    this._BuildLights();
    window.addEventListener( 'resize', this.onWindowResize );
    this._Animate = this._Animate.bind(this);
    this._Animate();
  }

  _Init(){
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;  
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    this.camera.position.set( 400, 200, 0 );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.listenToKeyEvents( window ); // optional
  
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
  
    this.controls.screenSpacePanning = false;
  
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
  
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  _BuildWorld(){
    const geometry = new THREE.ConeGeometry( 10, 30, 4, 1 );
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
    for ( let i = 0; i < 500; i ++ ) {
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = Math.random() * 1600 - 800;
      mesh.position.y = 0;
      mesh.position.z = Math.random() * 1600 - 800;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      this.scene.add( mesh );
    }
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

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  
  }

  _Animate(){
    requestAnimationFrame(this._Animate);
    this.controls.update();
    this._Render();
  }

  _Render(){
    this.renderer.render(this.scene, this.camera);
  }

}

export { Game }