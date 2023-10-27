import * as THREE from "three";

// Custom Game Class
import { Game } from "../../utilities/Game";

// Post-Processing Effects
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

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
    numTokensText.textContent = `${0}/${1}`;

    // Add Post-Processing Effects
    // this._PostProcessing();
  }

  _PostProcessing() {
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const film = new FilmPass(1);
    this.composer.addPass(film);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }
}
