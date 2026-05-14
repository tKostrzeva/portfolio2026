// CTA banner rasterizer v3 optimised — WEBGL, sin wave Z, visibility culling
// Optimisations: precomputed sin per brightness level, no push/pop,
// reduced tile count, visibility check, lower detail ellipses

new p5(function (p) {
    let img;
    let cnv;

    let tilesX = 50;
    let tilesY;

    let minSize = 0.1;
    let sizeRange = 1.0 - minSize;
    let maxDepth = 30;
    let tiltStrength = 0.15;

    let brightnessMap;
    let tileSize;     // precomputed tile sizes (ts * s)
    let tilePos;      // precomputed x/y positions

    let isVisible = false;
    let observer;

    p.preload = function () {
        img = p.loadImage("assets/img/photo_cta_banner.jpg");
    };

    p.setup = function () {
        const placeholder = document.querySelector(".sketch-placeholder");
        const size = placeholder.offsetWidth;
        cnv = p.createCanvas(size, size, p.WEBGL);
        cnv.parent(placeholder);

        // Lower detail ellipses (default is 25 segments — 8 is enough for small dots)
        p.detailX = 8;

        tilesY = tilesX;
        img.resize(tilesX, tilesY);
        img.loadPixels();

        let total = tilesX * tilesY;
        brightnessMap = new Float32Array(total);
        tileSize = new Float32Array(total);

        for (let i = 0; i < total; i++) {
            let i4 = i * 4;
            let b = (img.pixels[i4] * 0.299 +
                     img.pixels[i4 + 1] * 0.587 +
                     img.pixels[i4 + 2] * 0.114) / 255;
            brightnessMap[i] = b;
            tileSize[i] = (minSize + b * sizeRange);
        }

        buildPositions();

        // Visibility: only animate when placeholder is in viewport
        observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
            if (isVisible) p.loop(); else p.noLoop();
        }, { threshold: 0.1 });
        observer.observe(placeholder);

        p.frameRate(30);
        p.noStroke();
        p.noLoop();
    };

    function buildPositions() {
        let ts = p.width / tilesX;
        let halfW = p.width / 2;
        let halfH = p.height / 2;
        let total = tilesX * tilesY;
        tilePos = new Float32Array(total * 2);
        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                let idx = (y * tilesX + x) * 2;
                tilePos[idx]     = x * ts - halfW + ts / 2;
                tilePos[idx + 1] = y * ts - halfH + ts / 2;
            }
        }
    }

    p.windowResized = function () {
        const placeholder = document.querySelector(".sketch-placeholder");
        const size = placeholder.offsetWidth;
        p.resizeCanvas(size, size);
        buildPositions();
    };

    p.draw = function () {
        p.clear();

        let ts = p.width / tilesX;
        let phase = p.frameCount * 0.02;

        // Tilt
        let rotY = (p.mouseX / p.width * 2 - 1) * tiltStrength;
        let rotX = (1 - p.mouseY / p.height * 2) * tiltStrength;
        p.rotateX(rotX);
        p.rotateY(rotY);

        p.fill("#ECECEC");

        let total = tilesX * tilesY;
        for (let i = 0; i < total; i++) {
            let b = brightnessMap[i];
            let z = p.cos(phase - b * p.TWO_PI) * maxDepth;
            let s = tileSize[i] * ts;
            let pi = i * 2;

            p.push();
            p.translate(tilePos[pi], tilePos[pi + 1], z);
            p.ellipse(0, 0, s, s);
            p.pop();
        }
    };
});
