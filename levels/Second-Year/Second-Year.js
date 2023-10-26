import { Game } from "../../utilities/Game";
import * as THREE from "three";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new SecondYear();
});

class SecondYear extends Game {
  constructor() {
    super(
      "mayhem/mayhem1/trough",
      "DesertWall/StuccoRoughCast001",
      "Sand/GroundSand005"
      // "desertWall/StuccoRoughCast001_"
    );
    this.nextLevel = "/levels/Second-Year/Third-Year.html";
    // const geometry = new THREE.ConeGeometry( 10, 30, 4, 1 );
    // const material = new THREE.MeshPhongMaterial( { color: 0x000000, flatShading: true } );
    // for ( let i = 0; i < 500; i ++ ) {
    //   const mesh = new THREE.Mesh( geometry, material );
    //   mesh.position.x = Math.random() * 1600 - 800;
    //   mesh.position.y = 0;
    //   mesh.position.z = Math.random() * 1600 - 800;
    //   mesh.updateMatrix();
    //   mesh.matrixAutoUpdate = false;
    //   this.scene.add(mesh);
    // }
  }
}
