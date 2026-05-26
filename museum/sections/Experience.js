import { addExhibit, addFeatureWall, addWallText, goldMat } from '../shared/helpers.js';

export function buildExperience(scene, physicsWorld, experience, startX = 0, z = 0, spacing = 2) {
    const centerX = startX;
    const centerZ = z + ((experience.length - 1) * spacing) / 2;

    experience.forEach((entry, i) => {
        addExhibit(scene, physicsWorld, centerX, z + i * spacing,
            { ...entry, _type: 'experience' }, 'book');
    });

    const wallWidth = experience.length * spacing + 2;
    const wallHeight = 4;
    const wallY = wallHeight / 2;
    const wallX = centerX + 1.5;  // wall behind exhibits to the right

    addFeatureWall(scene, physicsWorld, wallX, wallY, centerZ, wallHeight, wallWidth, -Math.PI / 2);
    addWallText(scene, 'EXPERIENCE', wallX, wallY + wallHeight / 2 - 0.5, centerZ, {
        size: 0.28, depth: 0.05, material: goldMat, center: true,
        rotY: Math.PI / 2, flipX: true,
    });
}