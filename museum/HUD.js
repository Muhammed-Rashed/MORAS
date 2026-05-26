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
    SPACE — jump<br>
    E — pick up / throw<br>
    F — read item<br>
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
    crosshair.style.transition = 'transform 0.12s ease';
}
