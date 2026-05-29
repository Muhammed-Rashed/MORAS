import { keys } from '../player/input.js';

const DEAD_ZONE  = 0.15; // fraction of radius before registering movement
const RADIUS     = 52;   // px — outer ring
const KNOB_R     = 24;   // px — inner knob

// ── DOM ──────────────────────────────────────────────────────────────────────

const wrap = document.createElement('div');
wrap.style.cssText = `
    position: fixed;
    bottom: 36px;
    left: 36px;
    width:  ${RADIUS * 2}px;
    height: ${RADIUS * 2}px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    border: 1.5px solid rgba(255,255,255,0.18);
    touch-action: none;
    z-index: 200;
    pointer-events: auto;
`;

const knob = document.createElement('div');
knob.style.cssText = `
    position: absolute;
    width:  ${KNOB_R * 2}px;
    height: ${KNOB_R * 2}px;
    border-radius: 50%;
    background: rgba(255,255,255,0.28);
    border: 1.5px solid rgba(255,255,255,0.5);
    top:  50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: background 0.1s;
    pointer-events: none;
`;

wrap.appendChild(knob);
document.body.appendChild(wrap);

// ── State ─────────────────────────────────────────────────────────────────────

let _activeTouchId = null;
let _originX = 0;
let _originY = 0;

function _setKeys(nx, ny) {
    // nx, ny are normalised [-1, 1] within the joystick radius
    keys.w = ny < -DEAD_ZONE;
    keys.s = ny >  DEAD_ZONE;
    keys.a = nx < -DEAD_ZONE;
    keys.d = nx >  DEAD_ZONE;
}

function _clearKeys() {
    keys.w = keys.s = keys.a = keys.d = false;
}

function _moveKnob(nx, ny) {
    // Clamp knob visually inside the ring
    const mag = Math.sqrt(nx * nx + ny * ny);
    const clamp = Math.min(mag, 1);
    const angle = Math.atan2(ny, nx);
    const kx = Math.cos(angle) * clamp * RADIUS;
    const ky = Math.sin(angle) * clamp * RADIUS;
    knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
}

// ── Touch handlers ────────────────────────────────────────────────────────────

wrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (_activeTouchId !== null) return;
    const t = e.changedTouches[0];
    _activeTouchId = t.identifier;
    const rect = wrap.getBoundingClientRect();
    _originX = rect.left + RADIUS;
    _originY = rect.top  + RADIUS;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
        if (t.identifier !== _activeTouchId) continue;
        const dx = t.clientX - _originX;
        const dy = t.clientY - _originY;
        const nx = dx / RADIUS;
        const ny = dy / RADIUS;
        _setKeys(nx, ny);
        _moveKnob(nx, ny);
    }
}, { passive: false });

function _end(e) {
    for (const t of e.changedTouches) {
        if (t.identifier !== _activeTouchId) continue;
        _activeTouchId = null;
        _clearKeys();
        knob.style.transform = 'translate(-50%, -50%)';
    }
}

document.addEventListener('touchend',   _end);
document.addEventListener('touchcancel', _end);