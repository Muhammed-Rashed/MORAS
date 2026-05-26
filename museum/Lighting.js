import * as THREE from 'three';

export function setupLighting(scene) {
    const ambient = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe0f0ff, 0.3);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);
}