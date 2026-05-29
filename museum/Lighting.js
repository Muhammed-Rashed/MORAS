import * as THREE from 'three';

export function setupLighting(scene) {
    // Bright sky-blue ambient — simulates open sky bounce light
    const ambient = new THREE.AmbientLight(0xc9e8ff, 1.2);
    scene.add(ambient);

    // Strong sun — high angle, slightly warm white
    const sunLight = new THREE.DirectionalLight(0xfffaea, 3.5);
    sunLight.position.set(20, 40, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(4096, 4096);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // Sky hemisphere — blue sky above, warm sandy ground below
    const hemi = new THREE.HemisphereLight(0x87ceff, 0xd4b483, 1.0);
    scene.add(hemi);

    // Soft fill from opposite sun side — reduces harsh shadow areas
    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.6);
    fillLight.position.set(-20, 15, -10);
    scene.add(fillLight);
}