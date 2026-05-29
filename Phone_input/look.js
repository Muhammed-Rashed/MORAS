const SENSITIVITY = 0.004;

let _camera = null;

const zone = document.createElement('div');
zone.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 55%;
    height: 100%;
    touch-action: none;
    z-index: 190;
    pointer-events: auto;
`;
document.body.appendChild(zone);

let _touchId  = null;
let _lastX    = 0;
let _lastY    = 0;

zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (_touchId !== null) return;
    const t = e.changedTouches[0];
    _touchId = t.identifier;
    _lastX   = t.clientX;
    _lastY   = t.clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!_camera) return;
    for (const t of e.changedTouches) {
        if (t.identifier !== _touchId) continue;
        const dx = t.clientX - _lastX;
        const dy = t.clientY - _lastY;
        _lastX = t.clientX;
        _lastY = t.clientY;

        _camera.yaw   -= dx * SENSITIVITY;
        _camera.pitch -= dy * SENSITIVITY;
        _camera.pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, _camera.pitch));
    }
}, { passive: false });

function _end(e) {
    for (const t of e.changedTouches) {
        if (t.identifier === _touchId) _touchId = null;
    }
}
document.addEventListener('touchend',    _end);
document.addEventListener('touchcancel', _end);

export function initLook(cameraController) {
    _camera = cameraController;
}