import * as THREE from 'three';
import { PhysicsObject } from '../../engine/object.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


// Shared materials
export const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95 });
export const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
export const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5e9c9, roughness: 0.9 });
export const bookMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 });
export const wallMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
export const goldMat = new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.4, metalness: 0.3 });
export const dimMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
export const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });


// Font loader (loads once, shared across all sections)
let _font = null;
const _fontCallbacks = [];
let _fontLoading = false;

export function getFont(cb) {
    if (_font) { cb(_font); return; }
    _fontCallbacks.push(cb);
    if (_fontLoading) return;
    _fontLoading = true;
    new FontLoader().load('/MORAS/fonts/helvetiker_regular.typeface.json', (font) => {
        _font = font;
        _fontCallbacks.forEach(fn => fn(font));
        _fontCallbacks.length = 0;
    });
}


// Clickable links registry
export const clickableLinks = [];


// 3D extruded wall text
export function addWallText(scene, text, x, y, z, options = {}) {

    const {
        size = 0.18,
        depth = 0.04,
        rotY = Math.PI,
        center = true,
    } = options;

    getFont((font) => {

        const geo = new TextGeometry(text, {
            font,
            size,
            depth,
            curveSegments: 5,
            bevelEnabled: false,
        });

        if (options.flipX) {
            geo.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
        }

        geo.computeBoundingBox();
        const width = geo.boundingBox.max.x - geo.boundingBox.min.x;

        const mat = (options.material ?? goldMat).clone();
        const mesh = new THREE.Mesh(geo, mat);

        let finalX = x;
        let finalZ = z;

        if (center) {
            if (Math.abs(rotY - Math.PI) < 0.01) {
                finalX = x + width / 2; // facing -Z (about wall)
            } else if (Math.abs(rotY) < 0.01) {
                finalX = x - width / 2; // facing +Z
            } else if (rotY > 0) {
                // rotY = PI/2, facing -X (experience wall)
                finalX = x - 0.20;
                finalZ = z - width / 2;
            } else {
                // rotY = -PI/2, facing +X (projects wall)
                finalX = x + 0.20;
                finalZ = z + width / 2;
            }
        }

        mesh.position.set(finalX, y, finalZ);
        mesh.rotation.y = rotY;

        scene.add(mesh);

        if (options.url) {
            mesh.userData.url = options.url;
            clickableLinks.push(mesh);
        }
    });
}


// Floor
export function addFloor(scene, physicsWorld) {
    const obj = PhysicsObject.plane(200, 200, floorMat);
    obj.transform.position.set(0, 0, 0);
    obj.meshQuatOffset = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), -Math.PI / 2
    );
    obj.mesh.rotation.x = -Math.PI / 2;
    obj.mesh.position.set(0, 0, 0);
    scene.add(obj.mesh);
    physicsWorld.addObject(obj);
}


// Feature wall
export function addFeatureWall(scene, physicsWorld, x, y, z, width = 10, height = 5, rotY = 0) {
    const obj = PhysicsObject.cube(width, height, 0.2, Infinity, wallMat, { rotY });
    obj.transform.position.set(x, y, z);
    obj.mesh.position.set(x, y, z);
    scene.add(obj.mesh);
    physicsWorld.addObject(obj);
}

// Pillar
export function addPillar(scene, physicsWorld, x, z) {
    const obj = PhysicsObject.cube(0.6, 1.2, 0.6, Infinity, pillarMat);
    obj.transform.position.set(x, 0.6, z);
    obj.mesh.position.set(x, 0.6, z);
    scene.add(obj.mesh);
    physicsWorld.addObject(obj);
}


// Exhibit items (paper / book) on a pillar
export function addPaper(scene, physicsWorld, x, z, data) {
    const obj = PhysicsObject.cube(0.4, 0.05, 0.55, 0.1, paperMat);
    obj.transform.position.set(x, 1.33, z);
    obj.mesh.position.set(x, 1.33, z);
    obj.mesh.rotation.x = Math.PI / 2;
    obj.pickable = true;
    obj.readable = true;
    obj.readableData = data;
    obj.restitution = 0;
    scene.add(obj.mesh);
    physicsWorld.addObject(obj);
}

export function addBook(scene, physicsWorld, x, z, data) {
    const obj = PhysicsObject.cube(0.25, 0.35, 0.4, 0.3, bookMat);
    obj.transform.position.set(x, 1.38, z);
    obj.mesh.position.set(x, 1.38, z);
    obj.mesh.rotation.x = Math.PI / 2;
    obj.pickable = true;
    obj.readable = true;
    obj.readableData = data;
    scene.add(obj.mesh);
    physicsWorld.addObject(obj);
}

export function addExhibit(scene, physicsWorld, x, z, data, type = 'paper') {
    addPillar(scene, physicsWorld, x, z);
    if (type === 'book') {
        addBook(scene, physicsWorld, x, z, data);
    } else {
        addPaper(scene, physicsWorld, x, z, data);
    }
}

// Text utilities
export function splitText(text, maxChars = 38) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        if ((current + word).length > maxChars) {
            lines.push(current.trim());
            current = '';
        }
        current += word + ' ';
    }

    if (current.length) lines.push(current.trim());
    return lines;
}