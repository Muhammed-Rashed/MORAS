import * as THREE from 'three';
import { objectStates } from './states.js';
import { Transform, SphereCollider, PlaneCollider, BoxCollider } from './structs.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class PhysicsObject {
    /**
     * @param {THREE.BufferGeometry} shape
     * @param {number} mass
     * @param {THREE.Material} [material]
     * @param {THREE.Quaternion} [quaternion]
     * @param {object} [options]
     * @param {boolean} [options.pickable=false]
     * @param {boolean} [options.readable=false] - also sets pickable
     */
    constructor(shape, mass = 1, material, quaternion, options = {}) {
        this.mass = mass;
        this.state = objectStates.falling;
        this.velocity = new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3();
        this.transform = new Transform();
        this.collider = null;
        this.debugMesh = null;

        if (!material) {
            material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        }
        this.mesh = new THREE.Mesh(shape, material);

        if (quaternion) {
            this.transform.quaternion.copy(quaternion);
        }

        this.position = this.transform.position;

        if (this.mass === Infinity) {
            this.invMass = 0;
            this.invInertia = 0;
        } else {
            this.invMass = 1 / this.mass;
            this.inertia = this.mass;
            this.invInertia = 1 / this.inertia;
        }

        this.readable = options.readable ?? false;
        this.pickable = this.readable || (options.pickable ?? false);
        this.readableId = options.readableId ?? null;
    }

    static sphere(radius = 0.5, mass = 1, material, options = {}) {
        const obj = new PhysicsObject(
            new THREE.SphereGeometry(radius, 16, 16),
            mass,
            material,
            undefined,
            options
        );
        obj.collider = new SphereCollider(radius);
        if (mass !== Infinity) {
            obj.inertia = (2 / 5) * mass * radius * radius;
            obj.invInertia = 1 / obj.inertia;
        }
        return obj;
    }

    static plane(width = 50, height = 50, material, options = {}) {
        const obj = new PhysicsObject(
            new THREE.PlaneGeometry(width, height),
            Infinity,
            material,
            undefined,
            options
        );
        obj.collider = new PlaneCollider(height, width);
        obj.invMass = 0;
        obj.invInertia = 0;
        return obj;
    }

    static cube(sizeX = 1, sizeY, sizeZ, mass = 1, material, options = {}) {
        if (typeof sizeY !== 'number' || typeof sizeZ !== 'number') {
            options = material ?? {};
            material = sizeZ;
            mass = typeof sizeY === 'number' ? sizeY : 1;
            sizeY = sizeX;
            sizeZ = sizeX;
        }

        const geo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);

        const obj = new PhysicsObject(geo, mass, material, undefined, options);

        if (options.rotY) {
            obj.transform.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0), options.rotY
            );
        }

        obj.collider = new BoxCollider(
            new THREE.Vector3(sizeX / 2, sizeY / 2, sizeZ / 2)
        );

        if (mass !== Infinity) {
            obj.inertia = (1 / 12) * mass * (sizeY * sizeY + sizeZ * sizeZ);
            obj.invInertia = 1 / obj.inertia;
        }
        return obj;
    }

    static gltf(url, sizeX = 1, sizeY = 1, sizeZ = 1, mass = 1, options = {}) {
        const placeholderGeo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
        const placeholderMat = new THREE.MeshBasicMaterial({ visible: false });

        const obj = new PhysicsObject(placeholderGeo, mass, placeholderMat, undefined, options);

        const colliderScale = options.colliderScale ?? new THREE.Vector3(1, 1, 1);

        if (options.rotY) {
            obj.transform.quaternion.setFromAxisAngle(
                new THREE.Vector3(0, 1, 0), options.rotY
            );
        }

        obj.collider = new BoxCollider(
            new THREE.Vector3(
                (sizeX * colliderScale.x) / 2,
                (sizeY * colliderScale.y) / 2,
                (sizeZ * colliderScale.z) / 2
            )
        );

        if (mass !== Infinity) {
            obj.inertia = (1 / 12) * mass * (sizeY * sizeY + sizeZ * sizeZ);
            obj.invInertia = 1 / obj.inertia;
        }

        new GLTFLoader().load(url, (gltf) => {
            const model = gltf.scene;

            // Scale to match the collider box size so it looks right
            const scale = options.modelScale ?? new THREE.Vector3(sizeX, sizeY, sizeZ);
            model.scale.copy(scale);

            // visual offset
            if (options.modelOffset) {
                model.position.copy(options.modelOffset);
            }

            // Replace placeholder mesh contents with the model
            // We keep obj.mesh (a THREE.Mesh) as the scene anchor and add the gltf scene as a child
            obj.mesh.geometry.dispose();
            obj.mesh.material.dispose();
            obj.mesh.geometry = new THREE.BufferGeometry();
            obj.mesh.material = new THREE.MeshBasicMaterial({ visible: false });
            obj.mesh.add(model);

            obj._gltfLoaded = true;

            if (obj.onLoaded) obj.onLoaded(model);
            
        }, undefined, (err) => {
            console.error('[PhysicsObject.gltf] Failed to load:', url, err);
        });

        return obj;
    }
}

export { PhysicsObject };