import * as THREE from 'three';

class Solver {
    constructor(restitution = 0.5) {
        this.restitution = restitution;
    }

    solve(a, b, points) {
        const invMassA = a.invMass;
        const invMassB = b.invMass;

        if (invMassA + invMassB === 0) return;

        const normal = points.normal;

        const ra = points.a.clone().sub(a.transform.position);
        const rb = points.b.clone().sub(b.transform.position);

        const velA = a.velocity.clone().add(a.angularVelocity.clone().cross(ra));
        const velB = b.velocity.clone().add(b.angularVelocity.clone().cross(rb));

        const relativeVelocity = velB.sub(velA);
        const contactVelocity = relativeVelocity.dot(normal);

        if (contactVelocity > 0) return;

        const raCrossN = ra.clone().cross(normal);
        const rbCrossN = rb.clone().cross(normal);

        const denom =
            invMassA +
            invMassB +
            raCrossN.lengthSq() * a.invInertia +
            rbCrossN.lengthSq() * b.invInertia;

        // Use the lower of the two objects restitution values.
        // If either object has restitution = 0 (e.g. the player), no bounce.
        const restitutionA = a.restitution ?? this.restitution;
        const restitutionB = b.restitution ?? this.restitution;
        const e = Math.min(restitutionA, restitutionB);

        let j = -(1 + e) * contactVelocity;
        j /= denom;

        const impulse = normal.clone().multiplyScalar(j);

        if (invMassA !== 0) {
            a.velocity.sub(impulse.clone().multiplyScalar(invMassA));
        }
        if (invMassB !== 0) {
            b.velocity.add(impulse.clone().multiplyScalar(invMassB));
        }

        if (invMassA !== 0) {
            const angA = ra.clone().cross(impulse).multiplyScalar(a.invInertia);
            a.angularVelocity.sub(angA);
            if (a.angularVelocity.length() > 20) a.angularVelocity.setLength(20);
        }

        if (invMassB !== 0) {
            const angB = rb.clone().cross(impulse).multiplyScalar(b.invInertia);
            b.angularVelocity.add(angB);
            if (b.angularVelocity.length() > 20) b.angularVelocity.setLength(20);
        }

        const percent = 0.4;
        const slop = 0.01;

        const correctionMag =
            Math.max(points.depth - slop, 0) / (invMassA + invMassB) * percent;

        const correction = normal.clone().multiplyScalar(correctionMag);

        if (invMassA !== 0) {
            a.transform.position.sub(correction.clone().multiplyScalar(invMassA));
        }
        if (invMassB !== 0) {
            b.transform.position.add(correction.clone().multiplyScalar(invMassB));
        }
    }
}

export { Solver };