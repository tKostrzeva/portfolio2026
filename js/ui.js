(() => {
    // DESKTOP rail progress
    const thumb = document.getElementById('scrollThumb');
    const track = thumb ? thumb.parentElement : null;
    const thumbH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rail-thumb-h')) || 32;

    function updateScrollProgress() {
        if (!thumb || !track) return;
        const trackH = track.offsetHeight;
        const maxTravel = Math.max(0, trackH - thumbH);
        const doc = document.documentElement;
        const top = window.scrollY || doc.scrollTop;
        const max = (doc.scrollHeight - window.innerHeight);
        const t = max > 0 ? (top / max) : 0;
        const y = Math.max(0, Math.min(maxTravel, t * maxTravel));
        thumb.style.transform = `translateY(${y}px)`;
    }

    // MOBILE menu behavior
    const mnav = document.getElementById('mnav');
    const toggle = document.getElementById('mnavToggle');
    let lastY = window.scrollY;
    const TH = 18;

    function closeMenu() {
        if (mnav) {
            mnav.classList.remove('is-open');
            const arrow = mnav.querySelector('.mnav-arrow');
            if (arrow) arrow.textContent = '->';
        }
    }

    function onScroll() {
        const y = window.scrollY;
        const d = Math.abs(y - lastY);

        updateScrollProgress();

        if (mnav) {
            if (y > TH) mnav.classList.add('is-scrolled');
            else mnav.classList.remove('is-scrolled');

            // if user scrolls while explicitly open => close
            if (d > 2 && mnav.classList.contains('is-open')) closeMenu();
        }

        lastY = y;
    }

    if (toggle && mnav) {
        const arrow = mnav.querySelector('.mnav-arrow');
        toggle.addEventListener('click', () => {
            mnav.classList.toggle('is-open');
            if (arrow) {
                arrow.textContent = mnav.classList.contains('is-open') ? '<-' : '->';
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();
})();
