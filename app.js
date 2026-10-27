(() => {
  // ---------- constants ----------

  const CELL_RATIO = 4 / 3; // one grid cell is a 3:4 portrait tile
  const GRID_EXTENT = 200;  // cells in each direction for the seam guides
  const PAD = 24;           // breathing room between posts and the frame, in px
  const MIN_UNIT = 50;      // smallest column width, in px

  // ---------- languages ----------

  const LANGS = ['en', 'es', 'pt'];
  const LANG_NAMES = { en: 'English', es: 'Español', pt: 'Português' };
  const LANG_KEY = 'portfolioLang';

  // The language: ?lang= in the address, then the last choice, then the browser's language.
  const lang = (() => {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (LANGS.includes(q)) { localStorage.setItem(LANG_KEY, q); return q; }
      const saved = localStorage.getItem(LANG_KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (err) { /* storage may be blocked */ }
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(browser) ? browser : 'en';
  })();

  // Interface text. Content text lives in the JSON files, written as { en, es, pt }.
  const UI = {
    en: {
      view_home: 'Home', view_canvas: 'Infinite canvas', view_gallery: 'Gallery', view_drawings: 'Drawings',
      view_writings: 'Writings', view_about: 'About', view_contact: 'Contact',
      nav_home: 'Home', nav_about: 'About', nav_work: 'My work', nav_contact: 'Contact',
      seams_show: 'Show seams (G)', seams_hide: 'Hide seams (G)', reset: 'Reset view (R)',
      prev: 'Previous image', next: 'Next image',
      writings_kicker: 'Tutorials & thoughts', writings_heading: 'Writings',
      nothing: 'Nothing published yet.', all_writings: '← All writings',
      not_found: 'That article could not be found.', open_pdf: 'Open PDF in a new tab →',
      article_error: 'This article could not be loaded.',
      found_label: 'Where I found them', inspired_label: 'How they inspired me', visit: 'Visit profile',
      soon: 'soon',
      view_shop: 'Shop', shop_kicker: 'Courses, imagery & more', shop_heading: 'Shop',
      nav_shop: 'Shop', view_music: 'Music I Love', all_types: '← All types', all_bands: '← All bands', listen: 'Listen on YouTube →',
      all_shop: '← All products', buy: 'Buy now',
      shop_note: "You will be taken to the seller's website to complete your purchase.",
    },
    es: {
      view_home: 'Inicio', view_canvas: 'Lienzo infinito', view_gallery: 'Galería', view_drawings: 'Dibujos',
      view_writings: 'Textos', view_about: 'Sobre mí', view_contact: 'Contacto',
      nav_home: 'Inicio', nav_about: 'Sobre mí', nav_work: 'Mi obra', nav_contact: 'Contacto',
      seams_show: 'Mostrar guías (G)', seams_hide: 'Ocultar guías (G)', reset: 'Restablecer vista (R)',
      prev: 'Imagen anterior', next: 'Imagen siguiente',
      writings_kicker: 'Tutoriales y reflexiones', writings_heading: 'Textos',
      nothing: 'Todavía no hay nada publicado.', all_writings: '← Todos los textos',
      not_found: 'No se encontró ese texto.', open_pdf: 'Abrir PDF en una pestaña nueva →',
      article_error: 'No se pudo cargar este texto.',
      found_label: 'Dónde los descubrí', inspired_label: 'Cómo me inspiraron', visit: 'Visitar perfil',
      soon: 'pronto',
      view_shop: 'Tienda', shop_kicker: 'Cursos, imágenes y más', shop_heading: 'Tienda',
      nav_shop: 'Tienda', view_music: 'Música que amo', all_types: '← Todos los tipos', all_bands: '← Todas las bandas', listen: 'Escuchar en YouTube →',
      all_shop: '← Todos los productos', buy: 'Comprar ahora',
      shop_note: 'Serás redirigido a la web del vendedor para completar tu compra.',
    },
    pt: {
      view_home: 'Início', view_canvas: 'Tela infinita', view_gallery: 'Galeria', view_drawings: 'Desenhos',
      view_writings: 'Textos', view_about: 'Sobre', view_contact: 'Contato',
      nav_home: 'Início', nav_about: 'Sobre', nav_work: 'Meu trabalho', nav_contact: 'Contato',
      seams_show: 'Mostrar guias (G)', seams_hide: 'Ocultar guias (G)', reset: 'Redefinir vista (R)',
      prev: 'Imagem anterior', next: 'Próxima imagem',
      writings_kicker: 'Tutoriais e reflexões', writings_heading: 'Textos',
      nothing: 'Nada publicado ainda.', all_writings: '← Todos os textos',
      not_found: 'Não encontramos esse texto.', open_pdf: 'Abrir PDF em uma nova aba →',
      article_error: 'Não foi possível carregar este texto.',
      found_label: 'Onde os descobri', inspired_label: 'Como me inspiraram', visit: 'Visitar perfil',
      soon: 'em breve',
      view_shop: 'Loja', shop_kicker: 'Cursos, imagens e mais', shop_heading: 'Loja',
      nav_shop: 'Loja', view_music: 'Músicas que amo', all_types: '← Todos os tipos', all_bands: '← Todas as bandas', listen: 'Ouvir no YouTube →',
      all_shop: '← Todos os produtos', buy: 'Comprar agora',
      shop_note: 'Você será levado ao site do vendedor para concluir a compra.',
    },
  };
  const T = (key) => (UI[lang] && UI[lang][key]) || UI.en[key] || key;

  // Any value written as { en, es, pt } is shown in the current language, falling back to English.
  function localize(value) {
    if (Array.isArray(value)) return value.map(localize);
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length && keys.every((k) => LANGS.includes(k))) return value[lang] || value.en;
      const out = {};
      for (const k of keys) out[k] = localize(value[k]);
      return out;
    }
    return value;
  }

  // Small flags, drawn in SVG so they look the same on every system
  const FLAGS = {
    en:
      '<svg viewBox="0 0 60 30" aria-hidden="true"><clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>' +
      '<clipPath id="uk-t"><path d="M30,15 h30 v15 z v-30 z h-30 z h-30 v15 z"/></clipPath>' +
      '<g clip-path="url(#uk-s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/>' +
      '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>' +
      '<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-t)" stroke="#C8102E" stroke-width="4"/>' +
      '<path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>' +
      '<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
    es:
      '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#c60b1e"/>' +
      '<rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>',
    pt:
      '<svg viewBox="0 0 720 504" aria-hidden="true"><rect width="720" height="504" fill="#009c3b"/>' +
      '<path d="M360 42 L678 252 L360 462 L42 252 Z" fill="#ffdf00"/>' +
      '<circle cx="360" cy="252" r="126" fill="#002776"/>' +
      '<path d="M234 252 Q360 214 486 252" stroke="#fff" stroke-width="18" fill="none"/></svg>',
  };

  const VIEWS = ['home', 'canvas', 'gallery', 'writings', 'shop', 'music', 'about', 'contact'];

  // Simple line icons for the contact buttons (24 × 24 grid)
  const ICONS = {
    instagram:
      '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>',
    youtube:
      '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor"/>' +
      '<path class="cut" d="M10 9.2v5.6l4.8-2.8z"/>',
    shop:
      '<path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    email:
      '<rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    pinterest:
      '<circle cx="12" cy="12" r="9.5" fill="currentColor"/>' +
      '<text class="cut" x="12.3" y="16.8" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700">P</text>',
    website:
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
      '<ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M3 12h18" stroke="currentColor" stroke-width="1.6"/>',
  };

  // ---------- elements ----------

  const $ = (id) => document.getElementById(id);
  const make = (tag, text, cls) => {
    const n = document.createElement(tag);
    n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };

  const siteName = $('site-name');
  const workBtn = $('work-btn');
  const workMenu = $('work-menu');
  const homeLink = $('home-link');
  const aboutLink = $('about-link');
  const shopLink = $('shop-link');
  const musicInner = $('music-inner');
  let musicItems = [];
  let musicMeta = {};
  const contactLink = $('contact-link');
  const viewport = $('viewport');
  const stage = $('stage');
  const world = $('world');
  const galleryStage = $('gallery-stage');
  const galleryCats = $('gallery-cats');
  const galleryStack = $('gallery-stack');
  const homeInner = $('home-inner');
  const canvasBanner = $('canvas-banner');
  const shopInner = $('shop-inner');
  let shopItems = [];
  let shopMeta = {};
  const writingsInner = $('writings-inner');
  const aboutInner = $('about-inner');
  const contactInner = $('contact-inner');
  const footerText = $('footer-text');
  const hud = $('hud');
  const seamsBtn = $('seams');
  const resetBtn = $('reset');
  const detail = $('detail');
  const detailMedia = $('detail-media');
  const detailText = $('detail-text');
  const message = $('message');

  // Owner-only controls: open the site once with ?owner in the address, in your own browser.
  // ?owner=off turns it off. Visitors never see the seams button, and G does nothing for them.
  const ownerMode = (() => {
    try {
      const flag = new URLSearchParams(location.search).get('owner');
      if (flag === 'off') localStorage.removeItem('portfolioOwner');
      else if (flag !== null) localStorage.setItem('portfolioOwner', '1');
      return localStorage.getItem('portfolioOwner') === '1';
    } catch (err) {
      return false;
    }
  })();

  // ---------- state ----------

  let site = { name: 'Portfolio', projects: [], about: {}, contact: {}, footer: {} };
  let posts = [];
  let galleryItems = [];
  let drawingItems = [];
  let typoItems = [];
  let writingItems = [];
  let writingsMeta = {};
  let inspirationItems = [];
  let inspirationsMeta = {};
  let articleToken = 0; // lets a slow article load give way to a newer click
  let COLUMNS = 4;  // set from tiles.json
  let GAP = 2;      // thin gutter between posts, in px; set from tiles.json
  let B = { minX: 0, minY: 0, maxX: 4, maxY: 1 }; // layout bounds, in cells
  let unit = 0;     // column width in px
  let cellH = 0;    // row height in px
  let offset = { x: 0, y: 0 };
  let drag = null;
  let lastDragEnd = 0;
  let detailCarousel = null;
  let current = null;       // the view on screen
  let canvasReady = false;

  // ---------- data loading ----------

  // The single-file build embeds the data; when served as files, it is fetched.
  async function loadJSON(name) {
    if (window.EMBEDDED && window.EMBEDDED[name]) return window.EMBEDDED[name];
    const r = await fetch(name, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    return r.json();
  }

  // Markdown articles load the same way: from the embedded copy, or fetched as a file.
  async function loadText(name) {
    if (window.EMBEDDED && typeof window.EMBEDDED[name] === 'string') return window.EMBEDDED[name];
    const r = await fetch(name, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    return r.text();
  }

  // Each post's images as objects. A plain string is accepted as just a src.
  function slidesOf(post) {
    return (post.images || []).map((s) => (typeof s === 'string' ? { src: s } : s));
  }

  // ---------- canvas layout ----------

  function computeBounds() {
    let maxY = 1;
    for (const p of posts) maxY = Math.max(maxY, p.y + p.h);
    B = { minX: 0, minY: 0, maxX: COLUMNS, maxY };
  }

  // The column width is set by the frame width, so the grid fills it exactly.
  function computeUnit() {
    const availW = stage.clientWidth - 2 * PAD;
    unit = Math.max(Math.floor(availW / COLUMNS), MIN_UNIT);
    cellH = Math.round(unit * CELL_RATIO);
  }

  // Allowed offset range on one axis. If the layout fits, it is centred.
  // If it is larger than the frame, it can be scrolled, but its edges
  // can never move inside the padding.
  function axisRange(size, content, start) {
    if (content + 2 * PAD <= size) {
      const c = (size - content) / 2 - start;
      return { lo: c, hi: c };
    }
    return { lo: size - PAD - content - start, hi: PAD - start };
  }

  function clampOffset() {
    const cw = (B.maxX - B.minX) * unit;
    const ch = (B.maxY - B.minY) * cellH;
    const rx = axisRange(stage.clientWidth, cw, B.minX * unit);
    const ry = axisRange(stage.clientHeight, ch, B.minY * cellH);
    offset.x = Math.min(rx.hi, Math.max(rx.lo, offset.x));
    offset.y = Math.min(ry.hi, Math.max(ry.lo, offset.y));
  }

  function applyOffset() {
    clampOffset();
    world.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
  }

  // ---------- shared pieces ----------

  function makeNavButton(kind, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `nav ${kind}`;
    b.setAttribute('aria-label', kind === 'prev' ? T('prev') : T('next'));
    b.textContent = label;
    return b;
  }

  // Feed cover: the first image only, with a badge when there are more.
  function buildCover(post) {
    const slides = slidesOf(post);

    const cover = document.createElement('div');
    cover.className = 'cover';

    const img = new Image();
    img.src = slides[0] ? slides[0].src : '';
    img.alt = post.caption || post.id;
    img.draggable = false;
    img.loading = 'lazy';
    img.onerror = () => cover.classList.add('missing');
    cover.append(img);

    if (slides.length > 1) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">' +
        '<rect x="3" y="0.5" width="8" height="8" rx="1.5" fill="none" stroke="#fff" stroke-width="1.4"/>' +
        '<rect x="0.5" y="3" width="8" height="8" rx="1.5" fill="rgba(0,0,0,0.35)" stroke="#fff" stroke-width="1.4"/>' +
        '</svg>';
      cover.append(badge);
    }
    return cover;
  }

  // Carousel: only used in the reading view. onChange(index) runs whenever
  // the visible image changes, so the story text can follow it.
  function buildCarousel(post, onChange) {
    const slides = slidesOf(post);
    const count = slides.length;

    const wrap = document.createElement('div');
    wrap.className = 'carousel';

    const track = document.createElement('div');
    track.className = 'track';
    slides.forEach((s) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const img = new Image();
      img.src = s.src;
      img.alt = s.caption || post.caption || post.id;
      img.draggable = false;
      img.loading = 'lazy';
      img.onerror = () => slide.classList.add('missing');
      slide.append(img);
      track.append(slide);
    });
    wrap.append(track);

    let index = 0;
    let dotEls = [];

    function go(i) {
      if (!count) return;
      index = (i + count) % count;
      track.style.transform = `translateX(${-index * 100}%)`;
      dotEls.forEach((d, j) => d.classList.toggle('on', j === index));
      if (onChange) onChange(index);
    }

    if (count > 1) {
      const dots = document.createElement('div');
      dots.className = 'dots';
      dotEls = slides.map(() => {
        const d = document.createElement('span');
        d.className = 'dot';
        dots.append(d);
        return d;
      });

      const prev = makeNavButton('prev', '‹');
      const next = makeNavButton('next', '›');
      prev.addEventListener('click', (e) => { e.stopPropagation(); go(index - 1); });
      next.addEventListener('click', (e) => { e.stopPropagation(); go(index + 1); });

      wrap.append(prev, next, dots);
    }

    wrap.carousel = {
      next: () => go(index + 1),
      prev: () => go(index - 1),
      go,
      get count() { return count; },
    };
    go(0);
    return wrap;
  }

  // ---------- reading overlay (image + story) ----------

  function setDetailText(caption, description, kicker) {
    detailText.innerHTML = '';
    if (kicker) detailText.append(make('div', kicker, 'kicker'));
    if (caption) detailText.append(make('h2', caption));
    // Each blank line starts a new paragraph
    for (const para of String(description || '').split(/\n\s*\n/)) {
      const text = para.trim();
      if (text) detailText.append(make('p', text));
    }
    detailText.scrollTop = 0;
  }

  // The story for one image of a post. Each image can have its own caption and text;
  // if it has none, the post's caption and description are used.
  function showPostText(post, i, count) {
    const s = slidesOf(post)[i] || {};
    const caption = s.caption || post.caption;
    const body = s.description !== undefined ? s.description : post.description;
    setDetailText(caption, body, count > 1 ? `${i + 1} / ${count}` : '');
  }

  // Size an image box to a ratio, leaving room for the story panel on wide screens.
  function fitSize(ratio) {
    const wide = window.innerWidth >= 900;
    const maxW = wide ? window.innerWidth * 0.92 - 480 : window.innerWidth * 0.92;
    const maxH = window.innerHeight * (wide ? 0.82 : 0.6);
    let H = maxH;
    let W = H * ratio;
    if (W > maxW) { W = maxW; H = W / ratio; }
    return { W: Math.round(W), H: Math.round(H) };
  }

  // A canvas post, sized to its own shape. Its story follows the visible image.
  function openDetail(post) {
    const { W, H } = fitSize((post.w * 3) / (post.h * 4));

    detailMedia.classList.remove('single');
    detailMedia.style.width = `${W}px`;
    detailMedia.style.height = `${H}px`;
    detailMedia.innerHTML = '';

    const count = slidesOf(post).length;
    const wrap = buildCarousel(post, (i) => showPostText(post, i, count));
    detailMedia.append(wrap);
    detailCarousel = wrap.carousel;

    detail.classList.add('open');
  }

  // A gallery image at its natural proportions, with its story.
  function openImage(item) {
    detailMedia.style.width = '';
    detailMedia.style.height = '';
    detailMedia.classList.add('single');
    detailMedia.innerHTML = '';

    const img = new Image();
    img.src = item.src;
    img.alt = item.alt || item.caption || '';
    img.draggable = false;
    detailMedia.append(img);

    detailCarousel = null;
    setDetailText(item.caption, item.description, '');
    detail.classList.add('open');
  }

  function closeDetail() {
    detail.classList.remove('open');
    detailMedia.innerHTML = '';
    detailText.innerHTML = '';
    detailCarousel = null;
  }

  $('detail-close').addEventListener('click', closeDetail);
  detail.addEventListener('click', (e) => {
    if (e.target === detail) closeDetail(); // click outside closes it
  });

  // Swipe inside the reading overlay (carousel posts)
  let dSwipe = null;
  detailMedia.addEventListener('pointerdown', (e) => {
    dSwipe = { id: e.pointerId, x: e.clientX };
  });
  detailMedia.addEventListener('pointerup', (e) => {
    if (!dSwipe || e.pointerId !== dSwipe.id) return;
    const dx = e.clientX - dSwipe.x;
    dSwipe = null;
    if (Math.abs(dx) > 40 && detailCarousel) {
      dx < 0 ? detailCarousel.next() : detailCarousel.prev();
    }
  });
  detailMedia.addEventListener('pointercancel', () => { dSwipe = null; });

  // ---------- canvas rendering ----------

  function render() {
    world.innerHTML = '';

    // Seam guide layer: centred on the origin, sized in cells.
    const grid = document.createElement('div');
    grid.id = 'grid';
    grid.style.left = `${-GRID_EXTENT * unit}px`;
    grid.style.top = `${-GRID_EXTENT * cellH}px`;
    grid.style.width = `${2 * GRID_EXTENT * unit}px`;
    grid.style.height = `${2 * GRID_EXTENT * cellH}px`;
    grid.style.backgroundSize = `${unit}px ${cellH}px`;
    world.append(grid);

    const half = GAP / 2;
    for (const p of posts) {
      const el = document.createElement('article');
      el.className = 'post';
      el.dataset.id = p.id;
      // Inset by half the gutter on each side, so neighbours are separated
      // by a thin line of the stage colour.
      el.style.left = `${p.x * unit + half}px`;
      el.style.top = `${p.y * cellH + half}px`;
      el.style.width = `${p.w * unit - GAP}px`;
      el.style.height = `${p.h * cellH - GAP}px`;

      el.append(buildCover(p));

      // No title on the feed itself: the story and caption show only in the reading view.
      // Click opens the post; ignored when the click ended a drag
      el.addEventListener('click', () => {
        if (performance.now() - lastDragEnd < 250) return;
        openDetail(p);
      });

      world.append(el);
    }
    applyOffset();
  }

  // Start at the top of the feed, centred horizontally.
  function resetView() {
    if (!posts.length) return;
    offset = { x: 0, y: PAD };
    applyOffset();
  }

  function toggleGuides() {
    document.body.classList.toggle('guides');
    const on = document.body.classList.contains('guides');
    seamsBtn.textContent = on ? T('seams_hide') : T('seams_show');
    seamsBtn.classList.toggle('on', on);
  }

  // ---------- gallery ----------

  // One stacked-columns renderer, used by every gallery type.
  function renderStack(items, grid) {
    grid.innerHTML = '';
    for (const item of items) {
      const fig = document.createElement('figure');
      fig.className = 'g-item';

      const img = new Image();
      img.src = item.src;
      img.alt = item.alt || item.caption || '';
      img.loading = 'lazy';
      img.draggable = false;
      img.onerror = () => fig.classList.add('missing');
      fig.append(img);

      if (item.caption) fig.append(make('figcaption', item.caption, 'caption'));

      fig.addEventListener('click', () => openImage(item));
      grid.append(fig);
    }
  }

  // Gallery: first a card per work type, then the chosen type in the stacked layout.
  // "#/gallery" shows the cards; "#/gallery/<type id>" shows one type.
  function renderGallery(sub) {
    const types = site.gallery_types || [];
    const sources = { artwork: galleryItems, drawings: drawingItems, typography: typoItems };
    const chosen = types.find((t) => t.id === sub);
    galleryStage.scrollTop = 0;

    if (!chosen) {
      galleryStack.hidden = true;
      galleryStack.innerHTML = '';
      galleryCats.hidden = false;
      galleryCats.innerHTML = '';
      galleryCats.append(make('h1', T('view_gallery')));
      const grid = document.createElement('div');
      grid.className = 'home-grid';
      for (const t of types) {
        const a = document.createElement('a');
        a.className = 'home-card glow';
        a.href = `#/gallery/${encodeURIComponent(t.id)}`;
        a.append(make('h2', t.title || t.id));
        if (t.description) a.append(make('p', t.description));
        grid.append(a);
      }
      galleryCats.append(grid);
      return;
    }

    galleryCats.hidden = true;
    galleryStack.hidden = false;
    galleryStack.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'gallery-head';
    const back = make('a', T('all_types'), 'back glow');
    back.href = '#/gallery';
    head.append(back, make('h1', chosen.title || chosen.id));
    galleryStack.append(head);
    if (chosen.description) galleryStack.append(make('p', chosen.description, 'home-intro'));
    const grid = document.createElement('div');
    grid.id = 'gallery-grid';
    galleryStack.append(grid);
    renderStack(sources[chosen.id] || [], grid);
  }

  // ---------- markdown: a small built-in reader (headings, lists, quotes, code, images, links) ----------

  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Links and images may point to web pages, mail, this site's own files, or embedded images.
  // Anything else becomes "#", so an article cannot run script.
  function safeUrl(url) {
    const u = String(url).trim();
    if (/^(https?:|mailto:|media\/|writings\/|#|\/|data:image\/)/i.test(u)) return escapeHtml(u);
    return '#';
  }

  function inlineMd(text) {
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy">`);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${safeUrl(href)}"${ext}>${label}</a>`;
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return out;
  }

  function renderMarkdown(md) {
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    const isBlockStart = (l) => /^(#{1,3}\s|>|```|\s*[-*]\s|\s*\d+\.\s)/.test(l);
    const listRe = /^\s*([-*]|\d+\.)\s+/;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (line.startsWith('```')) {
        const code = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
        i++; // closing fence
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }

      // The article title is shown by the page, so "#" becomes h2 and "##" h3
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        const tag = `h${h[1].length + 1}`;
        out.push(`<${tag}>${inlineMd(h[2])}</${tag}>`);
        i++;
        continue;
      }

      if (line.startsWith('>')) {
        const quote = [];
        while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''));
        out.push(`<blockquote><p>${inlineMd(quote.join(' '))}</p></blockquote>`);
        continue;
      }

      if (listRe.test(line)) {
        const ordered = /^\s*\d+\./.test(line);
        const items = [];
        while (i < lines.length && listRe.test(lines[i])) {
          items.push(`<li>${inlineMd(lines[i++].replace(listRe, ''))}</li>`);
        }
        out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++]);
      out.push(`<p>${inlineMd(para.join(' '))}</p>`);
    }
    return out.join('\n');
  }

  // The page already shows the title from writings.json, so a leading "# Title" is dropped.
  const withoutTitle = (md) => String(md).replace(/^\s*#\s+[^\n]*\n?/, '');

  function formatDate(iso) {
    try {
      return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (err) {
      return iso;
    }
  }

  // ---------- writings: a list of articles, each one Markdown or PDF ----------

  function articleCard(item) {
    const a = document.createElement('a');
    a.className = 'writing glow';
    a.href = `#/writings/${encodeURIComponent(item.id)}`;

    if (item.cover) {
      const img = new Image();
      img.src = item.cover;
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false;
      a.append(img);
    }

    const body = document.createElement('div');
    if (item.date) body.append(make('div', formatDate(item.date), 'kicker'));
    body.append(make('h2', item.title || item.id));
    if (item.summary) body.append(make('p', item.summary, 'summary'));
    if (item.tags && item.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'tags';
      for (const t of item.tags) tags.append(make('span', t, 'tag'));
      body.append(tags);
    }
    a.append(body);
    return a;
  }

  function renderWritingList() {
    articleToken++;
    writingsInner.innerHTML = '';
    writingsInner.append(make('div', writingsMeta.kicker || T('writings_kicker'), 'kicker'));
    writingsInner.append(make('h1', writingsMeta.heading || T('writings_heading')));
    if (writingsMeta.intro) writingsInner.append(make('p', writingsMeta.intro, 'subtitle'));

    if (!writingItems.length) {
      writingsInner.append(make('p', T('nothing'), 'subtitle'));
      return;
    }
    const list = document.createElement('div');
    list.className = 'writing-list';
    for (const item of writingItems) list.append(articleCard(item));
    writingsInner.append(list);
  }

  async function renderArticle(id) {
    const token = ++articleToken;
    const item = writingItems.find((w) => w.id === id);
    writingsInner.innerHTML = '';
    $('view-writings').scrollTop = 0;

    const back = make('a', T('all_writings'), 'back glow');
    back.href = '#/writings';
    writingsInner.append(back);

    if (!item) {
      writingsInner.append(make('p', T('not_found'), 'subtitle'));
      return;
    }

    if (item.date) writingsInner.append(make('div', formatDate(item.date), 'kicker'));
    writingsInner.append(make('h1', item.title || item.id));
    if (item.summary) writingsInner.append(make('p', item.summary, 'subtitle'));

    const holder = document.createElement('div');
    holder.className = 'article';
    writingsInner.append(holder);

    try {
      if (item.pdf) {
        const frame = document.createElement('iframe');
        frame.className = 'pdf';
        frame.src = item.pdf;
        frame.title = item.title || 'PDF';
        holder.append(frame);

        const open = document.createElement('a');
        open.className = 'pdf-link glow';
        open.href = item.pdf;
        open.target = '_blank';
        open.rel = 'noopener';
        open.textContent = T('open_pdf');
        holder.append(open);
      } else if (item.file) {
        const md = await loadText(item.file);
        if (token !== articleToken) return; // the reader has already moved on
        holder.innerHTML = renderMarkdown(withoutTitle(md));
      }
    } catch (err) {
      holder.textContent = T('article_error');
    }
  }

  function renderWritings(sub) {
    if (sub) renderArticle(sub);
    else renderWritingList();
  }

  // ---------- my inspirations: one row per artist; a click opens the story ----------

  function inspirationCard(artist) {
    const card = document.createElement('article');
    card.className = 'insp';

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'insp-head glow';
    head.setAttribute('aria-expanded', 'false');

    const photo = new Image();
    photo.src = artist.photo || '';
    photo.alt = artist.name || '';
    photo.className = 'insp-photo';
    photo.draggable = false;
    photo.loading = 'lazy';

    const names = document.createElement('span');
    names.className = 'insp-names';
    names.append(make('span', artist.name || 'Untitled', 'insp-name'));
    if (artist.field) names.append(make('span', artist.field, 'insp-field'));

    const caret = make('span', '+', 'insp-caret');
    caret.setAttribute('aria-hidden', 'true');
    head.append(photo, names, caret);

    const collapse = document.createElement('div');
    collapse.className = 'insp-collapse';
    const panel = document.createElement('div');
    panel.className = 'insp-panel';
    collapse.append(panel);

    if (artist.found) {
      panel.append(make('div', T('found_label'), 'kicker'));
      panel.append(make('p', artist.found));
    }
    if (artist.inspiration) {
      panel.append(make('div', T('inspired_label'), 'kicker'));
      for (const para of String(artist.inspiration).split(/\n\s*\n/)) {
        const t = para.trim();
        if (t) panel.append(make('p', t));
      }
    }
    if (artist.link && /^https?:/i.test(artist.link)) {
      const link = document.createElement('a');
      link.className = 'insp-link glow';
      link.href = artist.link;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `${artist.link_label || T('visit')} →`;
      panel.append(link);
    }

    head.addEventListener('click', () => {
      const open = !card.classList.contains('open');
      head.setAttribute('aria-expanded', String(open));
      card.classList.toggle('open', open);
      caret.textContent = open ? '–' : '+';
    });

    card.append(head, collapse);
    return card;
  }

  // The artists who inspired me. They sit at the end of the About page, under a divider line and a title.
  function appendInspirations() {
    aboutInner.append(make('h2', inspirationsMeta.heading || 'My inspirations', 'section'));
    if (inspirationsMeta.intro) aboutInner.append(make('p', inspirationsMeta.intro, 'body'));

    const list = document.createElement('div');
    list.className = 'insp-list';
    for (const artist of inspirationItems) list.append(inspirationCard(artist));
    aboutInner.append(list);
  }

  // ---------- home: banner, intro and a card for each page ----------

  function renderHome() {
    const h = site.home || {};
    homeInner.innerHTML = '';

    const hero = document.createElement('figure');
    hero.className = 'hero';
    if (h.banner && h.banner.src) {
      const img = new Image();
      img.src = h.banner.src;
      img.alt = h.banner.alt || '';
      img.draggable = false;
      img.onerror = () => hero.classList.add('missing');
      hero.append(img);
    } else {
      hero.classList.add('missing');
    }
    const text = document.createElement('div');
    text.className = 'hero-text';
    if (h.kicker) text.append(make('div', h.kicker, 'kicker'));
    text.append(make('h1', h.heading || site.name || 'Welcome'));
    hero.append(text);
    homeInner.append(hero);

    if (h.banner && h.banner.caption) homeInner.append(make('p', h.banner.caption, 'hero-caption'));
    if (h.intro) homeInner.append(make('p', h.intro, 'home-intro'));

    // One card per page: the live projects first, then About and Contact
    const pages = [];
    const seen = new Set(['home']);
    const add = (route, title, description) => {
      if (!VIEWS.includes(route) || seen.has(route)) return;
      seen.add(route);
      pages.push({ route, title, description });
    };
    for (const p of site.projects || []) add(p.route, p.title, p.description);
    add('shop', T('view_shop'), T('shop_kicker'));
    add('about', 'About', site.about && site.about.subtitle);
    add('contact', 'Contact', site.contact && site.contact.intro);

    const grid = document.createElement('div');
    grid.className = 'home-grid';
    for (const pg of pages) {
      const a = document.createElement('a');
      a.className = 'home-card glow';
      a.href = `#/${pg.route}`;
      a.append(make('h2', pg.title || pg.route));
      if (pg.description) a.append(make('p', pg.description));
      grid.append(a);
    }
    homeInner.append(grid);

    // Music sits on the home page only, below a divider line
    const rule = document.createElement('hr');
    rule.className = 'home-rule';
    homeInner.append(rule);
    const musicGrid = document.createElement('div');
    musicGrid.className = 'home-grid';
    const musicCard = document.createElement('a');
    musicCard.className = 'home-card glow';
    musicCard.href = '#/music';
    musicCard.append(make('h2', musicMeta.heading || T('view_music')));
    if (musicMeta.intro) musicCard.append(make('p', musicMeta.intro));
    musicGrid.append(musicCard);
    homeInner.append(musicGrid);
  }

  // ---------- shop: products that link to the page where they are sold ----------
  // The site takes no payment. Each product has a page that explains it, then a button to the seller.

  function shopCard(item) {
    const a = document.createElement('a');
    a.className = 'home-card glow shop-card';
    a.href = `#/shop/${encodeURIComponent(item.id)}`;

    const img = new Image();
    img.src = item.cover || '';
    img.alt = '';
    img.loading = 'lazy';
    img.draggable = false;
    a.append(img, make('div', item.kind || '', 'kicker'), make('h2', item.name || item.id));
    if (item.summary) a.append(make('p', item.summary));
    return a;
  }

  function renderShopList() {
    shopInner.innerHTML = '';
    shopInner.append(make('div', shopMeta.kicker || T('shop_kicker'), 'kicker'));
    shopInner.append(make('h1', shopMeta.heading || T('view_shop')));
    if (shopMeta.intro) shopInner.append(make('p', shopMeta.intro, 'subtitle'));
    if (!shopItems.length) {
      shopInner.append(make('p', T('nothing'), 'subtitle'));
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    for (const item of shopItems) grid.append(shopCard(item));
    shopInner.append(grid);
  }

  // One product: its explanation, then the button that leads to the seller
  function renderProduct(id) {
    const item = shopItems.find((s) => s.id === id);
    shopInner.innerHTML = '';
    $('view-shop').scrollTop = 0;

    const back = make('a', T('all_shop'), 'back glow');
    back.href = '#/shop';
    shopInner.append(back);

    if (!item) {
      shopInner.append(make('p', T('not_found'), 'subtitle'));
      return;
    }

    if (item.kind) shopInner.append(make('div', item.kind, 'kicker'));
    shopInner.append(make('h1', item.name || item.id));
    if (item.summary) shopInner.append(make('p', item.summary, 'subtitle'));

    const body = document.createElement('div');
    body.className = 'article';
    if (item.cover) {
      const img = new Image();
      img.src = item.cover;
      img.alt = item.name || '';
      img.draggable = false;
      body.append(img);
    }
    for (const para of String(item.body || '').split(/\n\s*\n/)) {
      const t = para.trim();
      if (t) body.append(make('p', t));
    }
    shopInner.append(body);

    if (item.link && /^https?:/i.test(item.link)) {
      const buy = document.createElement('a');
      buy.className = 'pdf-link glow shop-buy';
      buy.href = item.link;
      buy.target = '_blank';
      buy.rel = 'noopener';
      buy.textContent = `${item.button || T('buy')} →`;
      shopInner.append(buy);
      shopInner.append(make('p', T('shop_note'), 'shop-note'));
    }
  }

  function renderShop(sub) {
    if (sub) renderProduct(sub);
    else renderShopList();
  }

  // ---------- music: favourite bands and songs, each one opening the song on YouTube ----------

  // "#/music" lists the bands as plain cards; "#/music/<band id>" opens one band's albums and songs.
  function renderMusic(sub) {
    musicInner.innerHTML = '';
    $('view-music').scrollTop = 0;
    const band = musicItems.find((b) => b.id === sub);

    if (!band) {
      musicInner.append(make('div', T('view_music'), 'kicker'));
      musicInner.append(make('h1', musicMeta.heading || T('view_music')));
      if (musicMeta.intro) musicInner.append(make('p', musicMeta.intro, 'subtitle'));
      const grid = document.createElement('div');
      grid.className = 'home-grid';
      for (const b of musicItems) {
        const a = document.createElement('a');
        a.className = 'home-card glow';
        a.href = `#/music/${encodeURIComponent(b.id)}`;
        a.append(make('h2', b.band || ''));
        grid.append(a);
      }
      musicInner.append(grid);
      return;
    }

    const back = make('a', T('all_bands'), 'back glow music-back');
    back.href = '#/music';
    musicInner.append(back);
    musicInner.append(make('h1', band.band || ''));
    if (band.note) musicInner.append(make('p', band.note, 'subtitle'));

    for (const album of band.albums || []) {
      const title = album.year ? `${album.title} (${album.year})` : album.title;
      musicInner.append(make('h2', title || '', 'album'));
      const list = document.createElement('ul');
      list.className = 'music-songs';
      for (const song of album.songs || []) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'music-link';
        a.textContent = song.title || '';
        a.href = song.link || '#';
        if (song.link && /^https?:/i.test(song.link)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        li.append(a);
        list.append(li);
      }
      musicInner.append(list);
    }
  }

  // ---------- about ----------

  function aboutFigure(block) {
    const fig = document.createElement('figure');
    fig.className = `about-image w-${block.width || 'wide'}`;
    const img = new Image();
    img.src = block.src;
    img.alt = block.alt || block.caption || '';
    img.loading = 'lazy';
    img.draggable = false;
    fig.append(img);
    if (block.caption) fig.append(make('figcaption', block.caption));
    return fig;
  }

  // Blocks flow in order. Consecutive "half" images sit side by side.
  function renderAbout() {
    const a = site.about || {};
    aboutInner.innerHTML = '';

    if (a.kicker) aboutInner.append(make('div', a.kicker, 'kicker'));
    aboutInner.append(make('h1', a.heading || 'About'));
    if (a.subtitle) aboutInner.append(make('p', a.subtitle, 'subtitle'));

    let pair = null;
    for (const block of a.blocks || []) {
      if (block.type === 'image' && block.src && block.width === 'half') {
        if (!pair) {
          pair = document.createElement('div');
          pair.className = 'about-pair';
          aboutInner.append(pair);
        }
        pair.append(aboutFigure(block));
        continue;
      }
      pair = null;

      if (block.type === 'image' && block.src) {
        aboutInner.append(aboutFigure(block));
      } else if (block.type === 'lead') {
        aboutInner.append(make('p', block.text || '', 'lead'));
      } else if (block.type === 'heading') {
        aboutInner.append(make('h2', block.text || '', 'section'));
      } else if (block.type === 'quote') {
        const q = document.createElement('blockquote');
        q.className = 'quote';
        q.append(make('p', block.text || ''));
        if (block.by) q.append(make('cite', block.by));
        aboutInner.append(q);
      } else if (block.type === 'text') {
        for (const para of String(block.text || '').split(/\n\s*\n/)) {
          const t = para.trim();
          if (t) aboutInner.append(make('p', t, 'body'));
        }
      }
    }
  }

  // ---------- contact ----------

  function renderContact() {
    const c = site.contact || {};
    contactInner.innerHTML = '';

    contactInner.append(make('h1', c.heading || 'Contact'));
    if (c.intro) contactInner.append(make('p', c.intro, 'subtitle'));

    const list = document.createElement('div');
    list.className = 'contact-list';

    for (const l of c.links || []) {
      const a = document.createElement('a');
      a.className = 'contact-btn glow';
      a.href = l.href || '#';
      if (/^https?:/.test(a.href)) {
        a.target = '_blank';
        a.rel = 'noopener';
      }

      const icon = document.createElement('span');
      icon.className = 'icon';
      const key = Object.prototype.hasOwnProperty.call(ICONS, l.kind) ? l.kind : 'website';
      icon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]}</svg>`;

      const text = document.createElement('span');
      text.className = 'text';
      text.append(make('span', l.label || l.kind || 'Link', 'label'));
      if (l.detail) text.append(make('span', l.detail, 'detail'));

      a.append(icon, text, make('span', '→', 'arrow'));
      list.append(a);
    }
    contactInner.append(list);
  }

  // ---------- header, menu and footer ----------

  function applyChrome() {
    const name = site.name || 'Portfolio';

    // Logo if one is set in site.json (transparent SVG or PNG), otherwise the name as text
    siteName.innerHTML = '';
    if (site.logo && site.logo.src) {
      const img = new Image();
      img.src = site.logo.src;
      img.alt = site.logo.alt || name;
      img.draggable = false;
      if (site.logo.height) img.style.height = `${site.logo.height}px`;
      img.onerror = () => { siteName.textContent = name; };
      siteName.append(img);
      siteName.setAttribute('aria-label', name);
    } else {
      siteName.textContent = name;
    }

    const template = (site.footer && site.footer.text) || '© {year} {name}';
    footerText.textContent = template
      .replace('{year}', String(new Date().getFullYear()))
      .replace('{name}', name);
  }

  // "My work" menu: live projects link to their view; others show as "soon".
  function buildMenu() {
    workMenu.innerHTML = '';
    for (const p of site.projects || []) {
      const live = VIEWS.includes(p.route);
      const el = document.createElement(live ? 'a' : 'div');
      if (live) {
        el.href = `#/${p.route}`;
        el.dataset.route = p.route;
        el.setAttribute('role', 'menuitem');
        el.classList.add('glow');
      } else {
        el.className = 'soon';
      }

      const t = make('span', p.title || p.route || 'Untitled', 'title');
      if (!live) t.append(make('span', T('soon'), 'tag'));
      el.append(t);

      if (p.description) el.append(make('span', p.description, 'desc'));
      workMenu.append(el);
    }
  }

  function openMenu(open) {
    workMenu.classList.toggle('open', open);
    workBtn.setAttribute('aria-expanded', String(open));
  }

  workBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu(!workMenu.classList.contains('open'));
  });
  workMenu.addEventListener('click', () => openMenu(false));
  document.addEventListener('click', (e) => {
    if (workMenu.classList.contains('open') && !workMenu.contains(e.target)) openMenu(false);
  });

  // ---------- routing (hash based: #/about, #/canvas, #/gallery, #/contact) ----------

  // "#/writings/some-id" opens one article; "#/writings" opens the list.
  function parseHash() {
    const m = location.hash.match(/^#\/([a-z]+)(?:\/([^?#]+))?/i);
    const v = m ? m[1].toLowerCase() : 'home';
    return {
      name: VIEWS.includes(v) ? v : 'home',
      sub: m && m[2] ? decodeURIComponent(m[2]) : null,
    };
  }

  function route() {
    const { name, sub } = parseHash();
    showView(name);
    if (name === 'writings') renderWritings(sub);
    if (name === 'shop') renderShop(sub);
    if (name === 'gallery') renderGallery(sub);
    if (name === 'music') renderMusic(sub);
  }

  function showView(name) {
    if (!VIEWS.includes(name)) name = 'canvas';
    if (name === current) return;
    current = name;
    document.body.classList.toggle('on-canvas', name === 'canvas');

    for (const v of VIEWS) $(`view-${v}`).hidden = v !== name;
    hud.hidden = name !== 'canvas' || !ownerMode;
    closeDetail();
    openMenu(false);

    // Highlight the current view in the header and the menu
    for (const a of [homeLink, aboutLink, shopLink, contactLink]) {
      a.classList.toggle('current', a.dataset.route === name);
    }
    for (const a of workMenu.querySelectorAll('a')) {
      const on = a.dataset.route === name;
      a.classList.toggle('current', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }

    if (name === 'canvas') {
      computeUnit();
      render();
      if (!canvasReady) {
        resetView();
        canvasReady = true;
      } else {
        applyOffset();
      }
    }
    if (name === 'gallery') galleryStage.scrollTop = 0;
    if (['home', 'about', 'contact', 'writings', 'shop', 'music'].includes(name)) {
      $(`view-${name}`).scrollTop = 0;
    }

    document.title = `${siteName.textContent || 'Portfolio'} · ${T('view_' + name)}`;
  }

  // ---------- pointer: drag to pan the canvas ----------

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: offset.x,
      oy: offset.y,
      moved: false,
    };
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      viewport.classList.add('dragging');
    }
    if (drag.moved) {
      offset.x = drag.ox + dx;
      offset.y = drag.oy + dy;
      applyOffset();
    }
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved) lastDragEnd = performance.now();
    viewport.classList.remove('dragging');
    drag = null;
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // A drag should not also count as a click on whatever was under the pointer.
  viewport.addEventListener('click', (e) => {
    if (performance.now() - lastDragEnd < 250) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  // Trackpad / mouse wheel scrolls the canvas.
  viewport.addEventListener('wheel', (e) => {
    if (detail.classList.contains('open')) return;
    e.preventDefault();
    // Some browsers report wheel steps in lines or pages rather than pixels
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientHeight : 1;
    offset.x -= e.deltaX * scale;
    offset.y -= e.deltaY * scale;
    applyOffset();
  }, { passive: false });

  // ---------- glow: hover sweeps light across; holding lights it; after the hold it stays lit ----------

  let glowTimer = null;
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest ? e.target.closest('.glow') : null;
    // Pressing somewhere else lets go of any glow left over from earlier
    document.querySelectorAll('.glow.held').forEach((n) => { if (n !== el) n.classList.remove('held'); });
    if (!el) return;
    clearTimeout(glowTimer);
    glowTimer = setTimeout(() => el.classList.add('held'), 350);
  });
  document.addEventListener('pointerup', () => clearTimeout(glowTimer));
  document.addEventListener('pointercancel', () => clearTimeout(glowTimer));
  // With a mouse, the glow ends when the pointer leaves. On touch it stays until the next press.
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest ? e.target.closest('.glow') : null;
    if (el && !el.contains(e.relatedTarget)) el.classList.remove('held');
  });

  // ---------- keyboard ----------

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      openMenu(false);
      closeDetail();
      return;
    }

    if (detail.classList.contains('open')) {
      if (e.key === 'ArrowLeft' && detailCarousel) detailCarousel.prev();
      else if (e.key === 'ArrowRight' && detailCarousel) detailCarousel.next();
      return;
    }

    if (current !== 'canvas') return;

    const step = 120;
    switch (e.key) {
      case 'ArrowUp':    offset.y += step; break;
      case 'ArrowDown':  offset.y -= step; break;
      case 'ArrowLeft':  offset.x += step; break;
      case 'ArrowRight': offset.x -= step; break;
      // Vimium-style J and K move the canvas up and down (the canvas has no native scroll)
      case 'j': case 'J': offset.y -= step; break;
      case 'k': case 'K': offset.y += step; break;
      case 'r': case 'R': resetView(); return;
      case 'g': case 'G': if (ownerMode) toggleGuides(); return;
      default: return;
    }
    e.preventDefault();
    applyOffset();
  });

  seamsBtn.addEventListener('click', toggleGuides);
  resetBtn.addEventListener('click', resetView);

  // Refit the canvas columns to the new width, then go back to the top.
  window.addEventListener('resize', () => {
    if (current !== 'canvas' || !posts.length) return;
    computeUnit();
    render();
    resetView();
  });

  // ---------- language switch and static text ----------

  function applyStaticText() {
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = T(el.dataset.i18n);
  }

  function buildLanguage() {
    // The switcher appears in the header and, on phones, in the footer
    const boxes = document.querySelectorAll('.lang-group');
    boxes.forEach((box) => { box.innerHTML = ''; });
    for (const code of LANGS) for (const box of boxes) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-btn';
      b.title = LANG_NAMES[code];
      b.setAttribute('aria-label', LANG_NAMES[code]);
      b.setAttribute('aria-pressed', String(code === lang));
      b.innerHTML = FLAGS[code];
      b.addEventListener('click', () => switchLang(code));
      box.append(b);
    }
  }

  // Saves the choice and reloads the page with the same view, without the ?lang= in the address
  function switchLang(code) {
    try { localStorage.setItem(LANG_KEY, code); } catch (err) { /* ignore */ }
    const params = new URLSearchParams(location.search);
    params.delete('lang');
    const qs = params.toString();
    location.replace(location.pathname + (qs ? `?${qs}` : '') + location.hash);
  }

  // ---------- start ----------

  async function init() {
    try {
      const [siteData, tiles, gallery, drawings, typography, writings, inspirations, shop, music] = await Promise.all([
        loadJSON('site.json'),
        loadJSON('tiles.json'),
        loadJSON('gallery.json'),
        // The drawings and typography types are optional: a missing file leaves that type empty
        loadJSON('drawings.json').catch(() => ({ items: [] })),
        loadJSON('typography.json').catch(() => ({ items: [] })),
        loadJSON('writings.json').catch(() => ({ items: [] })),
        loadJSON('inspirations.json').catch(() => ({ items: [] })),
        loadJSON('shop.json').catch(() => ({ items: [] })),
        loadJSON('music.json').catch(() => ({ items: [] })),
      ]);
      const musicL = localize(music);
      musicMeta = musicL;
      musicItems = musicL.items || [];
      const shopL = localize(shop);
      shopMeta = shopL;
      shopItems = shopL.items || [];
      drawingItems = drawings.items || [];
      typoItems = localize(typography).items || [];
      const writingsL = localize(writings);
      const inspirationsL = localize(inspirations);
      writingItems = writingsL.items || [];
      writingsMeta = writingsL;
      inspirationItems = inspirationsL.items || [];
      inspirationsMeta = inspirationsL;

      site = localize(siteData);
      posts = tiles.posts || [];
      COLUMNS = tiles.columns || 4;
      GAP = typeof tiles.gap === 'number' ? tiles.gap : 2;
      galleryItems = gallery.items || [];

      computeBounds();
      applyChrome();
      applyStaticText();
      buildLanguage();
      // The canvas banner: its size comes from site.json, and the canvas starts below it
      const bn = site.canvas_banner || {};
      if (bn.src) {
        canvasBanner.src = bn.src;
        canvasBanner.alt = bn.alt || '';
        canvasBanner.style.width = `${bn.width || 480}px`;
        canvasBanner.style.height = `${bn.height || 96}px`;
        document.documentElement.style.setProperty('--banner-h', `${bn.height || 96}px`);
        canvasBanner.onerror = () => { canvasBanner.hidden = true; };
      } else {
        canvasBanner.hidden = true;
      }
      buildMenu();
      renderAbout();
      appendInspirations();
      renderContact();
      renderHome();

      window.addEventListener('hashchange', route);
      route();
    } catch (err) {
      message.style.display = 'flex';
      message.textContent =
        'Could not load the site files. If you opened index.html directly from a folder, ' +
        'use the single preview file instead, or serve the folder with a local server ' +
        '(for example: python3 -m http.server 8000).';
    }
  }

  init();
})();
