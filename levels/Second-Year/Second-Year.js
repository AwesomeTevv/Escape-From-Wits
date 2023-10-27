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
      "nebula3/nebula3",
      "ZigzagTiles/TilesCeramicHerringbone002",
      "ShinyTiles/TilesZelligeSquaresWeathered001",
      "BrushedSteel/MetalSteelBrushed001",
      "Dots/TilesMosaicPennyround001",
      true
    );
    this.nextLevel = "/~sjmsp/levels/Third-Year/Third-Year.html";
    this.restartLevel = "/~sjmsp/levels/Second-Year/Second-Year.html";
    this._AddSecondTokens();
  }
  _AddSecondTokens() {
    console.log("Adding Second Token!");
    let loaderObj = new GLTFLoader();
    loaderObj.load(
      "../../../assets/models/tokens/batman/scene.gltf",
      (gltf) => {
        let token = new Token();
        token.object = gltf.scene;
        token.object.scale.set(0.2, 0.2, 0.2);
        token.setToggledScale(0.1, 0.1, 0.1);
        token.setToggledRotation(Math.PI * 2);
        token.setToggledOffsets(-0.2, -0.6, -0.9);
        token.name = "doll";
        token.loaded = true;
        this.onTokenLoaded(token);
        this.setKeyPos(token);
        this.totalKeys += 1;
        numTokensText.textContent=`${0} out of  ${this.totalKeys}`;
        console.log(
          "This is the second token position " +
            token.object.position.x +
            " " +
            token.object.position.z
        );
        //token.object.position.set(this.player.position.x + 2, this.player.position.y, this.player.position.z );
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
  }
}
