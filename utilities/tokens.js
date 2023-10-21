import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const modelLoader = new GLTFLoader();

// let gun;
// let sword;
// let map;
// let key;


class Token {
    constructor(){
        this.loaded = false;
        this.object = new THREE.Object3D();
        this.toggled = false;
        this.name = "dong";
    }

    animateObject(animationnum) {
        if (this.object === undefined) {
        } 
        else {
          this.object.rotation.y += 0.01;
          this.object.position.y = 0.2 + Math.abs(0.5 * Math.sin(Math.PI * animationnum * 0.005));
        }
      }

      getPosition() {
        if (this.loaded) {
          return {
            x: this.object.position.x,
            y: this.object.position.y,
            z: this.object.position.z
          };
        } else {
          console.warn("Token is not loaded yet.");
          return null; // You might return a specific value or handle it differently
        }
      }
    
    // loadObject(path, scene){

    //     modelLoader.load(path,  (gltf) => {
    //         this.object = gltf.scene;
    //         scene.add(this.object);
    //         this.object.scale.set(100,100,100);
    //       });

          
    //       this.loaded = true;
    // }


}




export default Token