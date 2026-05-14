(() => {
  // ---- Desktop scroll progress (rail) ----
  const progressEl = document.getElementById('scrollProgress');
  const trackHeight = 220;     // musí sedieť s .rail-track height
  const thumbHeight = 32;      // musí sedieť s .rail-progress height
  const maxTravel = trackHeight - thumbHeight;

  function updateScrollProgress() {
    if (!progressEl) return;

    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollMax = (doc.scrollHeight - window.innerHeight);
    const t = scrollMax > 0 ? (scrollTop / scrollMax) : 0;
    const y = Math.max(0, Math.min(maxTravel, t * maxTravel));
    progressEl.style.transform = `translateY(${y}px)`;
  }

  // ---- Mobile menu behavior ----
  const mnav = document.getElementById('mnav');
  const mnavToggle = document.getElementById('mnavToggle');

  let lastScrollY = window.scrollY;
  const SCROLL_THRESHOLD = 18; // podľa tvojho popisu

  function closeMobileMenu() {
    if (!mnav) return;
    mnav.classList.remove('is-open');
  }

  function onScroll() {
    const y = window.scrollY;
    const delta = Math.abs(y - lastScrollY);

    updateScrollProgress();

    if (!mnav) {
      lastScrollY = y;
      return;
    }

    // after first meaningful scroll -> switch to "on_scroll" state (panel visible)
    if (y > SCROLL_THRESHOLD) mnav.classList.add('is-scrolled');
    else mnav.classList.remove('is-scrolled');

    // if user scrolls while menu is open -> close it
    if (delta > 2 && mnav.classList.contains('is-open')) {
      closeMobileMenu();
    }

    lastScrollY = y;
  }

  if (mnavToggle && mnav) {
    mnavToggle.addEventListener('click', () => {
      // click toggles open state; if scrolled panel is already visible, click still toggles
      mnav.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();
})();
