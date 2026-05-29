const hud = document.createElement('div');
hud.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    font-family: 'Courier New', monospace;
`;

// Crosshair
const crosshair = document.createElement('div');
crosshair.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 16px; height: 16px;
    transition: transform 0.12s ease;
`;
crosshair.innerHTML = `
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="2" x2="8" y2="6"  stroke="white" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="8" y1="10" x2="8" y2="14" stroke="white" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="2" y1="8" x2="6" y2="8"  stroke="white" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="10" y1="8" x2="14" y2="8" stroke="white" stroke-width="1.2" stroke-opacity="0.8"/>
    </svg>
`;

// Interaction prompt
const prompt = document.createElement('div');
prompt.style.cssText = `
    position: absolute;
    bottom: 30%; left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.7);
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    background: rgba(0,0,0,0.5);
    padding: 0.3rem 0.8rem;
    border: 1px solid rgba(255,255,255,0.15);
    opacity: 0;
    transition: opacity 0.2s;
    text-transform: uppercase;
`;
prompt.textContent = 'E — pick up  ·  F — read';

// Controls hint (bottom left)
const controls = document.createElement('div');
controls.style.cssText = `
    position: absolute;
    bottom: 1.5rem; left: 1.5rem;
    color: rgba(255,255,255,0.3);
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    line-height: 1.8;
    text-transform: uppercase;
`;
controls.innerHTML = `
    WASD — move<br>
    SHIFT — sprint<br>
    SPACE — jump<br>
    C — crouch<br>
    E — pick up / throw<br>
    F — read / open link<br>
    Click — lock mouse
`;

hud.append(crosshair, prompt, controls);
document.body.appendChild(hud);

export function showPrompt(show) {
    prompt.style.opacity = show ? '1' : '0';
}

export function setCrosshairHover(on) {
    const lines = crosshair.querySelectorAll('line');
    lines.forEach(l => {
        l.setAttribute('stroke', on ? '#ffd700' : 'white');
        l.setAttribute('stroke-opacity', on ? '1' : '0.8');
    });
    crosshair.style.transform = on
        ? 'translate(-50%, -50%) scale(1.35)'
        : 'translate(-50%, -50%) scale(1)';
}

const pickupHint = document.createElement('div');
pickupHint.style.cssText = `
    position: fixed;
    bottom: calc(50% - 64px);
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 50;

    display: flex;
    align-items: center;
    gap: 0.55rem;

    background: rgba(8, 8, 8, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(6px);
    border-radius: 3px;
    padding: 0.38rem 0.85rem 0.38rem 0.55rem;

    font-family: 'Courier New', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: #c8c8c8;
    white-space: nowrap;

    opacity: 0;
    transition: opacity 0.18s ease;
`;

const keyBadge = document.createElement('span');
keyBadge.textContent = 'E';
keyBadge.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4em;
    height: 1.4em;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 2px;
    font-size: 0.8rem;
    color: #fff;
    background: rgba(255,255,255,0.07);
    flex-shrink: 0;
`;

const hintLabel = document.createElement('span');

pickupHint.append(keyBadge, hintLabel);
document.body.appendChild(pickupHint);

export function setPickupHint(text) {
    if (text) {
        // Strip the "E — " prefix since the badge already shows E
        hintLabel.textContent = text.replace(/^E\s*[—–-]+\s*/i, '');
        pickupHint.style.opacity = '1';
    } else {
        pickupHint.style.opacity = '0';
    }
}