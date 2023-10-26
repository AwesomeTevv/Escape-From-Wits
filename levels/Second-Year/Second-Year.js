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
      "ConcretePanels/ConcretePrecastPlates004",
      "ShinyTiles/TilesZelligeSquaresWeathered001",
      "BrushedSteel/MetalSteelBrushed001"
    );
    this.nextLevel = "/levels/Third-Year/Third-Year.html";
  }
}
