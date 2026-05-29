import * as THREE from 'three';
import { keys } from './input.js';
import { openReadable, closeReadable, isReadingOpen } from './ReadableUI.js';
import { clickableLinks } from '../museum/shared/helpers.js';
import { setCrosshairHover, setPickupHint } from '../museum/HUD.js';

const SPEED        = 6;
const SPRINT_SPEED = 11;
const JUMP_SPEED   = 6;
const CROUCH_SPEED = 2.5;

const EYE_HEIGHT        = 1.6;
const CROUCH_EYE_HEIGHT = 0.8;

export class PlayerMovement {
    constructor(player) {
        this.player = player;

        this._prevSpace = false;
        this._prevE = false;
        this._prevF = false;

        this._heldObject = null;
        this._savedInvMass = 0;
        this._savedInvInertia = 0;
        this._holdDistance = 2.5;
        this._holdHeight = -0.3;
        this._pickupRange = 3.5;
        this._hoveredLink = null;
        this._hoveredPickable = null;

        this.physicsWorld = null;
        this.camera = null;
    }

    setPhysicsWorld(w) { this.physicsWorld = w; }
    setCamera(c) { this.camera = c; }

    _isGrounded() {
        return this.player.physicsObject.transform.position.y <= 1.05
            && this.player.physicsObject.velocity.y <= 0.1;
    }

    _getCamDir() {
        const d = new THREE.Vector3();
        if (this.camera) this.camera.getWorldDirection(d);
        return d;
    }

    _tryPickup() {
        if (!this.camera || !this.physicsWorld) return;
        const camPos = this.player.physicsObject.transform.position.clone();
        const camDir = this._getCamDir().clone().normalize();
        const player = this.player.physicsObject;

        let closest = null, closestDist = this._pickupRange;

        for (const obj of this.physicsWorld.objects) {
            if (obj === player || obj.invMass === 0 || !obj.pickable) continue;
            const toObj = obj.transform.position.clone().sub(camPos);
            const along = toObj.dot(camDir);
            if (along < 0) continue;
            const perp = toObj.clone().sub(camDir.clone().multiplyScalar(along)).length();
            if (perp > 1.2) continue;
            const dist = toObj.length();
            if (dist < closestDist) { closestDist = dist; closest = obj; }
        }

        if (!closest) return;
        this._heldObject = closest;
        this._savedInvMass = closest.invMass;
        this._savedInvInertia = closest.invInertia;
        closest.invMass = 0;
        closest.invInertia = 0;
        closest.velocity.set(0, 0, 0);
        closest.angularVelocity.set(0, 0, 0);
    }

    _drop(throwVel = null) {
        if (!this._heldObject) return;
        const obj = this._heldObject;
        obj.invMass = this._savedInvMass;
        obj.invInertia = this._savedInvInertia;
        if (!obj.hasBeenPickedUp) {
            obj.hasBeenPickedUp = true;
            obj.restitution = 0.4;
        }
        obj.velocity.copy(throwVel ?? new THREE.Vector3());
        obj.angularVelocity.set(0, 0, 0);
        this._heldObject = null;
    }

    _updateHeld() {
        if (!this._heldObject || !this.camera) return;
        const camDir = this._getCamDir().clone().normalize();
        const target = this.camera.position.clone().addScaledVector(camDir, this._holdDistance);
        target.y += this._holdHeight;
        this._heldObject.transform.position.lerp(target, 0.2);
        this._heldObject.velocity.set(0, 0, 0);
        this._heldObject.angularVelocity.set(0, 0, 0);
        if (this._heldObject.mesh) this._heldObject.mesh.position.copy(this._heldObject.transform.position);
    }

    _clearHover() {
        if (this._hoveredLink) {
            this._setLinkHighlight(this._hoveredLink, false);
            this._hoveredLink = null;
        }
    }

    _setLinkHighlight(mesh, on) {
        if (!mesh.isMesh || !mesh.material) return;
        mesh.material.emissiveIntensity = on ? 0.6 : 0;
        mesh.material.emissive.set(on ? 0xffd700 : 0x000000);
    }

    _setPickableHighlight(obj, on) {
        const mesh = obj?.mesh;
        if (!mesh || !mesh.material) return;
        mesh.material.emissiveIntensity = on ? 0.8 : 0;
        mesh.material.emissive?.set(on ? 0x88ccff : 0x000000);
    }

    _getLinkCenter(mesh) {
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        return center;
    }

    _updateHover() {
        if (!this.camera) return;
        const camPos = this.camera.position.clone();
        const camDir = this._getCamDir().clone().normalize();
        const RANGE = 5, DOT_MIN = 0.99;
        let best = null, bestDist = RANGE;

        for (const mesh of clickableLinks) {
            if (!mesh.userData?.url) continue;
            const toObj = this._getLinkCenter(mesh).sub(camPos);
            const dist = toObj.length();
            const dot = toObj.clone().normalize().dot(camDir);
            if (dot < DOT_MIN || dist > RANGE) continue;
            if (dist < bestDist) { bestDist = dist; best = mesh; }
        }

        if (best !== this._hoveredLink) {
            this._clearHover();
            if (best) {
                this._hoveredLink = best;
                this._setLinkHighlight(best, true);
                setCrosshairHover(true);
            } else {
                setCrosshairHover(false);
            }
        }
    }

    _updatePickableHover() {
        if (!this.camera || !this.physicsWorld) return;

        // Don't show while holding something
        if (this._heldObject) {
            if (this._hoveredPickable) {
                this._setPickableHighlight(this._hoveredPickable, false);
                this._hoveredPickable = null;
                setPickupHint(null);
            }
            return;
        }

        const camPos = this.player.physicsObject.transform.position.clone();
        const camDir = this._getCamDir().clone().normalize();
        const player = this.player.physicsObject;

        let closest = null;
        let closestDist = this._pickupRange;

        for (const obj of this.physicsWorld.objects) {
            if (obj === player || obj.invMass === 0 || !obj.pickable) continue;
            const toObj = obj.transform.position.clone().sub(camPos);
            const along = toObj.dot(camDir);
            if (along < 0) continue;
            const perp = toObj.clone().sub(camDir.clone().multiplyScalar(along)).length();
            if (perp > 1.2) continue;
            const dist = toObj.length();
            if (dist < closestDist) { closestDist = dist; closest = obj; }
        }

        if (closest !== this._hoveredPickable) {
            // Un-highlight old
            if (this._hoveredPickable) {
                this._setPickableHighlight(this._hoveredPickable, false);
            }
            this._hoveredPickable = closest;
            // Highlight new
            if (closest) {
                this._setPickableHighlight(closest, true);
                const name = closest.readableData?.title ?? 'object';
                setPickupHint(`E — Pick up: ${name}`);
            } else {
                setPickupHint(null);
            }
        }
    }

    update(cameraYaw = 0) {
        const obj = this.player.physicsObject;

        // Speed crouch overrides sprint
        const isCrouching = keys.crouch;
        const isSprinting = keys.sprint && !isCrouching && keys.w;
        const targetSpeed = isCrouching ? CROUCH_SPEED : isSprinting ? SPRINT_SPEED : SPEED;
        const targetEyeHeight = isCrouching ? CROUCH_EYE_HEIGHT : EYE_HEIGHT;

        this.player.currentEyeOffset = THREE.MathUtils.lerp(
            this.player.currentEyeOffset, targetEyeHeight, 0.15
        );
        // Expose sprint state for camera FOV
        this.player.isSprinting = isSprinting;

        // Movement
        const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
        const right   = new THREE.Vector3( Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
        const move    = new THREE.Vector3();

        if (keys.w) move.addScaledVector(forward,  targetSpeed);
        if (keys.s) move.addScaledVector(forward, -targetSpeed);
        if (keys.a) move.addScaledVector(right,   -targetSpeed);
        if (keys.d) move.addScaledVector(right,    targetSpeed);

        obj.velocity.x = move.x;
        obj.velocity.z = move.z;

        // Jump
        if (keys.space && !this._prevSpace && this._isGrounded() && !isCrouching) {
            obj.velocity.y = JUMP_SPEED;
        }
        this._prevSpace = keys.space;

        // E pickup / throw
        const eNow = keys.e;
        if (eNow && !this._prevE) {
            if (this._heldObject) this._drop(this._getCamDir().multiplyScalar(5));
            else this._tryPickup();
        }
        this._prevE = eNow;

        // F links / reading
        const fNow = keys.f;
        if (fNow && !this._prevF) {
            if (this.camera) {
                const camPos = this.camera.position;
                const camDir = this._getCamDir().clone().normalize();
                let best = null, bestDot = 0.97;
                for (const mesh of clickableLinks) {
                    if (!mesh.userData?.url) continue;
                    const toObj = this._getLinkCenter(mesh).sub(camPos);
                    if (toObj.length() > 5) continue;
                    const dot = toObj.clone().normalize().dot(camDir);
                    if (dot > bestDot) { bestDot = dot; best = mesh; }
                }
                if (best) {
                    window.open(best.userData.url, '_blank');
                    this._prevF = fNow;
                    return;
                }
            }
            if (isReadingOpen()) closeReadable();
            else if (this._heldObject?.readable && this._heldObject.readableData) {
                openReadable(this._heldObject.readableData);
            }
        }
        this._prevF = fNow;

        this._updateHeld();
        this._updateHover();
        this._updatePickableHover();

        obj.transform.quaternion.identity();
        obj.angularVelocity.set(0, 0, 0);
    }
}