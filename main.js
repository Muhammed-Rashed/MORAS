import * as THREE from 'three';
import { PhysicsWorld } from './engine/physics.js';
import './engine/collisionDetection.js';
import { Player } from './player/Player.js';
import { CameraController } from './player/Camera.js';
import { buildMuseum } from './museum/Museum.js';
import { setupLighting } from './museum/Lighting.js';
import projectsData from './data/projects.json';
import experienceData from './data/experience.json';
import aboutData from './data/about.json';
import skillsData from './data/Skills.json';
import './museum/HUD.js';

import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.style.cssText = 'margin:0;overflow:hidden;background:#111;';
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);

const physicsWorld = new PhysicsWorld();

buildMuseum(scene, physicsWorld, {
    projects: projectsData.projects,
    experience: experienceData.experience,
    about: aboutData.about,
    skills: skillsData.skills,
});

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;';
document.body.appendChild(labelRenderer.domElement);

window.addEventListener('resize', () => {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

setupLighting(scene);

const player = new Player(scene, physicsWorld);
player.movement.setPhysicsWorld(physicsWorld);

const cameraController = new CameraController(camera, renderer.domElement, player);
player.movement.setCamera(camera);

const FIXED_STEP = 1 / 60;
let accumulator = 0;
let lastTime = performance.now();

function animate() {
    const now = performance.now();
    accumulator += Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    while (accumulator >= FIXED_STEP) {
        player.update(cameraController.yaw);
        physicsWorld.step(FIXED_STEP);
        accumulator -= FIXED_STEP;
    }
    labelRenderer.render(scene, camera);
    cameraController.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);