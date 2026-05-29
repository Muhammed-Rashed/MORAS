export const keys = {
    w: false, a: false, s: false, d: false,
    space: false, e: false, f: false,
    crouch: false, sprint: false,
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') keys.w = true;
    if (e.code === 'KeyA') keys.a = true;
    if (e.code === 'KeyS') keys.s = true;
    if (e.code === 'KeyD') keys.d = true;
    if (e.code === 'Space') keys.space = true;
    if (e.code === 'KeyE') keys.e = true;
    if (e.code === 'KeyF') keys.f = true;
    if (e.code === 'KeyC') keys.crouch = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.sprint = true;
    if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') keys.w = false;
    if (e.code === 'KeyA') keys.a = false;
    if (e.code === 'KeyS') keys.s = false;
    if (e.code === 'KeyD') keys.d = false;
    if (e.code === 'Space') keys.space = false;
    if (e.code === 'KeyE') keys.e = false;
    if (e.code === 'KeyF') keys.f = false;
    if (e.code === 'KeyC') keys.crouch = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.sprint = false;
});