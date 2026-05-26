import * as THREE from 'three';


class CollisionPoints {
    constructor() {
        this.a = new THREE.Vector3();
        this.b = new THREE.Vector3();
        this.normal = new THREE.Vector3();
        this.depth = 0;
        this.hasCollision = false;
    }
}

class Transform {
    constructor() {
        this.position = new THREE.Vector3();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.quaternion = new THREE.Quaternion();
    }
}

class Collider {
    testCollision(transform, collider, colliderTransform) {
        throw new Error(`${this.constructor.name} must implement testCollision()`);
    }
    testCollisionWithSphere(transform, sphere, sphereTransform) {
        throw new Error(`${this.constructor.name} must implement testCollisionWithSphere()`);
    }
    testCollisionWithPlane(transform, plane, planeTransform) {
        throw new Error(`${this.constructor.name} must implement testCollisionWithPlane()`);
    }
    testCollisionWithBox(transform, box, boxTransform) {
        throw new Error(`${this.constructor.name} must implement testCollisionWithBox()`);
    }
}

class SphereCollider extends Collider {
    constructor(radius = 0.5) {
        super();
        this.radius = radius;
    }

    testCollision(transform, collider, colliderTransform) {
        return collider.testCollisionWithSphere(colliderTransform, this, transform);
    }
}

class PlaneCollider extends Collider {
    constructor(length = 50, width = 50) {
        super();
        this.length = length;
        this.width = width;
        this.normal = new THREE.Vector3(0, 1, 0);
    }

    getWorldNormal(transform) {
        return this.normal.clone().applyQuaternion(transform.quaternion);
    }

    testCollision(transform, collider, colliderTransform) {
        return collider.testCollisionWithPlane(colliderTransform, this, transform);
    }
}

class BoxCollider extends Collider {
    constructor(halfSize) {
        super();
        this.halfSize = halfSize.clone();
    }
    testCollision(transform, collider, colliderTransform) {
        if (collider instanceof BoxCollider) {
            return this.testCollisionWithBox(transform, collider, colliderTransform);
        }
        return collider.testCollisionWithBox(colliderTransform, this, transform);
    }
}

export { CollisionPoints, Transform, Collider, SphereCollider, PlaneCollider, BoxCollider };