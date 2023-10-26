import * as THREE from "three";

// Custom Classes
import { Game } from "../../utilities/Game";
import { Decorator } from "../../utilities/Decorator";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new ThirdYear();
});

class ThirdYear extends Game {
  constructor() {
    super(
      "mayhem/mayhem8/flame",
      "Bricks/BricksReclaimedWhitewashedOffset001",
      "Grass/GroundGrassGreen002",
      "Bronze/MetalBronzeWorn001",
      "Dots/TilesMosaicPennyround001"
    );

    // const decorator = new Decorator(this.maze, this.scene);
    // decorator.DecorateDeadEnds();

    this._PostProcessing();
  }

  _PostProcessing() {
    /**
     * Post-Processing
     * ----------------------------------------------------
     */
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const effectFilm = new FilmPass(1);
    this.composer.addPass(effectFilm);

    // const bloom = new BloomPass(1);
    // this.composer.addPass(bloom);

    const effect4 = new OutputPass();
    this.composer.addPass(effect4);

    // ----------------------------------------------------
  }
}
