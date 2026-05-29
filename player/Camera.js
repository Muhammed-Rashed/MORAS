import * as THREE from 'three';
import { keys } from './input.js';

export class CameraController {
    constructor(camera, domElement, target = null) {
        this.camera = camera;
        this.domElement = domElement;
        this.target = target;
        this.yaw = Math.PI;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.pitch = 0;
        this.sensitivity = 0.002;
        this.heightOffset = 1.6;

        this._bobTime = 0;
        this._bobVelocity = 0;
        this._bobY = 0;
        this._bobX = 0;
        this._landBob = 0;
        this._wasGrounded = true;

        this._swayX = 0;
        this._swayY = 0;
        this._lastMouseX = 0;
        this._lastMouseY = 0;

        this._initPointerLock();
        this._initMouse();
    }

    _initPointerLock() {
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });
    }

    _initMouse() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== this.domElement) return;

            this.yaw -= e.movementX * this.sensitivity;
            this.pitch -= e.movementY * this.sensitivity;
            this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.yaw;
            this.camera.rotation.x = this.pitch;

            // Feed mouse delta into sway
            this._lastMouseX = e.movementX;
            this._lastMouseY = e.movementY;
        });
    }

    update() {
        if (!this.target) return;

        const dt = 1 / 60;

        const obj = this.target.physicsObject;
        const eyeOffset = this.target.currentEyeOffset ?? 1.6;
        const pos = obj.transform.position;

        const grounded = pos.y <= 1.05 && obj.velocity.y <= 0.1;

        // Landing impact: snap bob down when hitting the ground
        if (grounded && !this._wasGrounded) {
            const fallSpeed = Math.abs(obj.velocity.y);
            this._landBob = Math.min(fallSpeed * 0.04, 0.18);
        }
        this._wasGrounded = grounded;

        const horizSpeed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.z ** 2);
        const isCrouching = keys.crouch;

        const targetBobVel = horizSpeed > 0.5 && grounded ? horizSpeed : 0;
        this._bobVelocity = THREE.MathUtils.lerp(this._bobVelocity, targetBobVel, 0.1);

        const bobFreq = isCrouching ? 0.8 : 1.1;
        const bobAmpY = isCrouching ? 0.025 : 0.048;

        if (this._bobVelocity > 0.2) {
            this._bobTime += dt * bobFreq * Math.PI * 2;
        } else {
            this._bobTime = THREE.MathUtils.lerp(
                this._bobTime,
                Math.round(this._bobTime / (Math.PI * 2)) * Math.PI * 2,
                0.08
            );
        }

        const intensity = Math.min(this._bobVelocity / 6, 1);
        this._bobY = Math.sin(this._bobTime) * bobAmpY * intensity;

        this._landBob = THREE.MathUtils.lerp(this._landBob, 0, 0.18);

        const swayStrength = 0.0012;
        const swayTargetX = -this._lastMouseX * swayStrength;
        const swayTargetY = -this._lastMouseY * swayStrength * 0.5;

        this._swayX = THREE.MathUtils.lerp(this._swayX, swayTargetX, 0.1);
        this._swayY = THREE.MathUtils.lerp(this._swayY, swayTargetY, 0.1);

        this._lastMouseX *= 0.75;
        this._lastMouseY *= 0.75;

        const targetFOV = this.target.isSprinting ? 88 : 75;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.08);
        this.camera.updateProjectionMatrix();

        this.camera.position.set(
            pos.x + this._bobX,
            pos.y + eyeOffset + this._bobY - this._landBob,
            pos.z
        );

        // Roll tilt from sway + step bob
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch + this._swayY;
        this.camera.rotation.z = this._swayX - this._bobX * 1.2;
    }
}