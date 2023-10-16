import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as CANNON from "cannon-es";

const loader = new THREE.TextureLoader();

function add(
  scene,
  world,
  length,
  height,
  thickness,
  rotation,
  tx,
  tz,
  material
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(length, height, thickness),
    material
  )
    .rotateY(rotation)
    .translateX(tx)
    .translateY(height / 2)
    .translateZ(tz);
  scene.add(mesh);

  const body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(length, height, thickness)),
    position: new CANNON.Vec3(
      mesh.position.x,
      mesh.position.y,
      mesh.position.z
    ),
    quaternion: new CANNON.Quaternion(mesh.quaternion.clone()),
  });
  world.addBody(body);
}

function perimeter(scene, world) {
  const height = 15;
  const length = 10;
  const thickness = 5;

  // Loading in textures
  const map = loader.load(
    "/assets/desertWall/StuccoRoughCast001_COL_2K_SPECULAR.png"
  );
  const bmap = loader.load(
    "/assets/desertWall/StuccoRoughCast001_BUMP_2K_SPECULAR.png"
  );
  const dmap = loader.load(
    "/assets/desertWall/StuccoRoughCast001_DISP_2K_SPECULAR.png"
  );

  const scale = 10;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(scale, scale / 1);

  bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
  bmap.repeat.set(scale, scale / 1);

  dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
  dmap.repeat.set(scale, scale / 1);

  const material = new THREE.MeshPhongMaterial({
    specular: 0x666666,
    shininess: 50,
    bumpMap: bmap,
    bumpScale: 0.3,
    displacementMap: dmap,
    displacementScale: 0,
    map: map,
    depthTest: true,
  });

  //   const geometry = new THREE.BoxGeometry(length, height, thickness);
  // const material = new THREE.MeshPhongMaterial({ color: 0x0000bb });

  for (let i = -5; i < 5; i++) {
    add(
      scene,
      world,
      length,
      height,
      thickness,
      Math.PI / 2,
      (i + 0.5) * 10,
      50,
      material
    );

    add(
      scene,
      world,
      length,
      height,
      thickness,
      Math.PI / 2,
      (-i - 0.5) * 10,
      -50,
      material
    );
  }

  for (let i = -5; i < 5; i++) {
    if (i != -1) {
      //   scene.add(
      //     new THREE.Mesh(
      //       new THREE.BoxGeometry(length, height, thickness),
      //       material
      //     )
      //       .translateX((i + 0.5) * 100)
      //       .translateZ(500)
      //       .translateY(height / 2)
      //   );
      add(
        scene,
        world,
        length,
        height,
        thickness,
        0,
        (i + 0.5) * 10,
        50,
        material
      );

      //   scene.add(
      //     new THREE.Mesh(
      //       new THREE.BoxGeometry(length, height, thickness),
      //       material
      //     )
      //       .translateX((-i - 0.5) * 100)
      //       .translateZ(-500)
      //       .translateY(height / 2)
      //   );
      add(
        scene,
        world,
        length,
        height,
        thickness,
        0,
        (-i - 0.5) * 10,
        -50,
        material
      );
    }
  }
}

export function Maze(scene, world) {
  perimeter(scene, world);

  const length = 15;
  const height = 10;
  const thickness = 5;

  // Loading in textures
  const map = loader.load(
    "/assets/bricks/BricksReclaimedWhitewashedOffset001_COL_2K_METALNESS.png"
  );
  const bmap = loader.load(
    "/assets/bricks/BricksReclaimedWhitewashedOffset001_BUMP_2K_METALNESS.png"
  );
  const dmap = loader.load(
    "/assets/bricks/BricksReclaimedWhitewashedOffset001_DISP_2K_METALNESS.png"
  );

  const scale = 2;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(scale, scale * (height / length));

  bmap.wrapS = bmap.wrapT = THREE.RepeatWrapping;
  bmap.repeat.set(scale, scale * (height / length));

  dmap.wrapS = dmap.wrapT = THREE.RepeatWrapping;
  dmap.repeat.set(scale, scale * (height / length));

  const material = new THREE.MeshPhongMaterial({
    specular: 0x666666,
    shininess: 50,
    bumpMap: bmap,
    bumpScale: 0.3,
    displacementMap: dmap,
    displacementScale: 0,
    map: map,
    depthTest: true,
  });

  //   const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });

  //   const help = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  //   for (let i = -500; i <= 500; i += 100) {
  //     scene.add(
  //       new THREE.Mesh(new THREE.BoxGeometry(1000, height, 0.1), help)
  //         .rotateY(Math.PI / 2)
  //         .translateX(0)
  //         .translateZ(i)
  //         .translateY(height / 2)
  //     );

  //     scene.add(
  //       new THREE.Mesh(new THREE.BoxGeometry(1000, height, 0.1), help)
  //         .translateX(0)
  //         .translateZ(i)
  //         .translateY(height / 2)
  //     );
  //   }

  let rotations = [
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ];
  let tx = [
    3, -1, -4, 3, 2, -2, -3, 2, 1, 0, -1, -4, 4, 1, -2, -3, -4, 4, 0, -1, -2, 3,
    0, -1, -3, -5, 4, 0, -1, -2, -4, 4, 3, 2, -1, -3, 4, 3, -5, -5, -5, -4, -4,
    -4, -4, -4, -3, -3, -3, -3, -3, -2, -2, -2, -1, -1, -1, -1, -1, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4,
  ];
  let tz = [
    -4, -4, -4, -3, -3, -3, -3, -2, -2, -2, -2, -2, -1, -1, -1, -1, -1, 0, 0, 0,
    1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, -3, -1, 2, -2, -1, 0, 3,
    4, -4, -2, 0, 2, 3, -3, 0, 2, -3, -2, -1, 1, 4, -4, -3, -2, 1, 3, -3, -2, 2,
    4, -4, -2, -1, 2, 4, -2, -1, 0, 1, 2, 4, -1, 1, 3,
  ];

  for (let i = 0; i < rotations.length; i++) {
    add(
      scene,
      world,
      length,
      height,
      thickness,
      rotations[i],
      (tx[i] + 0.5) * 10,
      tz[i] * 10,
      material
    );
  }
}
