import * as THREE from 'three';
import { PhysicsObject } from '../engine/object.js';
import { PlayerMovement } from './Movement.js';

export class Player {
    constructor(scene, physicsWorld) {
        this.physicsObject = PhysicsObject.cube(0.8, 1.8, 0.8, 70);
        this.physicsObject.transform.position.set(0, 3, 10);
        this.physicsObject.mesh.visible = false;

        this.physicsObject.invInertia = 0;
        this.physicsObject.restitution = 0;

        // Track eye offset dynamically (Defaults to standing height)
        this.currentEyeOffset = 1.6;

        scene.add(this.physicsObject.mesh);
        physicsWorld.addObject(this.physicsObject);

        this.movement = new PlayerMovement(this);
    }

    get mesh() { return this.physicsObject.mesh; }

    update(cameraYaw = 0) {
        this.movement.update(cameraYaw);
    }
}