import * as THREE from 'three';
import { objectStates } from './states.js';

const gravity = new THREE.Vector3(0, -9.81, 0);

function applyGravity(object) {
    if (object.state === objectStates.falling) {
        object.force.addScaledVector(gravity, object.mass);
    }
}

export { applyGravity };