import * as THREE from 'three';

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
        this.heightOffset = 1.6; // eye level above player base

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
        });
    }

    update() {
        if (!this.target) return;
        const eyeOffset = this.target.currentEyeOffset ?? 1.6;
        const pos = this.target.physicsObject.transform.position;
        this.camera.position.set(
            pos.x,
            pos.y + eyeOffset,
            pos.z
        );
    }
}
