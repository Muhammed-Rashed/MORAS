import { addExhibit, addFeatureWall, addWallText, goldMat } from '../shared/helpers.js';

export function buildProjects(scene, physicsWorld, projects, startX = 0, z = 0, spacing = 2) {
    const centerX = startX;
    const centerZ = z + ((projects.length - 1) * spacing) / 2;

    projects.forEach((project, i) => {
        addExhibit(scene, physicsWorld, centerX, z + i * spacing,
            { ...project, _type: 'project' }, 'paper');
    });

    const wallWidth = projects.length * spacing + 2;
    const wallHeight = 4;
    const wallY = wallHeight / 2;
    const wallX = centerX - 1.5;  // wall behind exhibits to the left

    addFeatureWall(scene, physicsWorld, wallX, wallY, centerZ, wallHeight, wallWidth, Math.PI / 2);

    addWallText(scene, 'PROJECTS', wallX, wallY + wallHeight / 2 - 0.5, centerZ, {
        size: 0.28, depth: 0.05, material: goldMat, center: true,
        rotY: -Math.PI / 2, flipX: true,
    });
}