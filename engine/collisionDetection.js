import { algo } from './algo.js';
import { CollisionPoints, SphereCollider, PlaneCollider, BoxCollider } from './structs.js';

// Sphere
SphereCollider.prototype.testCollisionWithSphere = function (transform, sphere, sphereTransform) {
    return algo.findSphereSphereCollisionPoints(this, transform, sphere, sphereTransform);
};

SphereCollider.prototype.testCollisionWithPlane = function (transform, plane, planeTransform) {
    return algo.findSpherePlaneCollisionPoints(this, transform, plane, planeTransform);
};

SphereCollider.prototype.testCollisionWithBox = function (transform, box, boxTransform) {
    return algo.findBoxSphereCollisionPoints(box, boxTransform, this, transform);
};


// Plane
PlaneCollider.prototype.testCollisionWithSphere = function (transform, sphere, sphereTransform) {
    return algo.findSpherePlaneCollisionPoints(sphere, sphereTransform, this, transform);
};

PlaneCollider.prototype.testCollisionWithBox = function (transform, box, boxTransform) {
    return algo.findBoxPlaneCollisionPoints(box, boxTransform, this, transform);
};

PlaneCollider.prototype.testCollisionWithPlane = function (transform, plane, planeTransform) {
    return new CollisionPoints();
};

// Box
BoxCollider.prototype.testCollisionWithSphere = function (transform, sphere, sphereTransform) {
    const result = algo.findBoxSphereCollisionPoints(this, transform, sphere, sphereTransform);
    result.normal.negate();
    return result;
};

BoxCollider.prototype.testCollisionWithPlane = function (transform, plane, planeTransform) {
    return algo.findBoxPlaneCollisionPoints(this, transform, plane, planeTransform);
};

BoxCollider.prototype.testCollisionWithBox = function (transform, box, boxTransform) {
    return algo.findBoxBoxCollisionPoints(this, transform, box, boxTransform);
};

// Convix