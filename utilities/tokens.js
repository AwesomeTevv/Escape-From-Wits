import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const modelLoader = new GLTFLoader();

let gun;
let sword;
let map;
let key;


class Token {
    constructor(){
        this.loaded = false;
        this.object = null;
        this.toggled = false;
    }

    animateObject(object, animationnum) {
        if (object === undefined) {
        } 
        else {
          object.rotation.y += 0.01;
          object.position.y = 0.2 + Math.abs(0.5 * Math.sin(Math.PI * animationnum * 0.005));
        }
      }
    
    loadObject(path){

        modelLoader.load(path, function (gltf) {
            this.object = gltf.scene;
            //this.object.scale.set(0.001, 0.001, 0.001);
            //scene.add(sword);
            //sword.position.set(24.34, 1.35, 44.51);
           
          });

          this.loaded = true;
    }


}


function loadSword() {
    modelLoader.load("/assets/sword/scene.gltf", function (gltf) {
      sword = gltf.scene;
      sword.scale.set(0.001, 0.001, 0.001);
      scene.add(sword);
      sword.position.set(24.34, 1.35, 44.51);
     
    });
  }


  function loadgun() {
    modelLoader.load("/assets/weapons/gun.glb", function (gltf) {
      gun = gltf.scene;
      gun.scale.set(3, 3, 3);
      scene.add(gun);
      gun.position.set(sphereBody.position.x, 0.5, sphereBody.position.z - 2);
    });
  }

  function loadMap() {
    modelLoader.load("/assets/tokens/map.glb", function (gltf) {
      map = gltf.scene;
      scene.add(map);
      map.position.set(-14.6, 1.2, -45.76);
    });
  }


export default Tokens