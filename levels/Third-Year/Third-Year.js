import * as THREE from "three";

// Custom Classes
import { Game } from "../../utilities/Game";

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

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new ThirdYear();
});

class ThirdYear extends Game {
  constructor() {
    super(
      "mayhem/mayhem8/flame",
      "Bricks/BricksReclaimedWhitewashedOffset001",
      "Grass/GroundGrassGreen002"
      // "desertWall/StuccoRoughCast001_"
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

    const badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
    // this.addPass(badTVPass);
    badTVPass.renderToScreen = true;

    const effect4 = new OutputPass();
    this.composer.addPass(effect4);

    // ----------------------------------------------------
  }
}
