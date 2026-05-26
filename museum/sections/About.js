import * as THREE from 'three';
import {
    addFeatureWall,
    addWallText,
    splitText,
    goldMat,
    dimMat,
    whiteMat,
} from '../shared/helpers.js';
import profilePhoto from '../images/file.jpeg';

function addPhoto(scene, texturePath, x, y, z, w = 2.2, h = 2.8) {
    const texture = new THREE.TextureLoader().load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );

    photo.position.set(x, y, z);
    photo.rotation.y = Math.PI;
    scene.add(photo);
}

export function buildAbout(scene, physicsWorld, about, x, z) {

    // Wall
    const wallWidth = 15;
    const wallHeight = 7;
    const wallY = wallHeight / 2;

    addFeatureWall(scene, physicsWorld, x, wallY, z, wallWidth, wallHeight);

    const left = x - wallWidth / 2;
    const right = x + wallWidth / 2;
    const top = wallY + wallHeight / 2;
    const textZ = z - 0.11;

    // Layout regions
    const centerX = x;
    const photoWidth = 2.8;
    const photoHeight = 3.5;
    const photoY = wallY - wallHeight * 0.48 + wallHeight * 0.52;

    const nameY = top - 0.8;
    const taglineY = nameY - 0.5;

    const sectionGap = 2;
    const sidePadding = 1.0;

    const imageLeft = centerX - photoWidth / 2;
    const imageRight = centerX + photoWidth / 2;

    const summaryRight = imageLeft - sectionGap;
    const contactLeft = imageRight + sectionGap;

    // Photo
    addPhoto(scene, profilePhoto, centerX, photoY, z - 0.15, photoWidth, photoHeight);

    // Name
    addWallText(scene, about.name.toUpperCase(), centerX, nameY, textZ, {
        size: 0.34, depth: 0.05, material: whiteMat, center: true,
    });

    // Tagline
    addWallText(scene, about.tagline, centerX, taglineY, textZ, {
        size: 0.14, depth: 0.03, material: dimMat, center: true,
    });

    // Summary
    const summaryLines = splitText(about.summary, 42);
    const summaryStartY = top - 2.5;

    summaryLines.forEach((line, i) => {
        addWallText(scene, line, summaryRight, summaryStartY - i * 0.35, textZ, {
            size: 0.11, depth: 0.02, material: goldMat, align: 'right',
        });
    });

    // Contact
    const contactY1 = summaryStartY;
    const contactY2 = contactY1 - 0.6;
    const col1X = contactLeft;
    const col2X = contactLeft + 2.8;
    // Email
    addWallText(scene, 'EMAIL', col1X, contactY1, textZ, { size: 0.09, depth: 0.02, material: goldMat });
    addWallText(scene, about.contact.email, col1X, contactY1 - 0.22, textZ, { size: 0.08, depth: 0.015, material: dimMat });

    // Phone
    addWallText(scene, 'PHONE', col2X, contactY1, textZ, { size: 0.09, depth: 0.02, material: goldMat });
    addWallText(scene, about.contact.phone, col2X, contactY1 - 0.22, textZ, { size: 0.08, depth: 0.015, material: dimMat });

    // LinkedIn
    addWallText(scene, 'LINKEDIN', col1X, contactY2, textZ, { size: 0.09, depth: 0.02, material: goldMat });
    addWallText(scene, 'interact here', col1X, contactY2 - 0.22, textZ, { size: 0.08, depth: 0.015, material: dimMat, url: about.contact.linkedin });

    // GitHub
    addWallText(scene, 'GITHUB', col2X, contactY2, textZ, { size: 0.09, depth: 0.02, material: goldMat });
    addWallText(scene, 'interact here', col2X, contactY2 - 0.22, textZ, { size: 0.08, depth: 0.015, material: dimMat, url: about.contact.github });

}
