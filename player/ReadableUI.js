// Overlay backdrop
const overlay = document.createElement('div');
overlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.78);
    justify-content: center;
    align-items: center;
    z-index: 100;
    font-family: 'Georgia', serif;
    cursor: default;
`;

// Card
const card = document.createElement('div');
card.style.cssText = `
    background: #141414;
    color: #e8e0cc;
    padding: 0;
    max-width: 580px;
    width: 92%;
    max-height: 82vh;
    border: 1px solid #2e2e2e;
    border-radius: 3px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.9);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

// Scrollable body
const scrollBody = document.createElement('div');
scrollBody.style.cssText = `
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2.5rem 3rem 2rem;
    flex: 1 1 auto;
    scrollbar-width: thin;
    scrollbar-color: #3a3a3a #141414;
`;

// Header elements
const typeTag    = document.createElement('span');
const titleEl    = document.createElement('h2');
const subtitleEl = document.createElement('p');
const yearEl     = document.createElement('span');
const techEl     = document.createElement('div');

typeTag.style.cssText    = 'font-size:0.68rem; letter-spacing:0.18em; text-transform:uppercase; color:#666; display:block; margin-bottom:0.75rem;';
titleEl.style.cssText    = 'margin:0 0 0.3rem; font-size:1.55rem; color:#ffffff; font-weight:normal; letter-spacing:0.02em; line-height:1.2;';
subtitleEl.style.cssText = 'margin:0 0 0.7rem; font-style:italic; color:#999; font-size:0.93rem;';
yearEl.style.cssText     = 'font-size:0.78rem; color:#555; display:block; margin-bottom:1rem; letter-spacing:0.04em;';
techEl.style.cssText     = 'display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.2rem;';

// Image gallery
const galleryEl = document.createElement('div');
galleryEl.style.cssText = `
    position: relative;
    width: 100%;
    margin-bottom: 1.2rem;
    display: none;
    border-radius: 2px;
    overflow: hidden;
    background: #0a0a0a;
`;

const galleryImg = document.createElement('img');
galleryImg.style.cssText = `
    width: 100%;
    height: auto;
    max-height: 340px;
    object-fit: contain;
    display: block;
    transition: opacity 0.25s;
`;

const galleryPrev = document.createElement('button');
const galleryNext = document.createElement('button');
const galleryDots = document.createElement('div');

const galBtnBase = `
    position:absolute; top:50%; transform:translateY(-50%);
    background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12);
    color:#e8e0cc; font-size:1rem; padding:0.3rem 0.6rem;
    cursor:pointer; border-radius:2px; z-index:2;
    transition: background 0.15s;
`;
galleryPrev.style.cssText = galBtnBase + 'left:0.5rem;';
galleryNext.style.cssText = galBtnBase + 'right:0.5rem;';
galleryPrev.textContent = '‹';
galleryNext.textContent = '›';

galleryDots.style.cssText = `
    position:absolute; bottom:0.5rem; left:50%; transform:translateX(-50%);
    display:flex; gap:0.35rem; z-index:2;
`;

galleryEl.append(galleryImg, galleryPrev, galleryNext, galleryDots);

let _images = [];
let _imgIdx  = 0;

function _showImg(idx) {
    if (!_images.length) return;
    _imgIdx = (idx + _images.length) % _images.length;
    galleryImg.style.opacity = '0';
    setTimeout(() => {
        galleryImg.src = _images[_imgIdx];
        galleryImg.style.opacity = '1';
    }, 120);
    // update dots
    [...galleryDots.children].forEach((d, i) => {
        d.style.background = i === _imgIdx ? '#c8a96e' : 'rgba(255,255,255,0.3)';
    });
    galleryPrev.style.display = _images.length > 1 ? '' : 'none';
    galleryNext.style.display = _images.length > 1 ? '' : 'none';
}

galleryPrev.addEventListener('click', () => _showImg(_imgIdx - 1));
galleryNext.addEventListener('click', () => _showImg(_imgIdx + 1));

// Description + list
const descEl = document.createElement('p');
const listEl = document.createElement('ul');

descEl.style.cssText = 'margin:0 0 1rem; color:#bbb; font-size:0.9rem; line-height:1.65;';
listEl.style.cssText = 'padding-left:1.2rem; margin:0 0 1.2rem; color:#aaa; font-size:0.87rem; line-height:1.9;';

// External link button
const linkBtn = document.createElement('a');
linkBtn.target = '_blank';
linkBtn.rel    = 'noopener noreferrer';
linkBtn.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1.2rem;
    background: transparent;
    border: 1px solid #c8a96e;
    color: #c8a96e;
    font-family: 'Courier New', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
    margin-bottom: 0.5rem;
`;
linkBtn.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
    View on GitHub
`;
linkBtn.addEventListener('mouseover', () => { linkBtn.style.background = '#c8a96e'; linkBtn.style.color = '#0a0a0a'; });
linkBtn.addEventListener('mouseout',  () => { linkBtn.style.background = 'transparent'; linkBtn.style.color = '#c8a96e'; });

// Footer bar
const footer = document.createElement('div');
footer.style.cssText = `
    padding: 0.75rem 3rem;
    border-top: 1px solid #222;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    background: #0f0f0f;
`;

const closeHint = document.createElement('p');
closeHint.style.cssText = 'margin:0; font-size:0.72rem; color:#444; letter-spacing:0.07em; font-family: monospace;';
closeHint.textContent = 'Press F or click outside to close';

const closeBtn = document.createElement('button');
closeBtn.textContent = '✕';
closeBtn.style.cssText = `
    background: none; border: 1px solid #333; color: #666;
    font-size: 0.8rem; padding: 0.2rem 0.55rem; cursor: pointer;
    border-radius: 2px; transition: border-color 0.15s, color 0.15s;
    font-family: monospace;
`;
closeBtn.addEventListener('mouseover', () => { closeBtn.style.borderColor = '#c8a96e'; closeBtn.style.color = '#c8a96e'; });
closeBtn.addEventListener('mouseout',  () => { closeBtn.style.borderColor = '#333'; closeBtn.style.color = '#666'; });
closeBtn.addEventListener('click', closeReadable);

footer.append(closeHint, closeBtn);

// Assemble card
scrollBody.append(typeTag, titleEl, subtitleEl, yearEl, techEl, galleryEl, descEl, listEl, linkBtn);
card.append(scrollBody, footer);
overlay.appendChild(card);
document.body.appendChild(overlay);

// Close on backdrop click (not card click)
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeReadable(); });
// Prevent card scroll from propagating (avoid accidental close etc.)
card.addEventListener('click', (e) => e.stopPropagation());


// State
let _isOpen = false;

export function isReadingOpen() { return _isOpen; }


// Open

export function openReadable(data) {
    if (!data) return;

    // Reset scroll
    scrollBody.scrollTop = 0;

    // Tech tags
    techEl.innerHTML = '';
    listEl.innerHTML = '';
    galleryDots.innerHTML = '';

    // Populate
    typeTag.textContent    = data._type ?? 'exhibit';
    titleEl.textContent    = data.title ?? '';
    subtitleEl.textContent = data.subtitle ?? data.role ?? '';

    if (data.year) {
        yearEl.textContent = data.year;
    } else if (data.start) {
        yearEl.textContent = `${data.start} → ${data.end ?? 'present'}  ·  ${data.location ?? ''}`;
    } else {
        yearEl.textContent = '';
    }

    // Tech pills
    const tags = data.tech ?? (data.company ? [data.company] : []);
    for (const tag of tags) {
        const span = document.createElement('span');
        span.textContent = tag;
        span.style.cssText = `
            background:#1e1e1e; color:#999; border:1px solid #2e2e2e;
            padding:0.15rem 0.55rem; border-radius:2px; font-size:0.73rem;
            font-family: monospace; letter-spacing:0.06em;
        `;
        techEl.appendChild(span);
    }

    // Images gallery
    _images = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []);
    if (_images.length) {
        galleryEl.style.display = 'block';
        // Build dots
        _images.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.style.cssText = `
                width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.3);
                cursor:pointer; transition:background 0.15s;
            `;
            dot.addEventListener('click', () => _showImg(i));
            galleryDots.appendChild(dot);
        });
        _showImg(0);
    } else {
        galleryEl.style.display = 'none';
    }

    // Description + bullet list
    descEl.textContent = data.description ?? '';
    for (const item of (data.details ?? data.facts ?? [])) {
        const li = document.createElement('li');
        li.textContent = item;
        listEl.appendChild(li);
    }

    // Link button
    if (data.link) {
        linkBtn.href = data.link;
        // Detect link type
        if (data.link.includes('github.com')) {
            linkBtn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                View on GitHub
            `;
        } else {
            linkBtn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Visit Project
            `;
        }
        linkBtn.style.display = 'inline-flex';
    } else {
        linkBtn.style.display = 'none';
    }

    // Show overlay
    overlay.style.display = 'flex';
    _isOpen = true;

    // Release lock so mouse works
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
}

// Close
export function closeReadable() {
    overlay.style.display = 'none';
    _isOpen = false;

    // Re-acquire pointer lock so player can look around again
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.requestPointerLock();
    }
}