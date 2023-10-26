import * as THREE from "three";

// Custom Classes
import { Game } from "../../utilities/Game";
import { Decorator } from "../../utilities/Decorator";

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

    const decorator = new Decorator(this.maze, this.scene);
    decorator.DecorateDeadEnds();
  }

  _PostProcessing() {
    /**
     * Post-Processing
     * ----------------------------------------------------
     */
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
  }
}
