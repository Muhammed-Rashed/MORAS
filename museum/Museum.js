import { addFloor } from './shared/helpers.js';
import { buildAbout } from './sections/About.js';
import { buildProjects } from './sections/Projects.js';
import { buildExperience } from './sections/Experience.js';
import { buildSkills } from './sections/Skills.js';

export function buildMuseum(scene, physicsWorld, data) {
    addFloor(scene, physicsWorld);

    buildAbout(scene, physicsWorld, data.about, 0, 18);

    buildProjects(scene, physicsWorld, data.projects, -12, 8, 2);

    buildExperience(scene, physicsWorld, data.experience, 12, 8, 2);

    buildSkills(scene, physicsWorld, data.skills ?? [], 0, 3, 2);
}