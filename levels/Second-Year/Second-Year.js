import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Game } from "../../utilities/Game";
import * as THREE from "three";
import Token from "../../utilities/tokens";

let _App = null;
window.addEventListener("DOMContentLoaded", () => {
  _App = new SecondYear();
});

class SecondYear extends Game {
  constructor() {
    super(
      "mayhem/mayhem1/trough",
      "ZigzagTiles/TilesCeramicHerringbone002",
      "ShinyTiles/TilesZelligeSquaresWeathered001",
      "BrushedSteel/MetalSteelBrushed001",
      "Dots/TilesMosaicPennyround001"
    );
    this.nextLevel = "/levels/Third-Year/Third-Year.html";
    this._AddSecondTokens();
  }
  _AddSecondTokens() {
    console.log("Adding Second Token!");
    let loaderObj = new GLTFLoader();
    loaderObj.load("../../../assets/models/tokens/sword/scene.gltf", (gltf) => {
      let token = new Token();
      token.object = gltf.scene;
      token.object.scale.set(0.001, 0.001, 0.001);
      token.setToggledScale(0.0002, 0.0002, 0.0002);
      token.setToggledRotation(Math.PI * 1.5);
      token.setToggledOffsets(0, -0.5, -0.9);
      token.name = "sword";
      token.object.position.set(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z - 10
      );
      token.loaded = true;
      this.onTokenLoaded(token);
      this.setKeyPos(token);
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
    });
  }
}
