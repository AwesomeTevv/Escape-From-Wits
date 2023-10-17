import * as THREE from "three";
import * as CANNON from "cannon-es";

function worldPlane(scene, world) {
  /**
   * Plane Mesh
   * ? Not infinite
   */
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.quaternion.set(-Math.PI / 2, 0, 0); // make it face up
  scene.add(mesh);

  /**
   * Plane Body
   * ? Infinite
   */
  const shape = new CANNON.Plane();
  const body = new CANNON.Body({ mass: 0, shape: shape });
  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
  world.addBody(body);
}

function worldLight(scene) {
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(hemisphereLight);
}

export class Game {
  constructor(scene, world) {
    worldPlane(scene, world);
    worldLight(scene);
  }
}
