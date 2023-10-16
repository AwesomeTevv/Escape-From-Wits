import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene;
let maze;

function perimeter(maze, scene) {
  const height = 15;
  const length = 100;
  const thickness = 10;

  //   const geometry = new THREE.BoxGeometry(length, height, thickness);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000bb });

  for (let i = -5; i < 5; i++) {
    maze.add(
      new THREE.Mesh(new THREE.BoxGeometry(length, height, thickness), material)
        .rotateY(Math.PI / 2)
        .translateX((i + 0.5) * 100)
        .translateZ(500)
        .translateY(height / 2)
    );

    maze.add(
      new THREE.Mesh(new THREE.BoxGeometry(length, height, thickness), material)
        .rotateY(Math.PI / 2)
        .translateX((-i - 0.5) * 100)
        .translateZ(-500)
        .translateY(height / 2)
    );
  }

  for (let i = -5; i < 5; i++) {
    if (i != -1) {
      maze.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(length, height, thickness),
          material
        )
          .translateX((i + 0.5) * 100)
          .translateZ(500)
          .translateY(height / 2)
      );

      maze.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(length, height, thickness),
          material
        )
          .translateX((-i - 0.5) * 100)
          .translateZ(-500)
          .translateY(height / 2)
      );
    }
  }
}

export function Maze(maze, scene) {
  perimeter(maze, scene);

  const length = 105;
  const height = 10;
  const thickness = 1;

  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });

  //   const help = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  //   for (let i = -500; i <= 500; i += 100) {
  //     maze.add(
  //       new THREE.Mesh(new THREE.BoxGeometry(1000, height, 0.1), help)
  //         .rotateY(Math.PI / 2)
  //         .translateX(0)
  //         .translateZ(i)
  //         .translateY(height / 2)
  //     );

  //     maze.add(
  //       new THREE.Mesh(new THREE.BoxGeometry(1000, height, 0.1), help)
  //         .translateX(0)
  //         .translateZ(i)
  //         .translateY(height / 2)
  //     );
  //   }

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(3.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-3.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(3.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(2.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-1.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-2.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(2.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(1.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(0.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-3.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(4.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(1.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-1.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-2.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-3.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(4.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(0.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-1.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(3.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(0.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-2.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-4.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(4.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(0.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-1.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-3.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(3.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(2.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-0.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(-2.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(4.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .rotateY(Math.PI / 2)
      .translateX(3.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-4.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-4.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-4.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-3.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-3.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-3.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-3.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-3.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-2.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-2.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-2.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-2.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-2.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-1.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-1.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-1.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-0.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-0.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-0.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-0.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(-0.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(0.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(0.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(0.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(0.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(0.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(1.5 * 100)
      .translateZ(-3 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(1.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(1.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(1.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(-4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(2.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(-2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(0 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(2 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(3.5 * 100)
      .translateZ(4 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(4.5 * 100)
      .translateZ(-1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(4.5 * 100)
      .translateZ(1 * 100)
      .translateY(height / 2)
  );

  maze.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness + 4),
      material
    )
      .translateX(4.5 * 100)
      .translateZ(3 * 100)
      .translateY(height / 2)
  );

  scene.add(maze);
}
