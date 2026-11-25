/*! KTM EduTech Timeline runtime v1.0.0 — renders a KTM timeline project. No dependencies (Font Awesome optional, for event icons). */
(function (w) {
  'use strict';
  var RT_VERSION = '1.0.0';
  var doc = w.document;

  /* ---------- utilities ---------- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function safeUrl(u, kind) {
    u = String(u || '').trim();
    if (!u) return '';
    if (kind === 'image' && /^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml);base64,[a-z0-9+\/=\s]+$/i.test(u)) return u;
    if (/^https?:\/\/[^\s<>"]+$/i.test(u)) return u;
    if (kind === 'link' && /^(mailto:|tel:)[^\s<>"]+$/i.test(u)) return u;
    if (kind === 'link' && /^#[\w-]*$/.test(u)) return u;
    if (!/^[a-z][a-z0-9+.\-]*:/i.test(u) && !/^\/\//.test(u) && !/[\s<>"]/.test(u)) return u; // relative path
    return '';
  }
  function safeIcon(c) { c = String(c || '').trim(); return /^[a-z0-9 \-]{1,80}$/i.test(c) ? c : ''; }
  function youtubeId(url) {
    url = String(url || '');
    var m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i);
    return m ? m[1] : '';
  }
  function hexRgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}/i.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgba(h, a) { var c = hexRgb(h); return c ? 'rgba(' + c.join(',') + ',' + a + ')' : h; }
  function lum(h) {
    var c = hexRgb(h); if (!c) return 1;
    var v = c.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function inkFor(h) { return lum(h) > 0.4 ? '#14152e' : '#ffffff'; }

  /* ---------- fonts ---------- */
  var FONTS = {
    'Poppins': '300;400;500;600;700;800', 'Inter': '300;400;500;600;700;800', 'Roboto': '300;400;500;700',
    'Open Sans': '300;400;500;600;700;800', 'Lato': '300;400;700;900', 'Montserrat': '300;400;500;600;700;800',
    'Nunito': '300;400;500;600;700;800', 'Raleway': '300;400;500;600;700;800', 'DM Sans': '300;400;500;600;700',
    'Space Grotesk': '300;400;500;600;700', 'Lexend': '300;400;500;600;700;800', 'Atkinson Hyperlegible': '400;700',
    'Quicksand': '300;400;500;600;700', 'Fredoka': '300;400;500;600;700', 'Baloo 2': '400;500;600;700;800',
    'Comic Neue': '300;400;700', 'Oswald': '300;400;500;600;700', 'Merriweather': '300;400;700;900',
    'Playfair Display': '400;500;600;700;800', 'Lora': '400;500;600;700', 'Source Serif 4': '300;400;600;700',
    'Libre Baskerville': '400;700', 'Noto Sans Thai': '300;400;500;600;700;800', 'Sarabun': '300;400;500;600;700;800',
    'Courier Prime': '400;700'
  };
  var SERIF = /Merriweather|Playfair|Lora|Serif|Baskerville|Garamond|Crimson|Courier/i;
  function cleanFont(f) { return String(f || '').replace(/[^\w \-]/g, '').trim().slice(0, 60); }
  function fontStack(f) {
    f = cleanFont(f);
    if (!f || f === 'System UI') return 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
    return '"' + f + '",' + (SERIF.test(f) ? 'Georgia,"Times New Roman",serif' : 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif');
  }
  function fontsUsed(D) {
    var t = D.typography, set = {};
    [t.family, t.heading.family, t.title.family, t.date.family, t.description.family].forEach(function (f) {
      f = cleanFont(f); if (f && f !== 'inherit' && f !== 'System UI') set[f] = 1;
    });
    return Object.keys(set);
  }
  function fontsHref(D) {
    var fams = fontsUsed(D); if (!fams.length) return '';
    return 'https://fonts.googleapis.com/css2?' + fams.map(function (f) {
      var wts = FONTS[f];
      return 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + (wts ? ':wght@' + wts : '');
    }).join('&') + '&display=swap';
  }
  function ensureFonts(D) {
    var href = fontsHref(D), el = doc.getElementById('ktm-tl-fonts');
    if (!href) { if (el) el.remove(); return; }
    if (!el) { el = doc.createElement('link'); el.id = 'ktm-tl-fonts'; el.rel = 'stylesheet'; doc.head.appendChild(el); }
    if (el.getAttribute('href') !== href) el.setAttribute('href', href);
  }

  /* ---------- dates ---------- */
  var MONTHS_FALLBACK = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parseDate(s) {
    s = String(s == null ? '' : s).trim();
    var m = s.match(/^(-?\d{1,6})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
    if (!m) return null;
    var y = parseInt(m[1], 10), mo = m[2] ? parseInt(m[2], 10) : null, d = m[3] ? parseInt(m[3], 10) : null;
    if (mo !== null && (mo < 1 || mo > 12)) return null;
    if (d !== null && (d < 1 || d > 31)) return null;
    return { y: y, m: mo, d: d };
  }
  function sortKey(ev) {
    var dt = ev.date || {};
    if (dt.type === 'label') {
      var n = parseFloat(dt.sortYear);
      if (isFinite(n)) return n;
    }
    var p = parseDate(dt.start);
    if (!p) return Infinity;
    return p.y + ((p.m || 1) - 1) / 12 + ((p.d || 1) - 1) / 400;
  }
  function yearText(y) { return y < 0 ? (-y) + ' BCE' : String(y); }
  function fmtPart(p, fmt, locale) {
    if (!p) return '';
    if (fmt === 'year' || p.m === null) return yearText(p.y);
    if (fmt === 'numeric') {
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      return (p.y < 0 ? '-' : '') + String(Math.abs(p.y)).padStart(4, '0') + '-' + pad(p.m) + (p.d ? '-' + pad(p.d) : '');
    }
    if (p.y < 100) { // Intl struggles with very early years
      return (p.d ? p.d + ' ' : '') + MONTHS_FALLBACK[p.m - 1] + ' ' + yearText(p.y);
    }
    try {
      var dt = new Date(Date.UTC(2000, p.m - 1, p.d || 1)); dt.setUTCFullYear(p.y);
      var o = { timeZone: 'UTC', year: 'numeric', month: fmt === 'long' ? 'long' : 'short' };
      if (p.d) o.day = 'numeric';
      return new Intl.DateTimeFormat(locale || 'en-GB', o).format(dt);
    } catch (e) { return (p.d ? p.d + ' ' : '') + MONTHS_FALLBACK[p.m - 1] + ' ' + p.y; }
  }
  function formatDate(ev, fmt, locale) {
    var dt = ev.date || {}, s = parseDate(dt.start), e = parseDate(dt.end);
    if (dt.type === 'label') return String(dt.label || dt.start || '');
    if (dt.type === 'range') {
      var a = s ? fmtPart(s, fmt, locale) : String(dt.start || '');
      var b = e ? fmtPart(e, fmt, locale) : (dt.end ? String(dt.end) : 'present');
      return a + ' – ' + b;
    }
    if (dt.type === 'year') return s ? yearText(s.y) : String(dt.start || '');
    return s ? fmtPart(s, fmt, locale) : String(dt.start || '');
  }
  function isoAttr(ev) {
    var dt = ev.date || {}, p = parseDate(dt.start);
    if (!p || p.y < 0 || p.y > 9999 || dt.type === 'label') return '';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return String(p.y).padStart(4, '0') + (p.m ? '-' + pad(p.m) + (p.d ? '-' + pad(p.d) : '') : '');
  }

  /* ---------- icons (UI chrome uses inline SVG so it works without Font Awesome) ---------- */
  var SVG = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1" y="4" width="22" height="16" rx="5" fill="currentColor"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="m12 2 3 6.6 7.2.7-5.4 4.8 1.6 7.1L12 17.6 5.6 21.2l1.6-7.1L1.8 9.3 9 8.6z"/></svg>',
    img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 5 5 9-10"/></svg>'
  };

  /* ---------- CSS variables ---------- */
  var SHADOWS = {
    none: ['none', '0 6px 16px rgba(16,18,40,.10)'],
    sm: ['0 1px 3px rgba(16,18,40,.08),0 1px 2px rgba(16,18,40,.06)', '0 8px 20px rgba(16,18,40,.12)'],
    md: ['0 6px 18px rgba(16,18,40,.08),0 2px 6px rgba(16,18,40,.05)', '0 14px 32px rgba(16,18,40,.14)'],
    lg: ['0 18px 40px rgba(16,18,40,.14),0 4px 12px rgba(16,18,40,.08)', '0 24px 52px rgba(16,18,40,.2)']
  };
  function fam(f) { return (!f || f === 'inherit') ? 'var(--tl-font)' : fontStack(f); }
  function vars(D, st) {
    var t = D.typography, c = D.colors, s = D.structure, k = D.cards, m = D.dims, a = D.animation, r = D.responsive;
    var bg = c.bgType === 'gradient' ? 'linear-gradient(' + c.gradAngle + 'deg,' + c.gradFrom + ',' + c.gradTo + ')' : (c.bgType === 'transparent' ? 'transparent' : c.background);
    var bgSolid = c.bgType === 'gradient' ? c.gradFrom : (c.bgType === 'transparent' ? c.cardBg : c.background);
    var sh = SHADOWS[k.shadow] || SHADOWS.md;
    var v = {
      '--tl-bg': bg, '--tl-bg-solid': bgSolid, '--tl-font': fontStack(t.family), '--tl-base': t.baseSize + 'px',
      '--tl-line': c.line, '--tl-lw': s.lineWidth + 'px', '--tl-ls': s.lineStyle,
      '--tl-marker': c.marker, '--tl-marker-ink': c.markerIcon, '--tl-marker-border': c.markerBorder, '--tl-mbw': s.markerBorderWidth + 'px',
      '--tl-ms': s.markerSize + 'px', '--tl-ms-c': Math.max(14, Math.round(s.markerSize * 0.55)) + 'px',
      '--tl-card-bg': rgba(c.cardBg, (c.cardOpacity / 100).toFixed(2)), '--tl-card-solid': c.cardBg, '--tl-border': c.border,
      '--tl-bw': k.borderWidth + 'px', '--tl-radius': k.radius + 'px', '--tl-pad': k.padding + 'px',
      '--tl-shadow': sh[0], '--tl-shadow-hover': sh[1],
      '--tl-accent': c.accent, '--tl-accent-ink': inkFor(c.accent), '--tl-accent-text': c.accent, '--tl-accent-soft': rgba(c.accent, 0.25),
      '--tl-hl': c.highlight, '--tl-hl-ink': inkFor(c.highlight), '--tl-prog': c.progress, '--tl-prog-ink': inkFor(c.progress),
      '--tl-date-bg': c.dateBg, '--tl-focus': c.focus || c.accent,
      '--tl-gap': m.cardGap + 'px', '--tl-section': m.sectionPadding + 'px', '--tl-maxw': m.maxWidth + 'px',
      '--tl-img-h': k.imageHeight + 'px', '--tl-img-h-side': Math.round(k.imageHeight * 0.8) + 'px', '--tl-img-fit': k.imageFit,
      '--tl-dur': a.duration + 'ms', '--tl-delay': a.delay + 'ms', '--tl-stagger': a.stagger + 'ms',
      '--tl-mscale': r.mobileScale, '--tl-hcw': (st && st.narrow ? Math.min(st.P.layout.horizontal.cardWidth, 260) : st ? st.P.layout.horizontal.cardWidth : 300) + 'px',
      '--tl-datecol': '7.2em', '--tl-cols': (st ? st.P.layout.cards.columns : 3)
    };
    ['heading', 'title', 'date', 'description'].forEach(function (el) {
      var x = t[el], p = '--tl-' + (el === 'description' ? 'desc' : el);
      v[p + '-ff'] = fam(x.family); v[p + '-fs'] = x.size + 'px'; v[p + '-fw'] = x.weight;
      v[p + '-c'] = x.color; v[p + '-lh'] = x.lineHeight; v[p + '-ta'] = x.align;
    });
    v['--tl-date-tt'] = t.date.transform || 'none';
    return Object.keys(v).map(function (key) { return key + ':' + v[key]; }).join(';');
  }

  /* ---------- markup ---------- */
  function paragraphs(text) {
    var t = String(text || '').trim(); if (!t) return '';
    return t.split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function plain(text, n) { var t = String(text || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; }
  function catOf(P, id) { for (var i = 0; i < P.categories.length; i++) if (P.categories[i].id === id) return P.categories[i]; return null; }
  function timeTag(ev, P, extra) {
    var iso = isoAttr(ev), txt = formatDate(ev, P.design.advanced.dateFormat, P.design.advanced.locale);
    if (!txt) return '';
    return '<time class="ktm-tl__date' + (extra || '') + '"' + (iso ? ' datetime="' + iso + '"' : '') + '>' + esc(txt) + '</time>';
  }
  function markerHTML(ev, i, P) {
    var s = P.design.structure, inner = '';
    if (s.markerContent === 'number') inner = String(i + 1);
    else if (s.markerContent === 'icon') { var ic = safeIcon(ev.icon); inner = ic ? '<i class="' + esc(ic) + '" aria-hidden="true"></i>' : ''; }
    return '<span class="ktm-tl__marker" aria-hidden="true"><span>' + inner + '</span></span>';
  }
  function imageHTML(ev, P, big) {
    var src = safeUrl(ev.image && ev.image.url, 'image'); if (!src) return '';
    var alt = ev.image.alt || '';
    var img = '<img class="ktm-tl__img" src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">';
    if (!big && P.design.interaction.lightbox) img = '<button type="button" class="ktm-tl__imgbtn" data-lightbox="' + esc(ev.id) + '" aria-label="Enlarge image' + (alt ? ': ' + esc(alt) : '') + '">' + img + '</button>';
    var cap = ev.image.caption ? '<figcaption class="ktm-tl__cap">' + esc(ev.image.caption) + '</figcaption>' : '';
    return '<figure class="ktm-tl__media">' + img + cap + '</figure>';
  }
  function mediaHTML(ev, inModal) {
    var m = ev.media || {}, cap = m.caption ? '<p class="ktm-tl__mcap">' + esc(m.caption) + '</p>' : '';
    if (m.type === 'youtube') {
      var id = youtubeId(m.url); if (!id) return '';
      if (inModal) return '<div class="ktm-tl__frame"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(m.caption || ev.title || 'Video') + '" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' + cap;
      return '<button type="button" class="ktm-tl__video" data-video="' + id + '" data-title="' + esc(m.caption || ev.title || 'Video') + '">' + SVG.play + '<span>Play video' + (m.caption ? ': ' + esc(m.caption) : '') + '</span></button>';
    }
    if (m.type === 'audio') {
      var src = safeUrl(m.url, 'link'); if (!src || !/^https?:/i.test(src) && !/^[^:]+$/.test(src)) return '';
      return '<audio class="ktm-tl__audio" controls preload="none" src="' + esc(src) + '"' + (m.caption ? ' aria-label="' + esc(m.caption) + '"' : '') + '></audio>' + cap;
    }
    return '';
  }
  function linkHTML(ev) {
    var href = safeUrl(ev.link && ev.link.url, 'link'); if (!href) return '';
    var label = ev.link.label || 'Learn more', ext = /^https?:/i.test(href);
    return '<a class="ktm-tl__link" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label) + (ext ? SVG.ext + '<span class="ktm-tl__sr"> (opens in a new tab)</span>' : '') + '</a>';
  }
  function cardHTML(ev, i, n, P, st, opts) {
    var D = P.design, mode = D.interaction.mode, cat = catOf(P, ev.categoryId), id = esc(ev.id);
    var showDateIn = D.structure.datePosition === 'card' && !opts.dateOut;
    var meta = (showDateIn ? timeTag(ev, P) : '') +
      (cat ? '<span class="ktm-tl__cat"><span class="ktm-tl__dot" style="--c:' + esc(cat.color) + '"></span>' + esc(cat.name) + '</span>' : '') +
      (ev.highlight ? '<span class="ktm-tl__badge">' + SVG.star + 'Key milestone</span>' : '') + (opts.state || '');
    var icon = D.structure.titleIcon && safeIcon(ev.icon) ? '<i class="' + esc(safeIcon(ev.icon)) + '" aria-hidden="true"></i>' : '';
    var title = '<h3 class="ktm-tl__title" id="ktm-t-' + id + '">' + icon + esc(ev.title || 'Untitled event') + '</h3>';
    var desc = paragraphs(ev.description), extras = mediaHTML(ev, false) + linkHTML(ev), body = '';
    var compactNoDesc = st.lay === 'compact' && !P.layout.compact.showDescriptions;
    if (compactNoDesc) { desc = ''; }
    var full = (desc ? '<div class="ktm-tl__desc">' + desc + '</div>' : '') + (extras ? '<div class="ktm-tl__extras">' + extras + '</div>' : '');
    if (!full) body = '';
    else if (mode === 'expand' && !st.capture) {
      var open = !!st.expanded[ev.id];
      body = '<button type="button" class="ktm-tl__btn ktm-tl__toggle" aria-expanded="' + open + '" aria-controls="ktm-d-' + id + '"><span>' + (open ? 'Show less' : 'Read more') + '</span>' + SVG.down + '</button>' +
        '<div class="ktm-tl__more" id="ktm-d-' + id + '"' + (open ? '' : ' hidden') + '>' + full + '</div>';
    } else if (mode === 'modal' && !st.capture) {
      body = (desc ? '<p class="ktm-tl__excerpt">' + esc(plain(ev.description, 110)) + '</p>' : '') +
        '<button type="button" class="ktm-tl__btn" data-open="' + id + '" aria-haspopup="dialog">View details' + SVG.right + '</button>';
    } else if (mode === 'hover' && !st.capture) {
      body = '<span class="ktm-tl__hint" aria-hidden="true">Hover or tap for details</span><div class="ktm-tl__hoverdesc">' + full + '</div>';
    } else body = full;
    var img = D.cards.imagePosition !== 'none' ? imageHTML(ev, P) : '';
    var sr = '<span class="ktm-tl__sr">Event ' + (i + 1) + ' of ' + n + (opts.dateOut || !showDateIn ? ', ' + esc(formatDate(ev, D.advanced.dateFormat, D.advanced.locale)) : '') + '. </span>';
    return '<article class="ktm-tl__card' + (opts.vcard ? ' ktm-tl__vcard' : '') + (img ? ' has-img' : '') + '"' + (mode === 'hover' ? ' tabindex="0"' : '') + ' aria-labelledby="ktm-t-' + id + '">' +
      img + '<div class="ktm-tl__content">' + sr + (meta ? '<p class="ktm-tl__meta">' + meta + '</p>' : '') + title + body + '</div></article>';
  }
  function searchText(ev, P) {
    var cat = catOf(P, ev.categoryId);
    return (ev.title + ' ' + ev.description + ' ' + formatDate(ev, P.design.advanced.dateFormat, P.design.advanced.locale) + ' ' + (cat ? cat.name : '')).toLowerCase().replace(/\s+/g, ' ');
  }
  function itemOpen(ev, i, n, P, extraCls) {
    var cat = catOf(P, ev.categoryId);
    return '<li class="ktm-tl__item' + (ev.highlight ? ' is-hl' : '') + (extraCls || '') + '" data-id="' + esc(ev.id) + '" data-cat="' + esc(ev.categoryId || '') + '" data-search="' + esc(searchText(ev, P)) + '"' + (cat ? ' style="--cat:' + esc(cat.color) + '"' : '') + '>';
  }

  function bodyHTML(P, st) {
    var evs = P.events, n = evs.length, D = P.design, lay = st.lay, out = D.structure.datePosition === 'line';
    if (!n) return '<div class="ktm-tl__empty">No events yet.</div>';
    if (lay === 'horizontal') {
      return '<div class="ktm-tl__h"><div class="ktm-tl__hscroll" tabindex="0" role="region" aria-label="' + esc(P.meta.title || 'Timeline') + ' — scroll sideways to see more events"><ol class="ktm-tl__hlist">' +
        evs.map(function (ev, i) {
          return itemOpen(ev, i, n, P) + '<div class="ktm-tl__htop">' + (out ? timeTag(ev, P) : '') + '</div><div class="ktm-tl__hrail">' + markerHTML(ev, i, P) + '</div>' + cardHTML(ev, i, n, P, st, { dateOut: out }) + '</li>';
        }).join('') + '</ol></div><div class="ktm-tl__hnav"><button type="button" data-hnav="-1" aria-label="Previous events">' + SVG.left + '</button><span aria-live="polite"></span><button type="button" data-hnav="1" aria-label="Next events">' + SVG.right + '</button></div></div>';
    }
    if (lay === 'cards') {
      return '<ol class="ktm-tl__grid">' + evs.map(function (ev, i) {
        return itemOpen(ev, i, n, P) + '<div class="ktm-tl__chead">' + markerHTML(ev, i, P) + (out ? '<div class="ktm-tl__dateout">' + timeTag(ev, P) + '</div>' : '') + '</div>' + cardHTML(ev, i, n, P, st, { dateOut: out }) + '</li>';
      }).join('') + '</ol>';
    }
    if (lay === 'roadmap') {
      var R = P.layout.roadmap, prog = R.showProgress ? Math.max(0, Math.min(n, R.progress)) : -1;
      var head = R.showProgress ? '<div class="ktm-tl__progress"><span>' + prog + ' of ' + n + ' milestones complete</span><span class="ktm-tl__pbar" aria-hidden="true"><span style="width:' + Math.round(prog / n * 100) + '%"></span></span></div>' : '';
      return head + '<div class="ktm-tl__road"><svg class="ktm-tl__roadsvg" aria-hidden="true" focusable="false"><path class="base" d=""/><path class="prog" d=""/></svg><ol class="ktm-tl__rgrid">' + evs.map(function (ev, i) {
        var done = R.showProgress && i < prog;
        var state = R.showProgress ? '<span class="ktm-tl__state' + (done ? ' is-done' : '') + '">' + (done ? SVG.check + 'Done' : 'Planned') + '</span>' : '';
        return itemOpen(ev, i, n, P, done ? ' is-done' : '') + '<div class="ktm-tl__rhead">' + markerHTML(ev, i, P) + (out ? '<div class="ktm-tl__dateout">' + timeTag(ev, P) + '</div>' : '') + '</div>' + cardHTML(ev, i, n, P, st, { dateOut: out, state: state }) + '</li>';
      }).join('') + '</ol></div>';
    }
    // vertical layouts: alternating, single, compact
    var A = P.layout.alternating, compact = lay === 'compact', useOut = out || compact;
    return '<ol class="ktm-tl__list">' + evs.map(function (ev, i) {
      var side = '';
      if (lay === 'alternating') {
        if (A.arrangement === 'left') side = ' is-left';
        else if (A.arrangement === 'right') side = ' is-right';
        else side = ((i % 2 === 0) === (A.startSide === 'left')) ? ' is-left' : ' is-right';
      }
      return itemOpen(ev, i, n, P, side + (useOut ? ' has-dateout' : '')) + '<div class="ktm-tl__rail">' + markerHTML(ev, i, P) + '</div>' +
        (useOut ? '<div class="ktm-tl__dateout">' + timeTag(ev, P) + '</div>' : '') + cardHTML(ev, i, n, P, st, { dateOut: useOut, vcard: true }) + '</li>';
    }).join('') + '</ol>';
  }

  function build(P, st) {
    var D = P.design, I = D.interaction, h = '';
    h += '<div class="ktm-tl__inner">';
    if (P.meta.showHeader && (P.meta.title || P.meta.subtitle)) {
      h += '<header class="ktm-tl__header">' + (P.meta.title ? '<h2 class="ktm-tl__heading">' + esc(P.meta.title) + '</h2>' : '') + (P.meta.subtitle ? '<p class="ktm-tl__sub">' + esc(P.meta.subtitle) + '</p>' : '') + '</header>';
    }
    var cats = P.categories.filter(function (c) { return P.events.some(function (e) { return e.categoryId === c.id; }); });
    var tools = '';
    if (I.search && P.events.length) tools += '<div class="ktm-tl__searchwrap">' + SVG.search + '<label class="ktm-tl__sr" for="ktm-s-' + st.uid + '">Search events</label><input type="search" id="ktm-s-' + st.uid + '" class="ktm-tl__search" placeholder="Search events" autocomplete="off" value="' + esc(st.q) + '"></div>';
    if (I.filter && cats.length > 1) {
      tools += '<div class="ktm-tl__filters" role="group" aria-label="Filter by category"><button type="button" class="ktm-tl__chip" data-cat="" aria-pressed="' + (!st.cat) + '">All</button>' + cats.map(function (c) {
        return '<button type="button" class="ktm-tl__chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (st.cat === c.id) + '"><span class="ktm-tl__dot" style="--c:' + esc(c.color) + '"></span>' + esc(c.name) + '</button>';
      }).join('') + '</div>';
    }
    if (I.mode === 'expand' && I.expandAll && P.events.length > 1 && !st.capture) tools += '<button type="button" class="ktm-tl__tbtn" data-expand-all>Expand all</button>';
    if (tools) h += '<div class="ktm-tl__toolbar">' + tools + '</div>';
    if (D.advanced.showCount && P.events.length) h += '<p class="ktm-tl__status" aria-live="polite"></p>';
    h += bodyHTML(P, st);
    h += '<p class="ktm-tl__empty" hidden>No events match your search.</p></div>';
    h += '<div class="ktm-tl__modal" hidden><div class="ktm-tl__backdrop" data-close></div><div class="ktm-tl__dialog" role="dialog" aria-modal="true" tabindex="-1"><button type="button" class="ktm-tl__close" data-close aria-label="Close">' + SVG.close + '</button><div class="ktm-tl__mbody"></div></div></div>';
    return h;
  }

  function rootClasses(P, st) {
    var D = P.design, s = D.structure, k = D.cards, a = D.animation;
    var c = ['ktm-tl', 'ktm-tl--' + st.lay, 'mk-' + s.markerShape, 'mc-' + s.markerContent, 'conn-' + s.connector, 'date-' + s.dateStyle,
      'hover-' + k.hover, 'img-' + k.imagePosition, 'mode-' + D.interaction.mode];
    if (D.dims.fullWidth) c.push('is-full');
    if (D.dims.align === 'left') c.push('align-left');
    if (st.narrow) c.push('is-narrow');
    if (k.categoryAccent) c.push('cat-accent');
    if (D.responsive.hideImagesMobile) c.push('hide-img-m');
    if (P.layout.single.linePosition === 'center') c.push('line-center');
    if (P.layout.horizontal.snap) c.push('h-snap');
    if (P.layout.cards.connectors) c.push('cards-conn');
    if (st.lay === 'roadmap' && P.layout.roadmap.showProgress) c.push('has-progress');
    if (st.anim) { c.push('has-anim', 'an-' + a.type); if (a.drawLine) c.push('an-line'); if (a.markers) c.push('an-marker'); }
    if (st.capture) { c.push('is-capture'); if (!st.captureTools) c.push('cap-notools'); }
    return c.join(' ');
  }

  /* ---------- post-render layout ---------- */
  function visibleItems(root) { return Array.prototype.filter.call(root.querySelectorAll('.ktm-tl__item'), function (li) { return !li.hidden; }); }
  function layoutAfter(root, st) {
    var P = st.P, lay = st.lay, vis = visibleItems(root);
    vis.forEach(function (li, i) { li.classList.toggle('is-first', i === 0); li.classList.toggle('is-last', i === vis.length - 1); });
    if (lay === 'alternating' && P.layout.alternating.arrangement === 'alternate') {
      vis.forEach(function (li, i) {
        var left = (i % 2 === 0) === (P.layout.alternating.startSide === 'left');
        li.classList.toggle('is-left', left); li.classList.toggle('is-right', !left);
      });
    }
    if (lay === 'cards') {
      var grid = root.querySelector('.ktm-tl__grid'); if (!grid) return;
      var gw = grid.clientWidth, gap = P.design.dims.cardGap, cols = Math.max(1, Math.min(P.layout.cards.columns, Math.floor((gw + gap) / (230 + gap)) || 1));
      grid.style.setProperty('--tl-cols-eff', cols);
      vis.forEach(function (li, i) { li.classList.toggle('row-end', (i + 1) % cols === 0); });
    }
    if (lay === 'roadmap') roadmapLayout(root, st, vis);
    if (lay === 'horizontal') hnavUpdate(root);
    postHeight(st);
  }
  function roadmapLayout(root, st, vis) {
    var road = root.querySelector('.ktm-tl__road'), grid = root.querySelector('.ktm-tl__rgrid'); if (!road || !grid) return;
    var R = st.P.layout.roadmap, gap = st.P.design.dims.cardGap;
    var per = Math.max(1, Math.min(R.perRow, Math.floor((grid.clientWidth + gap) / (210 + gap)) || 1));
    grid.style.setProperty('--tl-per', per);
    vis.forEach(function (li, i) {
      var row = Math.floor(i / per), col = i % per;
      if (row % 2 === 1) col = per - 1 - col;
      li.style.gridRow = String(row + 1); li.style.gridColumn = String(col + 1);
    });
    var svg = road.querySelector('svg'), base = svg.querySelector('.base'), prog = svg.querySelector('.prog');
    var rb = road.getBoundingClientRect(), W = road.clientWidth, H = road.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var pts = vis.map(function (li) {
      var m = li.querySelector('.ktm-tl__marker').getBoundingClientRect();
      return { x: m.left - rb.left + m.width / 2, y: m.top - rb.top + m.height / 2, row: parseInt(li.style.gridRow, 10) - 1 };
    });
    if (pts.length < 2) { base.setAttribute('d', ''); prog.setAttribute('d', ''); return; }
    var style = R.path, segs = [], f = function (n) { return Math.round(n * 10) / 10; };
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (a.row === b.row) {
        if (style === 'curved') { var mx = (a.x + b.x) / 2, off = (i % 2 ? -1 : 1) * Math.min(22, gap * 0.6); segs.push('Q' + f(mx) + ' ' + f(a.y + off) + ' ' + f(b.x) + ' ' + f(b.y)); }
        else segs.push('L' + f(b.x) + ' ' + f(b.y));
      } else {
        var dir = per === 1 ? (a.row % 2 ? -1 : 1) : (a.x > W / 2 ? 1 : -1);
        var xo = dir > 0 ? W - 10 : 10;
        if (style === 'curved') segs.push('C' + f(xo + dir * 6) + ' ' + f(a.y) + ' ' + f(xo + dir * 6) + ' ' + f(b.y) + ' ' + f(b.x) + ' ' + f(b.y));
        else if (style === 'stepped') segs.push('L' + f(xo) + ' ' + f(a.y) + ' L' + f(xo) + ' ' + f(b.y) + ' L' + f(b.x) + ' ' + f(b.y));
        else segs.push('L' + f(xo) + ' ' + f((a.y + b.y) / 2) + ' L' + f(b.x) + ' ' + f(b.y));
      }
    }
    var start = 'M' + f(pts[0].x) + ' ' + f(pts[0].y) + ' ';
    base.setAttribute('d', start + segs.join(' '));
    var ls = st.P.design.structure.lineStyle, lw = st.P.design.structure.lineWidth * 1.6;
    var dash = ls === 'dashed' ? (lw * 3) + ' ' + (lw * 2.2) : ls === 'dotted' ? '0.1 ' + (lw * 2.2) : '';
    [base, prog].forEach(function (p) { if (dash) p.setAttribute('stroke-dasharray', dash); else p.removeAttribute('stroke-dasharray'); p.style.strokeDashoffset = ''; });
    var k = R.showProgress ? Math.max(0, Math.min(R.progress, pts.length)) : 0;
    // progress counts by original index of visible items
    var doneVis = 0; vis.forEach(function (li) { if (li.classList.contains('is-done')) doneVis++; });
    k = R.showProgress ? doneVis : 0;
    prog.setAttribute('d', k >= 2 ? start + segs.slice(0, k - 1).join(' ') : '');
    if (st.anim && st.P.design.animation.drawLine && !dash) {
      var A = st.P.design.animation;
      [base, prog].forEach(function (p) {
        var len = p.getTotalLength ? p.getTotalLength() : 0; if (!len) return;
        p.style.strokeDasharray = len + ' ' + len;
        if (!st.roadRevealed) { p.style.transition = 'none'; p.style.strokeDashoffset = len; } else p.style.strokeDashoffset = '0';
      });
      if (!st.roadRevealed && !st.roadQueued) {
        st.roadQueued = true; road.getBoundingClientRect();
        st.pendingRoad = [function () {
          st.roadRevealed = true;
          [base, prog].forEach(function (p) { p.style.transition = 'stroke-dashoffset ' + (A.duration * 3) + 'ms ease ' + A.delay + 'ms'; p.style.strokeDashoffset = '0'; });
        }];
      }
    } else {
      [base, prog].forEach(function (p) { p.style.transition = ''; p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
    }
  }
  function hnavUpdate(root) {
    var sc = root.querySelector('.ktm-tl__hscroll'); if (!sc) return;
    var prev = root.querySelector('[data-hnav="-1"]'), next = root.querySelector('[data-hnav="1"]'), lab = root.querySelector('.ktm-tl__hnav span');
    var max = sc.scrollWidth - sc.clientWidth - 2;
    if (prev) prev.disabled = sc.scrollLeft <= 2;
    if (next) next.disabled = sc.scrollLeft >= max;
    var nav = root.querySelector('.ktm-tl__hnav'); if (nav) nav.hidden = max <= 0;
    if (lab) {
      var vis = visibleItems(root), r = sc.getBoundingClientRect(), first = 0, last = 0;
      vis.forEach(function (li, i) { var b = li.getBoundingClientRect(); if (b.right > r.left + 8 && b.left < r.right - 8) { if (!first) first = i + 1; last = i + 1; } });
      lab.textContent = vis.length ? (first + '–' + last + ' of ' + vis.length) : '';
    }
  }
  function postHeight(st) {
    if (!st.P.design.advanced.autoHeight || w.parent === w) return;
    var h = Math.ceil(doc.documentElement.scrollHeight);
    if (h === st.lastPosted) return; st.lastPosted = h;
    try { w.parent.postMessage({ type: 'ktm-timeline:height', id: st.P.id, height: h }, '*'); } catch (e) { }
  }

  /* ---------- filtering ---------- */
  function applyFilter(root, st) {
    var q = st.q.trim().toLowerCase(), items = root.querySelectorAll('.ktm-tl__item'), shown = 0;
    Array.prototype.forEach.call(items, function (li) {
      var ok = (!st.cat || li.getAttribute('data-cat') === st.cat) && (!q || li.getAttribute('data-search').indexOf(q) > -1);
      li.hidden = !ok; if (ok) shown++;
      if (ok && st.anim && st.animReady && !li.classList.contains('is-in') && !st.io) li.classList.add('is-in');
    });
    var status = root.querySelector('.ktm-tl__status');
    if (status) status.textContent = (shown === items.length ? items.length + (items.length === 1 ? ' event' : ' events') : 'Showing ' + shown + ' of ' + items.length + ' events');
    var empty = root.querySelector('p.ktm-tl__empty'); if (empty) empty.hidden = shown > 0 || !items.length;
    layoutAfter(root, st);
  }

  /* ---------- modal ---------- */
  function findEv(st, id) { for (var i = 0; i < st.P.events.length; i++) if (st.P.events[i].id === id) return { ev: st.P.events[i], i: i }; return null; }
  function openModal(root, st, id, trigger, lightbox) {
    var f = findEv(st, id); if (!f) return;
    var ev = f.ev, P = st.P, modal = root.querySelector('.ktm-tl__modal'), body = modal.querySelector('.ktm-tl__mbody'), dlg = modal.querySelector('.ktm-tl__dialog');
    var html = '';
    if (lightbox) {
      var src = safeUrl(ev.image.url, 'image');
      html = '<img class="ktm-tl__img" src="' + esc(src) + '" alt="' + esc(ev.image.alt || '') + '">' + (ev.image.caption ? '<p class="ktm-tl__cap">' + esc(ev.image.caption) + '</p>' : '');
      dlg.setAttribute('aria-label', ev.image.alt ? 'Image: ' + ev.image.alt : 'Image from ' + (ev.title || 'event'));
      dlg.removeAttribute('aria-labelledby');
    } else {
      var cat = catOf(P, ev.categoryId);
      html = imageHTML(ev, P, true) + '<p class="ktm-tl__meta">' + timeTag(ev, P) + (cat ? '<span class="ktm-tl__cat"><span class="ktm-tl__dot" style="--c:' + esc(cat.color) + '"></span>' + esc(cat.name) + '</span>' : '') + (ev.highlight ? '<span class="ktm-tl__badge">' + SVG.star + 'Key milestone</span>' : '') + '</p>' +
        '<h3 class="ktm-tl__title" id="ktm-mt-' + esc(ev.id) + '">' + esc(ev.title || 'Untitled event') + '</h3>' +
        (ev.description ? '<div class="ktm-tl__desc">' + paragraphs(ev.description) + '</div>' : '') + mediaHTML(ev, true) + linkHTML(ev);
      dlg.setAttribute('aria-labelledby', 'ktm-mt-' + ev.id); dlg.removeAttribute('aria-label');
    }
    body.innerHTML = html;
    modal.classList.toggle('is-lightbox', !!lightbox);
    modal.hidden = false; st.modalReturn = trigger || null;
    st.prevOverflow = doc.body.style.overflow; doc.body.style.overflow = 'hidden';
    var close = modal.querySelector('.ktm-tl__close'); (close || dlg).focus();
  }
  function closeModal(root, st) {
    var modal = root.querySelector('.ktm-tl__modal'); if (!modal || modal.hidden) return;
    modal.hidden = true; modal.querySelector('.ktm-tl__mbody').innerHTML = '';
    doc.body.style.overflow = st.prevOverflow || '';
    if (st.modalReturn && st.modalReturn.focus) st.modalReturn.focus();
    st.modalReturn = null;
  }

  /* ---------- events ---------- */
  function bind(root, st) {
    root.addEventListener('input', function (e) {
      if (e.target.classList.contains('ktm-tl__search')) { st.q = e.target.value; applyFilter(root, st); }
    });
    root.addEventListener('click', function (e) {
      var t = e.target, el;
      if ((el = t.closest('[data-close]'))) { closeModal(root, st); return; }
      if ((el = t.closest('.ktm-tl__chip'))) {
        st.cat = el.getAttribute('data-cat');
        root.querySelectorAll('.ktm-tl__chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); });
        applyFilter(root, st); return;
      }
      if ((el = t.closest('.ktm-tl__toggle'))) {
        var li = el.closest('.ktm-tl__item'), id = li.getAttribute('data-id'), open = el.getAttribute('aria-expanded') !== 'true';
        setExpanded(root, st, li, open); return;
      }
      if ((el = t.closest('[data-expand-all]'))) {
        var anyClosed = Array.prototype.some.call(root.querySelectorAll('.ktm-tl__toggle'), function (b) { return b.getAttribute('aria-expanded') !== 'true'; });
        root.querySelectorAll('.ktm-tl__item').forEach(function (li) { if (li.querySelector('.ktm-tl__toggle')) setExpanded(root, st, li, anyClosed); });
        el.textContent = anyClosed ? 'Collapse all' : 'Expand all'; layoutAfter(root, st); return;
      }
      if ((el = t.closest('[data-open]'))) { openModal(root, st, el.getAttribute('data-open'), el, false); return; }
      if ((el = t.closest('[data-lightbox]'))) { openModal(root, st, el.getAttribute('data-lightbox'), el, true); return; }
      if ((el = t.closest('[data-video]'))) {
        var wrap = doc.createElement('div'); wrap.className = 'ktm-tl__frame';
        var ifr = doc.createElement('iframe');
        ifr.src = 'https://www.youtube-nocookie.com/embed/' + el.getAttribute('data-video') + '?autoplay=1';
        ifr.title = el.getAttribute('data-title') || 'Video'; ifr.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        ifr.setAttribute('allowfullscreen', ''); ifr.referrerPolicy = 'strict-origin-when-cross-origin';
        wrap.appendChild(ifr); el.replaceWith(wrap); ifr.focus(); layoutAfter(root, st); return;
      }
      if ((el = t.closest('[data-hnav]'))) {
        var sc = root.querySelector('.ktm-tl__hscroll'), dir = parseInt(el.getAttribute('data-hnav'), 10);
        sc.scrollBy({ left: dir * Math.max(240, sc.clientWidth * 0.8), behavior: reduced() ? 'auto' : 'smooth' }); return;
      }
      var card = t.closest('.ktm-tl__card');
      if (card && st.P.design.interaction.mode === 'hover' && !t.closest('a,button,audio,iframe')) card.classList.toggle('is-peek');
      if (card && st.opts.onSelect && !t.closest('a,button,input,audio,iframe')) {
        var li2 = card.closest('.ktm-tl__item'); if (li2) st.opts.onSelect(li2.getAttribute('data-id'));
      }
    });
    root.addEventListener('keydown', function (e) {
      var modal = root.querySelector('.ktm-tl__modal');
      if (modal && !modal.hidden) {
        if (e.key === 'Escape') { e.preventDefault(); closeModal(root, st); return; }
        if (e.key === 'Tab') {
          var f = modal.querySelectorAll('button,a[href],iframe,audio,[tabindex]:not([tabindex="-1"])'), list = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null || x.tagName === 'IFRAME'; });
          if (!list.length) return;
          var first = list[0], last = list[list.length - 1];
          if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        return;
      }
      if (e.target.classList && e.target.classList.contains('ktm-tl__hscroll') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault(); e.target.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * 280, behavior: reduced() ? 'auto' : 'smooth' });
      }
      if (e.target.classList && e.target.classList.contains('ktm-tl__card') && (e.key === 'Enter' || e.key === ' ') && st.P.design.interaction.mode === 'hover') {
        e.preventDefault(); e.target.classList.toggle('is-peek');
      }
    });
    root.addEventListener('scroll', function (e) { if (e.target.classList && e.target.classList.contains('ktm-tl__hscroll')) hnavUpdate(root); }, true);
    root.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.classList.contains('ktm-tl__img')) return;
      var fail = doc.createElement('div'); fail.className = 'ktm-tl__imgfail'; fail.setAttribute('role', 'img');
      fail.setAttribute('aria-label', 'Image unavailable' + (img.alt ? ': ' + img.alt : ''));
      fail.innerHTML = SVG.img + '<span>Image unavailable</span>';
      var btn = img.closest('.ktm-tl__imgbtn'); (btn || img).replaceWith(fail);
      layoutAfter(root, st);
    }, true);
    root.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') scheduleLayout(root, st); }, true);
    if (w.ResizeObserver) {
      st.ro = new ResizeObserver(function () { scheduleLayout(root, st, true); });
      st.ro.observe(root);
    } else w.addEventListener('resize', function () { scheduleLayout(root, st, true); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { scheduleLayout(root, st); });
  }
  function setExpanded(root, st, li, open) {
    var btn = li.querySelector('.ktm-tl__toggle'), more = li.querySelector('.ktm-tl__more'), id = li.getAttribute('data-id');
    if (!btn || !more) return;
    btn.setAttribute('aria-expanded', String(open)); btn.querySelector('span').textContent = open ? 'Show less' : 'Read more';
    more.hidden = !open; st.expanded[id] = open; layoutAfter(root, st);
  }
  function scheduleLayout(root, st, resized) {
    if (st.raf) return;
    st.raf = (w.requestAnimationFrame || setTimeout)(function () {
      st.raf = 0;
      if (resized) {
        var wd = root.clientWidth, narrow = wd < st.P.design.responsive.breakpoint;
        if (narrow !== st.narrow) { draw(root, st); return; }
      }
      layoutAfter(root, st);
    });
  }
  function reduced() { return !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* ---------- animation ---------- */
  function setupAnim(root, st) {
    if (st.io) { st.io.disconnect(); st.io = null; }
    if (!st.anim) return;
    var items = root.querySelectorAll('.ktm-tl__item');
    var A = st.P.design.animation;
    if (!A.scrollReveal || !w.IntersectionObserver) {
      Array.prototype.forEach.call(items, function (li, k) { li.style.setProperty('--k', k); });
      root.getBoundingClientRect();
      (w.requestAnimationFrame || setTimeout)(function () {
        Array.prototype.forEach.call(items, function (li) { li.classList.add('is-in'); });
        (st.pendingRoad || []).forEach(function (f) { f(); }); st.pendingRoad = [];
      });
      return;
    }
    st.io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains('ktm-tl__road')) { (st.pendingRoad || []).forEach(function (f) { f(); }); st.pendingRoad = []; st.io.unobserve(t); return; }
        t.style.setProperty('--k', k++); t.classList.add('is-in'); st.io.unobserve(t);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    Array.prototype.forEach.call(items, function (li) { st.io.observe(li); });
    var road = root.querySelector('.ktm-tl__road');
    if (road && st.pendingRoad && st.pendingRoad.length) st.io.observe(road);
  }

  /* ---------- public API ---------- */
  var uidN = 0;
  function draw(root, st) {
    var P = st.P, D = P.design;
    var wd = root.clientWidth || w.innerWidth || 1024;
    st.narrow = wd < D.responsive.breakpoint;
    var lay = P.layout.type;
    if (lay === 'horizontal' && st.narrow && D.responsive.mobileHorizontal === 'vertical') lay = 'single';
    st.lay = lay;
    st.anim = !!(D.animation.enabled && !reduced() && !st.capture && !st.skipAnim);
    st.roadRevealed = false; st.roadQueued = false; st.pendingRoad = [];
    if (st.io) { st.io.disconnect(); st.io = null; }
    root.className = rootClasses(P, st);
    root.setAttribute('style', vars(D, st));
    root.setAttribute('lang', P.meta.lang || 'en');
    if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', P.meta.title || 'Timeline');
    root.innerHTML = build(P, st);
    st.animReady = false;
    applyFilter(root, st);
    setupAnim(root, st);
    st.animReady = true;
    st.skipAnim = false;
  }
  function parseP(P) { return typeof P === 'string' ? JSON.parse(P) : P; }
  function mount(root, P, opts) {
    if (!root) return null;
    var st = root.__ktm;
    if (!st) { st = root.__ktm = { q: '', cat: '', expanded: {}, uid: 'k' + (++uidN), opts: {} }; }
    st.P = parseP(P); st.opts = opts || {};
    st.capture = !!st.opts.capture; st.captureTools = !!st.opts.captureTools;
    if (st.opts.noAnim) st.skipAnim = true;
    if (st.capture && st.P.design.interaction.mode === 'expand') st.P.events.forEach(function (e) { st.expanded[e.id] = true; });
    if (!st.bound) { bind(root, st); st.bound = true; }
    if (st.opts.manageFonts !== false) ensureFonts(st.P.design);
    draw(root, st);
    return st;
  }
  function renderStatic(P) {
    var st = { q: '', cat: '', expanded: {}, uid: 'k0', opts: {}, P: P, narrow: false, lay: P.layout.type, anim: false };
    return { className: rootClasses(P, st), style: vars(P.design, st), html: build(P, st) };
  }
  function boot() {
    var dataEl = doc.getElementById('ktm-timeline-data'), root = doc.getElementById('ktm-timeline');
    if (!dataEl || !root) return;
    var P;
    try { P = JSON.parse(dataEl.textContent); } catch (e) { root.insertAdjacentHTML('afterbegin', '<p role="alert">Timeline data could not be read.</p>'); return; }
    mount(root, P, { manageFonts: false });
  }

  w.KTMTimeline = {
    version: RT_VERSION, mount: mount, update: mount, renderStatic: renderStatic, boot: boot,
    formatDate: formatDate, sortKey: sortKey, parseDate: parseDate, esc: esc, safeUrl: safeUrl, youtubeId: youtubeId,
    fontsHref: fontsHref, fontStack: fontStack, FONTS: FONTS, inkFor: inkFor
  };
})(window);
