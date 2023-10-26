import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Decoration {
  constructor() {
    /** @type {GLTFLoader} */
    this.loader = new GLTFLoader();

    this.decorationList = [];
    this.decoratorFunctions = [
      this.cemeteryAngel1,
      this.cemeteryAngel2,
      this.cemeteryZeus1,
      this.cemeteryZeus2,
    ];
    this.loadDecorations();
  }

  loadDecorations() {
    this.decoratorFunctions.forEach((func) => {
      const block = func();
      this.decorationList.push(block);
    });
  }

  getDecoration(i) {
    return this.decorationList[i];
  }

  cemeteryAngel1 = () => {
    const block = new THREE.Object3D();

    const bound = this.bounds();
    block.add(bound);

    this.loader.load(
      "../../assets/models/decorations/cemetery_angel_-_furey.glb",
      function (gltf) {
        gltf.scene.scale.set(2.5, 2.5, 2.5);
        gltf.scene.translateY(-5.2);
        block.add(gltf.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    return block;
  };

  cemeteryAngel2 = () => {
    const block = new THREE.Object3D();

    const bound = this.bounds();
    block.add(bound);

    this.loader.load(
      "../../assets/models/decorations/cemetery_angel_-_miller.glb",
      function (gltf) {
        gltf.scene.scale.set(2.5, 2.5, 2.5);
        gltf.scene.translateY(-5.5);
        block.add(gltf.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    return block;
  };

  cemeteryZeus1 = () => {
    const block = new THREE.Object3D();

    const bound = this.bounds();
    block.add(bound);

    this.loader.load(
      "../../assets/models/decorations/cemetery_statuary_-_hey_zeus_no._2.glb",
      function (gltf) {
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        gltf.scene.translateY(-5);
        block.add(gltf.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    return block;
  };

  cemeteryZeus2 = () => {
    const block = new THREE.Object3D();

    const bound = this.bounds();
    block.add(bound);

    this.loader.load(
      "../../assets/models/decorations/cemetery_statuary_-_hey_zeus_no.1.glb",
      function (gltf) {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.translateY(-5);
        block.add(gltf.scene);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );

    return block;
  };

  bounds() {
    const geometry = new THREE.BoxGeometry(4, 10, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
}

export { Decoration };
