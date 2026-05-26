import * as THREE from 'three';
import { CollisionPoints } from './structs.js';

const algo = {
    // Sphere collision detection
    findSphereSphereCollisionPoints(a, transformA, b, transformB) {
        const points = new CollisionPoints();

        const posA = transformA.position.clone();
        const posB = transformB.position.clone();

        const diff = posA.clone().sub(posB);

        const distance = diff.length();
        const radiusSum = a.radius + b.radius;

        if (distance >= radiusSum) return points;

        points.hasCollision = true;

        points.normal = distance > 0.0001
            ? diff.clone().divideScalar(distance)
            : new THREE.Vector3(0, 1, 0);

        points.depth = radiusSum - distance;

        points.a = posA.clone().addScaledVector(points.normal, -a.radius);
        points.b = posB.clone().addScaledVector(points.normal, b.radius);

        return points;
    },

    findSpherePlaneCollisionPoints(sphere, sphereTransform, plane, planeTransform) {
        const points = new CollisionPoints();

        const spherePos = sphereTransform.position.clone();

        const planeNormal = plane.normal.clone().applyQuaternion(planeTransform.quaternion);

        const toSphere = spherePos.clone().sub(planeTransform.position);
        const dist = toSphere.dot(planeNormal);

        if (dist <= 0 || dist >= sphere.radius) return points;

        const planePoint = spherePos.clone().addScaledVector(planeNormal, -dist);

        const localPoint = planePoint.clone().sub(planeTransform.position);
        localPoint.applyQuaternion(planeTransform.quaternion.clone().invert());

        if (Math.abs(localPoint.x) > plane.width / 2 || Math.abs(localPoint.z) > plane.length / 2) {
            return points;
        }

        points.hasCollision = true;
        points.normal = planeNormal.clone();
        points.depth = sphere.radius - dist;

        points.a = spherePos.clone().addScaledVector(planeNormal, -sphere.radius);
        points.b = planePoint;

        return points;
    },


    // Plane collision detection
    findPlaneSphereCollisionPoints(plane, planeTransform, sphere, sphereTransform) {
        const points = new CollisionPoints();

        const spherePos = sphereTransform.position.clone();

        const planeNormal = plane.normal.clone().applyQuaternion(planeTransform.quaternion);

        const toSphere = spherePos.clone().sub(planeTransform.position);
        const dist = toSphere.dot(planeNormal);

        if (dist <= 0 || dist >= sphere.radius) return points;

        const planePoint = spherePos.clone().addScaledVector(planeNormal, -dist);

        const localPoint = planePoint.clone().sub(planeTransform.position);
        localPoint.applyQuaternion(planeTransform.quaternion.clone().invert());

        if (Math.abs(localPoint.x) > plane.width / 2 || Math.abs(localPoint.z) > plane.length / 2) {
            return points;
        }

        points.hasCollision = true;

        points.normal = planeNormal.clone().negate();

        points.depth = sphere.radius - dist;

        points.a = planePoint;
        points.b = spherePos.clone().addScaledVector(planeNormal, -sphere.radius);

        return points;
    },

    // Box collision detection
    findBoxSphereCollisionPoints(box, boxTransform, sphere, sphereTransform) {
        const points = new CollisionPoints();

        // Transform sphere center into box local space
        const sphereWorld = sphereTransform.position.clone();
        const boxPos = boxTransform.position.clone();

        const invQuat = boxTransform.quaternion.clone().invert();
        const localSphere = sphereWorld.clone().sub(boxPos).applyQuaternion(invQuat);

        // Clamp to box bounds to find closest point on box surface
        const closest = new THREE.Vector3(
            Math.max(-box.halfSize.x, Math.min(localSphere.x, box.halfSize.x)),
            Math.max(-box.halfSize.y, Math.min(localSphere.y, box.halfSize.y)),
            Math.max(-box.halfSize.z, Math.min(localSphere.z, box.halfSize.z))
        );

        const diff = localSphere.clone().sub(closest);
        const distance = diff.length();

        if (distance >= sphere.radius) return points;

        // Transform closest point back to world space
        const closestWorld = closest.clone().applyQuaternion(boxTransform.quaternion).add(boxPos);

        points.hasCollision = true;
        points.depth = sphere.radius - distance;

        // Normal points from box to sphere
        points.normal = distance > 0.0001
            ? diff.normalize().applyQuaternion(boxTransform.quaternion)
            : new THREE.Vector3(0, 1, 0);

        points.a = closestWorld;
        points.b = sphereWorld.clone().addScaledVector(points.normal, -sphere.radius);

        return points;
    },

    findBoxPlaneCollisionPoints(box, boxTransform, plane, planeTransform) {
        const points = new CollisionPoints();

        const planeNormal = plane.normal.clone().applyQuaternion(planeTransform.quaternion);
        const planePos = planeTransform.position.clone();
        const invPlaneQuat = planeTransform.quaternion.clone().invert();

        const boxAxes = [
            new THREE.Vector3(1, 0, 0).applyQuaternion(boxTransform.quaternion),
            new THREE.Vector3(0, 1, 0).applyQuaternion(boxTransform.quaternion),
            new THREE.Vector3(0, 0, 1).applyQuaternion(boxTransform.quaternion),
        ];

        const halfSize = box.halfSize;
        const corners = [];
        for (const signX of [-1, 1])
            for (const signY of [-1, 1])
                for (const signZ of [-1, 1]) {
                    const corner = boxTransform.position.clone()
                        .addScaledVector(boxAxes[0], signX * halfSize.x)
                        .addScaledVector(boxAxes[1], signY * halfSize.y)
                        .addScaledVector(boxAxes[2], signZ * halfSize.z);
                    corners.push(corner);
                }

        const penetratingCorners = [];
        let maxPenetrationDepth = 0;

        for (const corner of corners) {
            const distAlongNormal = corner.clone().sub(planePos).dot(planeNormal);

            if (distAlongNormal >= 0) continue;

            const cornerInPlaneSpace = corner.clone().sub(planePos).applyQuaternion(invPlaneQuat);
            if (Math.abs(cornerInPlaneSpace.x) > plane.width / 2 ||
                Math.abs(cornerInPlaneSpace.z) > plane.length / 2) continue;

            penetratingCorners.push(corner);
            if (-distAlongNormal > maxPenetrationDepth) maxPenetrationDepth = -distAlongNormal;
        }

        if (penetratingCorners.length === 0) return points;

        const contactPoint = penetratingCorners
            .reduce((acc, corner) => acc.add(corner), new THREE.Vector3())
            .divideScalar(penetratingCorners.length);

        points.hasCollision = true;
        points.normal = planeNormal.clone();
        points.depth = maxPenetrationDepth;
        points.a = contactPoint.clone();
        points.b = contactPoint.clone().addScaledVector(planeNormal, maxPenetrationDepth);

        return points;
    },

    findBoxBoxCollisionPoints(boxA, transformA, boxB, transformB) {
        const points = new CollisionPoints();

        const axesA = [
            new THREE.Vector3(1, 0, 0).applyQuaternion(transformA.quaternion).normalize(),
            new THREE.Vector3(0, 1, 0).applyQuaternion(transformA.quaternion).normalize(),
            new THREE.Vector3(0, 0, 1).applyQuaternion(transformA.quaternion).normalize(),
        ];
        const axesB = [
            new THREE.Vector3(1, 0, 0).applyQuaternion(transformB.quaternion).normalize(),
            new THREE.Vector3(0, 1, 0).applyQuaternion(transformB.quaternion).normalize(),
            new THREE.Vector3(0, 0, 1).applyQuaternion(transformB.quaternion).normalize(),
        ];

        const centerOffset = transformB.position.clone().sub(transformA.position);

        const axisDotMatrix = [];
        const axisDotMatrixAbs = [];
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            axisDotMatrix[rowIndex] = [];
            axisDotMatrixAbs[rowIndex] = [];
            for (let colIndex = 0; colIndex < 3; colIndex++) {
                const dotVal = axesA[rowIndex].dot(axesB[colIndex]);
                axisDotMatrix[rowIndex][colIndex] = dotVal;
                axisDotMatrixAbs[rowIndex][colIndex] = Math.abs(dotVal) + 1e-6;
            }
        }

        let minOverlap = Infinity;
        let bestAxis = null;
        let bestAxisType = 'face';

        function testAxis(axis, projectionA, projectionB, centerDistance, axisType) {
            const overlap = projectionA + projectionB - Math.abs(centerDistance);
            if (overlap <= 0) return false;
            if (overlap < minOverlap) {
                minOverlap = overlap;
                bestAxis = axis.clone();
                bestAxisType = axisType;
            }
            return true;
        }

        for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
            const axis = axesA[axisIndex];
            const projectionA = boxA.halfSize.getComponent(axisIndex);
            const projectionB =
                boxB.halfSize.x * axisDotMatrixAbs[axisIndex][0] +
                boxB.halfSize.y * axisDotMatrixAbs[axisIndex][1] +
                boxB.halfSize.z * axisDotMatrixAbs[axisIndex][2];
            const centerDistance = centerOffset.dot(axis);
            if (!testAxis(axis, projectionA, projectionB, centerDistance, 'face')) return points;
        }

        for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
            const axis = axesB[axisIndex];
            const projectionA =
                boxA.halfSize.x * axisDotMatrixAbs[0][axisIndex] +
                boxA.halfSize.y * axisDotMatrixAbs[1][axisIndex] +
                boxA.halfSize.z * axisDotMatrixAbs[2][axisIndex];
            const projectionB = boxB.halfSize.getComponent(axisIndex);
            const centerDistance = centerOffset.dot(axis);
            if (!testAxis(axis, projectionA, projectionB, centerDistance, 'face')) return points;
        }

        for (let axisIndexA = 0; axisIndexA < 3; axisIndexA++) {
            for (let axisIndexB = 0; axisIndexB < 3; axisIndexB++) {
                const crossAxis = axesA[axisIndexA].clone().cross(axesB[axisIndexB]);
                if (crossAxis.lengthSq() < 1e-6) continue;
                crossAxis.normalize();

                const projectionA =
                    boxA.halfSize.x * Math.abs(crossAxis.dot(axesA[0])) +
                    boxA.halfSize.y * Math.abs(crossAxis.dot(axesA[1])) +
                    boxA.halfSize.z * Math.abs(crossAxis.dot(axesA[2]));
                const projectionB =
                    boxB.halfSize.x * Math.abs(crossAxis.dot(axesB[0])) +
                    boxB.halfSize.y * Math.abs(crossAxis.dot(axesB[1])) +
                    boxB.halfSize.z * Math.abs(crossAxis.dot(axesB[2]));

                const centerDistance = centerOffset.dot(crossAxis);
                if (!testAxis(crossAxis, projectionA, projectionB, centerDistance, 'edge')) return points;
            }
        }

        if (!bestAxis) return points;

        if (bestAxis.dot(centerOffset) < 0) bestAxis.negate();

        points.hasCollision = true;
        points.normal = bestAxis;
        points.depth = minOverlap;

        const supportExtentA = new THREE.Vector3(
            Math.abs(bestAxis.dot(axesA[0])),
            Math.abs(bestAxis.dot(axesA[1])),
            Math.abs(bestAxis.dot(axesA[2]))
        );
        const supportExtentB = new THREE.Vector3(
            Math.abs(bestAxis.dot(axesB[0])),
            Math.abs(bestAxis.dot(axesB[1])),
            Math.abs(bestAxis.dot(axesB[2]))
        );

        const supportPointA = transformA.position.clone()
            .addScaledVector(bestAxis, boxA.halfSize.dot(supportExtentA));
        const supportPointB = transformB.position.clone()
            .addScaledVector(bestAxis, -boxB.halfSize.dot(supportExtentB));

        if (bestAxisType === 'face') {
            const contactMid = supportPointA.clone().add(supportPointB).multiplyScalar(0.5);
            points.a = contactMid.clone();
            points.b = contactMid.clone();
        } else {
            // Edge-edge
            const edgeAxisA = axesA[(() => {
                let minAlignment = Infinity;
                let bestIndex = 0;
                for (let index = 0; index < 3; index++) {
                    const alignment = Math.abs(bestAxis.dot(axesA[index]));
                    if (alignment < minAlignment) { minAlignment = alignment; bestIndex = index; }
                }
                return bestIndex;
            })()].clone();

            const edgeAxisB = axesB[(() => {
                let minAlignment = Infinity;
                let bestIndex = 0;
                for (let index = 0; index < 3; index++) {
                    const alignment = Math.abs(bestAxis.dot(axesB[index]));
                    if (alignment < minAlignment) { minAlignment = alignment; bestIndex = index; }
                }
                return bestIndex;
            })()].clone();

            const originDiff = supportPointA.clone().sub(supportPointB);
            const edgeALenSq = edgeAxisA.dot(edgeAxisA);
            const edgeBLenSq = edgeAxisB.dot(edgeAxisB);
            const edgeAxesDot = edgeAxisA.dot(edgeAxisB);
            const diffDotEdgeB = edgeAxisB.dot(originDiff);
            const diffDotEdgeA = edgeAxisA.dot(originDiff);
            const denom = edgeALenSq * edgeBLenSq - edgeAxesDot * edgeAxesDot;

            let paramA, paramB;
            if (Math.abs(denom) > 1e-6) {
                paramA = (edgeAxesDot * diffDotEdgeB - edgeBLenSq * diffDotEdgeA) / denom;
                paramB = (diffDotEdgeB + edgeAxesDot * paramA) / edgeBLenSq;
            } else {
                paramA = 0;
                paramB = 0;
            }

            const closestOnEdgeA = supportPointA.clone().addScaledVector(edgeAxisA, paramA);
            const closestOnEdgeB = supportPointB.clone().addScaledVector(edgeAxisB, paramB);
            const contactMid = closestOnEdgeA.clone().add(closestOnEdgeB).multiplyScalar(0.5);

            points.a = contactMid.clone();
            points.b = contactMid.clone();
        }

        return points;
    },
};

export { algo };