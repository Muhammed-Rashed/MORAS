import * as THREE from 'three';

import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';

export function setupLighting(scene, renderer) {
    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.6;

    renderer.useLegacyLights = false;

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFShadowMap;

    scene.fog = new THREE.FogExp2(
        0xcfe8ff,
        0.005
    );

    const ambient = new THREE.AmbientLight(
        0xcfe8ff,
        0.55
    );

    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(
        0xbfe3ff, // sky
        0x8b7355, // ground
        1.8
    );

    scene.add(hemi);

    const sun = new THREE.DirectionalLight(
        0xfff2d6,
        3.5
    );

    sun.position.set(25, 35, 15);

    sun.castShadow = true;

    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;

    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;

    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;

    sun.shadow.bias = -0.0001;

    sun.shadow.radius = 2;

    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(
        0xddeeff,
        0.35
    );

    fillLight.position.set(-20, 15, -10);

    scene.add(fillLight);

    const sky = new Sky();

    sky.scale.setScalar(450000);

    scene.add(sky);

    const skyUniforms =
        sky.material.uniforms;

    skyUniforms['turbidity'].value = 2;

    skyUniforms['rayleigh'].value = 1.5;

    skyUniforms['mieCoefficient'].value = 0.005;

    skyUniforms['mieDirectionalG'].value = 0.8;


    const sunPosition = new THREE.Vector3();

    const phi =
        THREE.MathUtils.degToRad(75);

    const theta =
        THREE.MathUtils.degToRad(180);

    sunPosition.setFromSphericalCoords(
        1,
        phi,
        theta
    );

    skyUniforms['sunPosition'].value.copy(
        sunPosition
    );

    const pmremGenerator =
        new THREE.PMREMGenerator(renderer);

    new HDRLoader().load(
        '/hdr/outdoor.hdr',

        (hdrMap) => {

            const envMap =
                pmremGenerator
                    .fromEquirectangular(hdrMap)
                    .texture;

            // Realistic environment lighting
            scene.environment = envMap;

            // Optional HDR background
            // scene.background = envMap;

            hdrMap.dispose();

            pmremGenerator.dispose();
        }
    );

    return {
        ambient,
        hemi,
        sun,
        fillLight,
        sky
    };
}