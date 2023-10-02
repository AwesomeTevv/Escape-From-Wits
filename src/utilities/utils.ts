import RAPIER, { World, RigidBody, RigidBodyDesc, ColliderDesc } from "@dimforge/rapier3d";
import * as THREE from "three";

export const W = 'w';
export const A = 'a';
export const S = 's';
export const D = 'd';
export const DIRECTIONS = [W, A, S, D];

export function body(scene: THREE.Scene, world: World,
    bodyType: 'dynamic' | 'static' | 'kinematicPositionBased',
    colliderType: 'cube' | 'sphere' | 'cylinder' | 'cone', dimension: any,
    translation: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number },
    color: string): { rigid: RigidBody, mesh: THREE.Mesh } {
  
    let bodyDesc: RigidBodyDesc
  
    if (bodyType === 'dynamic') {
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    } else if (bodyType === 'kinematicPositionBased') {
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
    } else if (bodyType === 'static') {
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        bodyDesc.setCanSleep(false);
    }
  
    if (translation) {
        bodyDesc!.setTranslation(translation.x, translation.y, translation.z)
    }
    if(rotation) {
        const q = new THREE.Quaternion().setFromEuler(
            new THREE.Euler( rotation.x, rotation.y, rotation.z, 'XYZ' )
        )
        bodyDesc!.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
    }
  
    let rigidBody = world.createRigidBody(bodyDesc!);
  
    let collider : ColliderDesc;
    if (colliderType === 'cube') {
        collider = RAPIER.ColliderDesc.cuboid(dimension.hx, dimension.hy, dimension.hz);
    } else if (colliderType === 'sphere') {
        collider = RAPIER.ColliderDesc.ball(dimension.radius);
    } else if (colliderType === 'cylinder') {
        collider = RAPIER.ColliderDesc.cylinder(dimension.hh, dimension.radius);
    } else if (colliderType === 'cone') {
        collider = RAPIER.ColliderDesc.cone(dimension.hh, dimension.radius);
        // cone center of mass is at bottom
        collider.centerOfMass = {x:0, y:0, z:0}
    }
    world.createCollider(collider!, rigidBody);
  
    let bufferGeometry;
    if (colliderType === 'cube') {
        bufferGeometry = new THREE.BoxGeometry(dimension.hx * 2, dimension.hy * 2, dimension.hz * 2);
    } else if (colliderType === 'sphere') {
        bufferGeometry = new THREE.SphereGeometry(dimension.radius, 32, 32);
    } else if (colliderType === 'cylinder') {
        bufferGeometry = new THREE.CylinderGeometry(dimension.radius, 
            dimension.radius, dimension.hh * 2,  32, 32);
    } else if (colliderType === 'cone') {
        bufferGeometry = new THREE.ConeGeometry(dimension.radius, dimension.hh * 2,  
            32, 32);
    }
  
    const threeMesh = new THREE.Mesh(bufferGeometry, new THREE.MeshPhongMaterial({ color: color }));
    threeMesh.castShadow = true;
    threeMesh.receiveShadow = true;
    scene.add(threeMesh);
  
    return { rigid: rigidBody, mesh: threeMesh };
  }