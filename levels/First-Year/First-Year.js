import * as THREE from "three";

// Custom Game Class
import { Game } from "../../utilities/Game";
import { Decorator } from "../../utilities/Decorator";

// Post-Processing Effects
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader";
import { vhsScanlines } from "../../assets/Shaders/vhsScanlines";
import { vhsStatic } from "../../assets/Shaders/vhsStatic";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new FirstLevel();
});

class FirstLevel extends Game {
  constructor() {
    super(
      "mayhem/mayhem5/h2s",
      "DesertWall/StuccoRoughCast001",
      "Sand/GroundSand005",
      "GalvanizedZinc/MetalZincGalvanized001",
      "Terazzo/TerrazzoSlab018",
      false
    );
    this.nextLevel = "/~sjmsp/levels/Second-Year/Second-Year.html";
    this.restartLevel = "/~sjmsp/levels/First-Year/First-Year.html";

    this.controls.addEventListener("lock", () => {
      overlay.style.display = "block";
    });

    this.controls.addEventListener("unlock", () => {
      overlay.style.display = "none";
    });

    // this.decorator = new Decorator(this.maze, this.scene, this.world);
    // this.decorator.GlassBlocks();

    // Add Post-Processing Effects
    this._PostProcessing();
  }

  _PostProcessing() {
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const film = new FilmPass(1);
    this.composer.addPass(film);

    // const effectVHSScanlines = new ShaderPass(vhsScanlines);
    // this.composer.addPass(effectVHSScanlines);

    //const hurt = new ShaderPass(hurtPlayer);
    //this.composer.addPass(hurt);

    // const effectVHSStatic = new ShaderPass(vhsStatic);
    // this.composer.addPass(effectVHSStatic);

    //const redVignette = new ShaderPass(VignetteShader);
    //.uniforms['offset'].value = 0.8;
    //redVignettePass.uniforms['darkness'].value = 1.0;
    //redVignette.uniforms["color"].value = new THREE.Color(0.9, 0.0, 0.0);
    //   window.innerWidth,
    //   window.innerHeight
    // );
    // vignette.uniforms["horizontal"].value = true; // default is false
    // vignette.uniforms["radius"].value = 0.8; // default is 0.75
    // vignette.uniforms["softness"].value = 0.3; // default is 0.3
    // vignette.uniforms["gain"].value = 0.3; // default is 0.9
    //this.composer.addPass(redVignette);
    document.getElementById("overlay").style.display = "block";

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }
}
