import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Custom Classes
import { Game } from "../../utilities/Game";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import Token from "../../utilities/tokens";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new ThirdYear();
});

class ThirdYear extends Game {
  constructor() {
    super(
      "mayhem/mayhem6/grouse",
      "Bricks/BricksReclaimedWhitewashedOffset001",
      "Grass/GroundGrassGreen002",
      "Bronze/MetalBronzeWorn001",
      "Bricks2/StoneBricksSplitface001",
      false
    );

    this._AddSecondTokens();
    this._PostProcessing();
    this.nextLevel = "/~sjmsp/";
    this.restartLevel = "/~sjmsp/levels/Third-Year/Third-Year.html";
  }

  _AddSecondTokens() {
    console.log("Adding Second Token!");
    let loaderObj = new GLTFLoader();
    loaderObj.load(
      "../../../assets/models/tokens/guitar/scene.gltf",
      (gltf) => {
        let token = new Token();
        token.object = gltf.scene;
        //token.object.scale.set(0.001, 0.001, 0.001);
        token.setToggledScale(0.1, 0.1, 0.1);
        token.setToggledRotation(Math.PI);
        token.setToggledOffsets(-0.2, -0.5, -0.9);
        token.name = "guitar";
        token.loaded = true;
        this.onTokenLoaded(token);
        this.setKeyPos(token);
        this.totalKeys += 1;
        token.sound = new THREE.PositionalAudio(this.AudioListener);
        token.object.add(token.sound);
        new THREE.AudioLoader().load(
          "../../assets/sounds/wind-chimes-bells-115747.mp3",
          (buffer) => {
            token.sound.setBuffer(buffer);
            token.sound.setLoop(true);
            token.sound.setVolume(1);
            token.sound.setRefDistance(0.1);
            token.sound.play();
          }
        );
        this._SpawnNPC(token);
      }
    );

    loaderObj.load("../../../assets/models/tokens/grad/scene.gltf", (gltf) => {
      let token2 = new Token();
      token2.object = gltf.scene;
      token2.object.scale.set(0.1, 0.1, 0.1);
      token2.setToggledScale(0.01, 0.01, 0.01);
      token2.setToggledRotation(Math.PI * 1.5);
      token2.setToggledOffsets(-0.5, -0.5, -0.9);
      token2.name = "diploma";
      token2.loaded = true;
      this.onTokenLoaded(token2);
      this.setKeyPos(token2);
      this.totalKeys += 1;
      numTokensText.textContent = `${0}/${3}`;
      token2.sound = new THREE.PositionalAudio(this.AudioListener);
      token2.object.add(token2.sound);
      new THREE.AudioLoader().load(
        "../../assets/sounds/wind-chimes-bells-115747.mp3",
        (buffer) => {
          token2.sound.setBuffer(buffer);
          token2.sound.setLoop(true);
          token2.sound.setVolume(1);
          token2.sound.setRefDistance(0.1);
          token2.sound.play();
        }
      );
      this._SpawnNPC(token2);
    });
  }

  _PostProcessing() {
    /**
     * Post-Processing
     * ----------------------------------------------------
     */
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const effectFilm = new FilmPass(1);
    this.composer.addPass(effectFilm);

    const effect4 = new OutputPass();
    this.composer.addPass(effect4);

    // ----------------------------------------------------
  }
}
