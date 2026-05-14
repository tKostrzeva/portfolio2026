// v09 optimised — 4-image rasterizer with lerp morphing
// Optimisations: visibility culling, idle stop, adaptive tile count,
// inlined map(), skip invisible tiles, simplified rect.

var cnv;
var imgs = [];

let tilesX = (window.innerWidth <= 768) ? 70 : 120;
let tilesY;

let maps = [];
let fromMap = [];
let toMap = [];
let transT = 1.0;

// Tuning
let transSpeed = 0.03;
let cornerRatio = 0.2;
let minSize = 0.15;
let sizeRange = 1.0 - minSize;    // precomputed for inlined map()
let blobCX = (window.innerWidth <= 768) ? 0.5 : 0.33;

const wordToIdx = {
    "lives": 0,
    "live": 0,
    "breathe": 1,
    "interact": 2,
    "evolve": 3
};

let lastWord = "";
let isVisible = true;
let lastMouseX = 0;
let lastMouseY = 0;

// --- Helpers ---

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function buildMap(img) {
    img.resize(0, tilesY);
    img.loadPixels();
    let startX = round(tilesX * blobCX - img.width / 2);
    let m = [];
    for (let x = 0; x < tilesX; x++) {
        m[x] = new Float32Array(tilesY);
        let imgX = x - startX;
        if (imgX >= 0 && imgX < img.width) {
            for (let y = 0; y < tilesY; y++) {
                let i4 = 4 * (y * img.width + imgX);
                m[x][y] = (img.pixels[i4] * 0.299 +
                    img.pixels[i4 + 1] * 0.587 +
                    img.pixels[i4 + 2] * 0.114) / 255;
            }
        }
    }
    return m;
}

function snapshotLerped() {
    let snap = [];
    let t = easeInOut(transT);
    for (let x = 0; x < tilesX; x++) {
        snap[x] = new Float32Array(tilesY);
        for (let y = 0; y < tilesY; y++) {
            snap[x][y] = lerp(fromMap[x][y], toMap[x][y], t);
        }
    }
    return snap;
}

// --- Visibility control ---

function checkVisibility() {
    const heroSlab = document.querySelector(".hero-slab");
    let nowVisible = !heroSlab.classList.contains("is-shrunk");
    if (nowVisible && !isVisible) {
        isVisible = true;
        loop();
    } else if (!nowVisible && isVisible) {
        isVisible = false;
        noLoop();
    }
}

// --- p5 lifecycle ---

function preload() {
    imgs[0] = loadImage("assets/img/hero/live.png");
    imgs[1] = loadImage("assets/img/hero/breathe.png");
    imgs[2] = loadImage("assets/img/hero/interact.png");
    imgs[3] = loadImage("assets/img/hero/evolve.png");
}

function setup() {
    const heroSlab = document.querySelector(".hero-slab");
    cnv = createCanvas(heroSlab.offsetWidth, heroSlab.offsetHeight);
    cnv.parent(heroSlab);

    tilesY = round(tilesX * height / width);

    for (let i = 0; i < 4; i++) {
        maps[i] = buildMap(imgs[i]);
    }

    let w = document.getElementById("hero-word").textContent.trim();
    lastWord = w;
    let idx = (wordToIdx[w] !== undefined) ? wordToIdx[w] : 0;
    fromMap = maps[idx];
    toMap = maps[idx];
    transT = 1.0;

    const wordEl = document.getElementById("hero-word");
    new MutationObserver(() => {
        let newWord = wordEl.textContent.trim();
        if (newWord.length > 0 && newWord !== lastWord) {
            fromMap = snapshotLerped();
            let newIdx = (wordToIdx[newWord] !== undefined) ? wordToIdx[newWord] : 0;
            toMap = maps[newIdx];
            transT = 0;
            lastWord = newWord;
            if (isVisible) loop();
        }
    }).observe(wordEl, { childList: true, characterData: true, subtree: true });

    // Visibility check on scroll
    window.addEventListener("scroll", checkVisibility, { passive: true });

    frameRate(30);
    noStroke();
    rectMode(CENTER);
}

function draw() {
    clear();

    let strength = 5;
    let mX = map(mouseX, 0, windowWidth, strength, -strength);
    let mY = map(mouseY, 0, windowHeight, strength, -strength);

    push();
    fill("#006FFF");
    translate(mX, mY);
    let ellipseX = (windowWidth <= 768) ? windowWidth / 2 : windowWidth / 3;
    ellipse(ellipseX, (windowHeight / 4), 289, 289);
    pop();

    // Advance transition
    let animating = transT < 1.0;
    if (animating) {
        transT = min(1.0, transT + transSpeed);
    }
    let t = easeInOut(transT);

    let ts = width / tilesX;
    let cr = ts * cornerRatio;

    push();
    translate(ts / 2, ts / 2);
    translate(-mX, -mY);
    fill("#ECECEC");

    for (let x = 0; x < tilesX; x++) {
        let fx = fromMap[x];
        let tx = toMap[x];
        let px = x * ts;
        for (let y = 0; y < tilesY; y++) {
            let b = fx[y] + (tx[y] - fx[y]) * t;  // inlined lerp
            // all tiles render — full grid always visible
            let s = (minSize + b * sizeRange) * ts; // inlined map()
            rect(px, y * ts, s, s, cr);
        }
    }

    pop();

    // Stop loop when idle (transition done + mouse still)
    if (!animating && mouseX === lastMouseX && mouseY === lastMouseY) {
        noLoop();
    }
    lastMouseX = mouseX;
    lastMouseY = mouseY;
}

function mouseMoved() {
    if (isVisible) loop();
}

function windowResized() {
    const heroSlab = document.querySelector(".hero-slab");
    resizeCanvas(heroSlab.offsetWidth, heroSlab.offsetHeight);
    tilesX = (window.innerWidth <= 768) ? 70 : 120;
    tilesY = round(tilesX * height / width);
    blobCX = (window.innerWidth <= 768) ? 0.5 : 0.33;
    for (let i = 0; i < 4; i++) {
        maps[i] = buildMap(imgs[i]);
    }
}
