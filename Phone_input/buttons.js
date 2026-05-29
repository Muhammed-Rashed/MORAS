import { keys } from '../player/input.js';

function makeBtn(label, extraCSS) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.style.cssText = `
        position: fixed;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(255,255,255,0.08);
        border: 1.5px solid rgba(255,255,255,0.22);
        color: rgba(255,255,255,0.75);
        font-family: 'Courier New', monospace;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: none;
        user-select: none;
        z-index: 200;
        pointer-events: auto;
        transition: background 0.1s, border-color 0.1s;
        ${extraCSS}
    `;
    document.body.appendChild(btn);
    return btn;
}

function bindKey(btn, key) {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[key] = true;
        btn.style.background = 'rgba(255,255,255,0.22)';
        btn.style.borderColor = 'rgba(255,255,255,0.55)';
    }, { passive: false });

    const release = (e) => {
        e.preventDefault();
        keys[key] = false;
        btn.style.background = 'rgba(255,255,255,0.08)';
        btn.style.borderColor = 'rgba(255,255,255,0.22)';
    };
    btn.addEventListener('touchend',    release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
}

const jumpBtn = makeBtn('JUMP', 'bottom: 110px; right: 36px;');
bindKey(jumpBtn, 'space');

const eBtn = makeBtn('E', 'bottom: 36px; right: 108px;');
bindKey(eBtn, 'e');

const fBtn = makeBtn('F', 'bottom: 36px; right: 36px;');
bindKey(fBtn, 'f');