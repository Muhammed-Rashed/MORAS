import * as THREE from 'three';
import { addFeatureWall, addWallText, goldMat, dimMat, whiteMat } from '../shared/helpers.js';

const _textureLoader = new THREE.TextureLoader();
function loadTexture(url) {
    const tex = _textureLoader.load(url);
    tex.flipY = true;
    return tex;
}

export function buildSkills(scene, physicsWorld, skillCategories, startX = 0, z = 6, spacing = 2) {
    const WALL_W = 22;
    const WALL_H = 7;
    const wallCenterX = startX;
    const wallY = WALL_H / 2;
    const wallZ = z;
    const FRONT = wallZ + 0.1;

    addFeatureWall(scene, physicsWorld, wallCenterX, wallY, wallZ, WALL_W, WALL_H, 0);

    addWallText(scene, 'SKILLS', wallCenterX, wallY + WALL_H / 2 - 0.5, FRONT, {
        size: 0.30, depth: 0.05, material: goldMat, center: true, rotY: 0 // was Math.PI
    });

    const COLS = 2;
    const PANEL_W = 9.5;
    const PANEL_H = 2.6;
    const gridLeft = wallCenterX - (COLS * PANEL_W) / 2;
    const gridTop = wallY + WALL_H / 2 - 1.2;

    skillCategories.forEach((cat, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);

        const panelCX = gridLeft + col * PANEL_W + PANEL_W / 2;
        const panelCY = gridTop - row * PANEL_H - PANEL_H / 2;
        const panelZ = FRONT + 0.1;

        // Plaque
        const bgMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(PANEL_W - 0.4, PANEL_H - 0.2),
            new THREE.MeshBasicMaterial({ color: 0x12111f })
        );
        bgMesh.position.set(panelCX, panelCY, panelZ);
        scene.add(bgMesh);

        // Category title
        addWallText(scene, cat.category.toUpperCase(),
            panelCX, panelCY + PANEL_H / 2 - 0.38, panelZ - 0.01,
            { size: 0.15, depth: 0.02, material: goldMat, center: true, rotY: 0 } // was Math.PI
        );

        // Items
        const items = cat.items || [];
        const itemCount = items.length;
        const usableW = PANEL_W - 1.2;
        const startXPos = panelCX - usableW / 2;
        const spacingX = itemCount > 1 ? usableW / (itemCount - 1) : 0;

        items.forEach((item, index) => {
            const itemX = itemCount > 1 ? startXPos + index * spacingX : panelCX;
            const itemY = panelCY - 0.05;
            const itemZ = panelZ + 0.02;

            const tex = loadTexture(item.icon);

            const iconMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.38, 0.38),
                new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05 })
            );
            iconMesh.position.set(itemX, itemY + 0.28, itemZ);
            scene.add(iconMesh);
            addWallText(scene, item.name,
                itemX, itemY - 0.08, itemZ,
                { size: 0.075, depth: 0.01, material: whiteMat, center: true, rotY: 0 } // was Math.PI
            );
        });
    });
}