import * as THREE from 'three';
import { applyGravity } from './gravity.js';
import { Solver } from './solver.js';

class PhysicsWorld {
    constructor(gui = null) {
        this.objects = [];
        this.temp = new THREE.Vector3();
        this.solver = new Solver(0.6);
        this.gui = gui;
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    addSolver(solver) {
        this.solver = solver;
    }

    removeSolver() {
        this.solver = null;
    }

    step(deltaTime) {
        const substeps = 10;
        const dt = deltaTime / substeps;

        for (let step = 0; step < substeps; step++) {
            // Apply forces
            for (const obj of this.objects) {
                if (obj.mass === Infinity) continue;
                applyGravity(obj);
            }

            // Integrate
            for (const obj of this.objects) {
                if (obj.mass === Infinity) continue;
                this.temp.copy(obj.force).divideScalar(obj.mass);
                obj.velocity.addScaledVector(this.temp, dt);
                obj.transform.position.addScaledVector(obj.velocity, dt);

                // rotation
                const w = obj.angularVelocity;
                const angle = w.length();
                if (angle > 0.0001) {
                    const axis = w.clone().normalize();
                    const dq = new THREE.Quaternion();
                    dq.setFromAxisAngle(axis, angle * dt);
                    obj.transform.quaternion.multiply(dq).normalize();
                }

                obj.force.set(0, 0, 0);
            }

            this.resolveCollisions();

            for (const obj of this.objects) {
                obj.velocity.multiplyScalar(0.999);
                obj.angularVelocity.multiplyScalar(0.98);
            }
        }

        for (const obj of this.objects) {
            this.syncObject(obj);
        }
    }

    resolveCollisions() {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const a = this.objects[i];
                const b = this.objects[j];

                if (a.isStatic && b.isStatic) continue;

                const points = a.collider.testCollision(a.transform, b.collider, b.transform);

                if (points.hasCollision) {
                    this.solver.solve(a, b, points);

                    a.mesh.position.copy(a.transform.position);
                    b.mesh.position.copy(b.transform.position);

                    if (this.gui) {
                        const nameA = a.name ?? a.collider.type ?? 'object';
                        const nameB = b.name ?? b.collider.type ?? 'object';
                        this.gui.logCollision(nameA, nameB);
                    }
                }
            }
        }
    }

    syncObject(obj) {
        if (!obj) return;
        if (obj.mesh) {
            obj.mesh.position.copy(obj.transform.position);
            if (obj.meshQuatOffset) {
                obj.mesh.quaternion.copy(obj.transform.quaternion).multiply(obj.meshQuatOffset);
            } else {
                obj.mesh.quaternion.copy(obj.transform.quaternion);
            }
        }

        if (obj.debugMesh) {
            obj.debugMesh.position.copy(obj.transform.position);
            obj.debugMesh.quaternion.copy(obj.transform.quaternion);
        }
    }
}

export { PhysicsWorld };