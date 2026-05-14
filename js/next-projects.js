// Next projects — auto-populates "Next projects" section on project pages
// To add a new project: add an entry to the PROJECTS array below

const PROJECTS = [
    { slug: "dark-pipe-beer",      cover: "/" },
    { slug: "expandify",           cover: "projects/expandify/tomas_kostrzeva_expandify_visual_identity_06.webp" },
    { slug: "medusa-travel",       cover: "projects/medusa-travel/medusa_travel_REF_title_figma.webp" },
    { slug: "tedx",                cover: "projects/tedx/TEDxBratislava2023_vizualna_identita_00_cover.webp" },
    { slug: "amazonika",           cover: "projects/amazonika/Amazonika_cover_palo_santo_wood-ezgif.com-optimize-3.gif" },
    { slug: "rozeta",              cover: "projects/rozeta/rozeta_exhibition_catalogue_01.webp" },
    { slug: "benkovic-book",       cover: "projects/benkovic-book/florian-benkovic-song-book_01.webp" },
    { slug: "coworking-slovakia",  cover: "projects/coworking-slovakia/Coworking_Slovakia_visual_identity_18.webp" },
    { slug: "appz",                cover: "projects/appz/Tomas_kostrzeva_Akademia_pre_podnikave_zeny_visual_identity_01.webp" },
    { slug: "odd-janko",           cover: "projects/odd-janko/Tomas_kostrzeva_odd_janko_visual_identity_01.webp" },
    { slug: "sa-taronja",          cover: "projects/sa-taronja/tomas_kostrzeva_sa_taronja_visual_identity_01.webp" },
    { slug: "bkis",                cover: "projects/bkis/tomas_kostrzeva_bkis_visual_identity_proposal_00.webp" },
];

(() => {
    const container = document.querySelector(".next-projects");
    if (!container) return;

    const current = container.dataset.current;
    const others = PROJECTS.filter(p => p.slug !== current);

    // Pick 2 sequential from the list (wrapping around)
    const startIdx = PROJECTS.findIndex(p => p.slug === current);
    const picks = [];
    let i = (startIdx + 1) % others.length;
    while (picks.length < 2) {
        picks.push(others[i % others.length]);
        i++;
    }

    container.innerHTML = picks.map(p =>
        `<a href="${p.slug}.html" class="card card--half">
            <img src="${p.cover}" class="card-img">
        </a>`
    ).join("\n");
})();
