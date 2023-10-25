import * as THREE from "three";

// Custom Game Class
import { Game } from "../../utilities/Game";

// Post-Processing Effects
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new FirstLevel();
});

class FirstLevel extends Game {
  constructor() {
    super(
      "mayhem/mayhem8/flame",
      "Bricks/BricksReclaimedWhitewashedOffset001",
      "Sand/GroundSand005"
      // "desertWall/StuccoRoughCast001_"
    );

    // Add Post-Processing Effects
    this._PostProcessing();
  }
  _PostProcessing() {
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const effectFilm = new FilmPass(4);
    this.composer.addPass(effectFilm);

    const vignette = new ShaderPass(VignetteShader);
    // vignette.uniforms["resolution"].value = new THREE.Vector2(
    //   window.innerWidth,
    //   window.innerHeight
    // );
    // vignette.uniforms["horizontal"].value = true; // default is false
    // vignette.uniforms["radius"].value = 0.8; // default is 0.75
    // vignette.uniforms["softness"].value = 0.3; // default is 0.3
    // vignette.uniforms["gain"].value = 0.3; // default is 0.9
    this.composer.addPass(vignette);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }
}
