/* KTM Timeline — data model: defaults, factories, validation, migration */
(function (K) {
  'use strict';
  var SCHEMA = 'ktm-timeline', VERSION = 1;
  function uid(p) { return (p || 'id') + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function defaultDesign() {
    return {
      typography: {
        family: 'Poppins', baseSize: 16,
        heading: { family: 'inherit', size: 34, weight: 700, color: '#232450', lineHeight: 1.2, align: 'center' },
        title: { family: 'inherit', size: 19, weight: 600, color: '#232450', lineHeight: 1.3, align: 'left' },
        date: { family: 'inherit', size: 13, weight: 600, color: '#232450', lineHeight: 1.4, align: 'left', transform: 'none' },
        description: { family: 'inherit', size: 15, weight: 400, color: '#4A4D6A', lineHeight: 1.6, align: 'left' }
      },
      colors: {
        bgType: 'solid', background: '#F8F9FB', gradFrom: '#F8F9FB', gradTo: '#E8EAF6', gradAngle: 180,
        line: '#232450', marker: '#FEDC69', markerIcon: '#232450', markerBorder: '#232450',
        cardBg: '#FFFFFF', cardOpacity: 100, border: '#E3E5EE', dateBg: '#FEDC69',
        accent: '#232450', highlight: '#FEDC69', progress: '#232450', focus: '#232450'
      },
      structure: {
        lineWidth: 3, lineStyle: 'solid', markerShape: 'circle', markerSize: 40, markerBorderWidth: 2,
        markerContent: 'icon', connector: 'arrow', datePosition: 'card', dateStyle: 'pill', titleIcon: false
      },
      cards: {
        radius: 14, borderWidth: 1, shadow: 'md', padding: 22, hover: 'lift', categoryAccent: false,
        imagePosition: 'top', imageHeight: 180, imageFit: 'cover'
      },
      dims: { maxWidth: 1100, fullWidth: false, align: 'center', cardGap: 32, sectionPadding: 48 },
      responsive: { breakpoint: 680, mobileScale: 0.92, mobileHorizontal: 'scroll', hideImagesMobile: false },
      animation: { enabled: true, type: 'slide-up', duration: 600, delay: 0, stagger: 90, drawLine: true, markers: true, scrollReveal: true },
      interaction: { mode: 'always', lightbox: true, search: true, filter: true, expandAll: true },
      advanced: { dateFormat: 'long', locale: 'en-GB', showCount: true, autoHeight: false }
    };
  }
  function defaultLayout() {
    return {
      type: 'alternating',
      alternating: { arrangement: 'alternate', startSide: 'left' },
      single: { linePosition: 'left' },
      horizontal: { cardWidth: 300, snap: true },
      cards: { columns: 3, connectors: true },
      roadmap: { path: 'curved', perRow: 3, showProgress: true, progress: 2 },
      compact: { showDescriptions: true }
    };
  }
  function defaultProject(name) {
    var now = new Date().toISOString();
    return {
      schema: SCHEMA, version: VERSION, id: uid('tl'), name: name || 'Untitled timeline', createdAt: now, updatedAt: now,
      meta: { title: 'My timeline', subtitle: '', showHeader: true, lang: 'en' },
      layout: defaultLayout(), design: defaultDesign(), categories: [], events: [], customThemes: []
    };
  }
  function createEvent(p) {
    p = p || {};
    return {
      id: uid('ev'),
      date: Object.assign({ type: 'year', start: '', end: '', label: '', sortYear: '' }, p.date || {}),
      title: p.title || 'New event', description: p.description || '',
      image: Object.assign({ url: '', alt: '', caption: '' }, p.image || {}),
      icon: p.icon == null ? 'fa-solid fa-star' : p.icon, categoryId: p.categoryId || '',
      link: Object.assign({ url: '', label: '' }, p.link || {}),
      highlight: !!p.highlight, media: Object.assign({ type: 'none', url: '', caption: '' }, p.media || {}), order: 0
    };
  }

  var ENUMS = {
    'layout.type': ['alternating', 'single', 'horizontal', 'cards', 'roadmap', 'compact'],
    'layout.alternating.arrangement': ['alternate', 'left', 'right'], 'layout.alternating.startSide': ['left', 'right'],
    'layout.single.linePosition': ['left', 'center'], 'layout.roadmap.path': ['straight', 'curved', 'stepped'],
    'design.typography.heading.align': ['left', 'center', 'right'], 'design.typography.title.align': ['left', 'center', 'right'],
    'design.typography.date.align': ['left', 'center', 'right'], 'design.typography.description.align': ['left', 'center', 'right', 'justify'],
    'design.typography.date.transform': ['none', 'uppercase'],
    'design.colors.bgType': ['solid', 'gradient', 'transparent'],
    'design.structure.lineStyle': ['solid', 'dashed', 'dotted'], 'design.structure.markerShape': ['circle', 'square', 'diamond', 'ring', 'hexagon', 'none'],
    'design.structure.markerContent': ['icon', 'number', 'dot', 'empty'], 'design.structure.connector': ['arrow', 'line', 'none'],
    'design.structure.datePosition': ['card', 'line'], 'design.structure.dateStyle': ['pill', 'plain'],
    'design.cards.shadow': ['none', 'sm', 'md', 'lg'], 'design.cards.hover': ['none', 'lift', 'glow', 'scale', 'border'],
    'design.cards.imagePosition': ['top', 'bottom', 'left', 'right', 'none'], 'design.cards.imageFit': ['cover', 'contain'],
    'design.dims.align': ['center', 'left'], 'design.responsive.mobileHorizontal': ['scroll', 'vertical'],
    'design.animation.type': ['fade', 'slide-up', 'slide-side', 'zoom'],
    'design.interaction.mode': ['always', 'expand', 'modal', 'hover'],
    'design.advanced.dateFormat': ['long', 'short', 'numeric', 'year'],
    'event.date.type': ['date', 'year', 'range', 'label'], 'event.media.type': ['none', 'youtube', 'audio']
  };
  var RANGES = {
    'design.typography.baseSize': [10, 24], 'design.typography.*.size': [9, 72], 'design.typography.*.weight': [100, 900], 'design.typography.*.lineHeight': [0.9, 2.4],
    'design.colors.gradAngle': [0, 360], 'design.colors.cardOpacity': [0, 100],
    'design.structure.lineWidth': [1, 12], 'design.structure.markerSize': [12, 72], 'design.structure.markerBorderWidth': [0, 8],
    'design.cards.radius': [0, 40], 'design.cards.borderWidth': [0, 8], 'design.cards.padding': [6, 48], 'design.cards.imageHeight': [60, 480],
    'design.dims.maxWidth': [480, 2400], 'design.dims.cardGap': [4, 120], 'design.dims.sectionPadding': [0, 160],
    'design.responsive.breakpoint': [360, 1000], 'design.responsive.mobileScale': [0.7, 1.1],
    'design.animation.duration': [100, 3000], 'design.animation.delay': [0, 3000], 'design.animation.stagger': [0, 600],
    'layout.horizontal.cardWidth': [200, 520], 'layout.cards.columns': [1, 5], 'layout.roadmap.perRow': [1, 6], 'layout.roadmap.progress': [0, 1000]
  };
  function rangeFor(path) {
    if (RANGES[path]) return RANGES[path];
    var g = path.replace(/^design\.typography\.(heading|title|date|description)\./, 'design.typography.*.');
    return RANGES[g] || null;
  }
  var COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  function str(v, def, max) { return typeof v === 'string' ? v.slice(0, max || 400) : (typeof v === 'number' ? String(v) : def); }

  // Deep-normalise a value against its default: unknown keys dropped, wrong types replaced by defaults.
  function norm(def, val, path) {
    if (def && typeof def === 'object' && !Array.isArray(def)) {
      var out = {}, src = (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
      Object.keys(def).forEach(function (k) { out[k] = norm(def[k], src[k], path ? path + '.' + k : k); });
      return out;
    }
    if (typeof def === 'number') {
      var n = typeof val === 'number' ? val : (typeof val === 'string' && val.trim() !== '' ? Number(val) : NaN);
      if (!isFinite(n)) return def;
      var r = rangeFor(path); if (r) n = Math.min(r[1], Math.max(r[0], n));
      return n;
    }
    if (typeof def === 'boolean') return typeof val === 'boolean' ? val : def;
    if (typeof def === 'string') {
      if (ENUMS[path]) return ENUMS[path].indexOf(val) > -1 ? val : def;
      if (/^#/.test(def)) return (typeof val === 'string' && COLOR_RE.test(val.trim())) ? val.trim() : def;
      return str(val, def, 400);
    }
    return def;
  }
  function cleanId(v, prefix) { return (typeof v === 'string' && /^[\w-]{1,64}$/.test(v)) ? v : uid(prefix); }
  function normEvent(raw, catIds) {
    var base = createEvent();
    var src = (raw && typeof raw === 'object') ? raw : {};
    var dt = src.date && typeof src.date === 'object' ? src.date : {};
    var img = src.image && typeof src.image === 'object' ? src.image : {};
    var lk = src.link && typeof src.link === 'object' ? src.link : {};
    var md = src.media && typeof src.media === 'object' ? src.media : {};
    return {
      id: cleanId(src.id, 'ev'),
      date: {
        type: ENUMS['event.date.type'].indexOf(dt.type) > -1 ? dt.type : 'year',
        start: str(dt.start, '', 40), end: str(dt.end, '', 40), label: str(dt.label, '', 120), sortYear: str(dt.sortYear, '', 20)
      },
      title: str(src.title, base.title, 300), description: str(src.description, '', 20000),
      image: { url: imageUrl(img.url), alt: str(img.alt, '', 400), caption: str(img.caption, '', 400) },
      icon: /^[a-z0-9 \-]{0,80}$/i.test(String(src.icon || '')) ? String(src.icon || '') : '',
      categoryId: (typeof src.categoryId === 'string' && catIds.indexOf(src.categoryId) > -1) ? src.categoryId : '',
      link: { url: linkUrl(lk.url), label: str(lk.label, '', 120) },
      highlight: src.highlight === true,
      media: { type: ENUMS['event.media.type'].indexOf(md.type) > -1 ? md.type : 'none', url: linkUrl(md.url), caption: str(md.caption, '', 300) },
      order: 0
    };
  }
  function imageUrl(u) {
    u = typeof u === 'string' ? u.trim() : '';
    if (!u) return '';
    if (/^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml);base64,/i.test(u)) return u.length < 6000000 ? u : '';
    return linkUrl(u);
  }
  function linkUrl(u) {
    u = typeof u === 'string' ? u.trim().slice(0, 2000) : '';
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u) || /^#/.test(u)) return u;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u) || /^\/\//.test(u)) return ''; // block javascript:, data:, etc.
    return u;
  }
  function normProject(raw) {
    var def = defaultProject();
    var cats = Array.isArray(raw.categories) ? raw.categories.slice(0, 50).map(function (c) {
      c = c && typeof c === 'object' ? c : {};
      return { id: cleanId(c.id, 'cat'), name: str(c.name, 'Category', 60) || 'Category', color: (typeof c.color === 'string' && COLOR_RE.test(c.color)) ? c.color : '#232450' };
    }) : [];
    var catIds = cats.map(function (c) { return c.id; });
    var events = Array.isArray(raw.events) ? raw.events.slice(0, 1000).map(function (e) { return normEvent(e, catIds); }) : [];
    var seen = {}; events.forEach(function (e, i) { if (seen[e.id]) e.id = uid('ev'); seen[e.id] = 1; e.order = i; });
    var themes = Array.isArray(raw.customThemes) ? raw.customThemes.slice(0, 30).map(function (t) {
      t = t && typeof t === 'object' ? t : {};
      return { id: cleanId(t.id, 'th'), name: str(t.name, 'Custom theme', 60), design: norm(defaultDesign(), t.design, 'design') };
    }) : [];
    return {
      schema: SCHEMA, version: VERSION, id: cleanId(raw.id, 'tl'), name: str(raw.name, def.name, 120) || def.name,
      createdAt: str(raw.createdAt, def.createdAt, 40), updatedAt: str(raw.updatedAt, def.updatedAt, 40),
      meta: norm(def.meta, raw.meta, 'meta'), layout: norm(def.layout, raw.layout, 'layout'), design: norm(def.design, raw.design, 'design'),
      categories: cats, events: events, customThemes: themes
    };
  }
  function migrate(raw, v) {
    // v1 is the first published schema. Future migrations go here: if (v < 2) { ...; v = 2; }
    return raw;
  }
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('The file does not contain a timeline project.');
    if (raw.schema !== SCHEMA) throw new Error('This file is not a KTM EduTech Timeline project (missing "schema": "ktm-timeline").');
    var v = Number(raw.version);
    if (!isFinite(v) || v < 1) throw new Error('The project file has no valid schema version.');
    if (v > VERSION) throw new Error('This project uses schema version ' + v + ', which is newer than this editor supports (version ' + VERSION + '). Update the Timeline Generator to open it.');
    if (raw.events != null && !Array.isArray(raw.events)) throw new Error('"events" must be a list.');
    return normProject(migrate(raw, v));
  }
  function getPath(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, path, val) {
    var ks = path.split('.'), last = ks.pop(), t = ks.reduce(function (a, k) { return a[k]; }, o); t[last] = val;
  }
  function deepMerge(target, src) {
    Object.keys(src || {}).forEach(function (k) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && target[k] && typeof target[k] === 'object') deepMerge(target[k], src[k]);
      else target[k] = src[k];
    });
    return target;
  }

  K.model = {
    SCHEMA: SCHEMA, VERSION: VERSION, uid: uid, clone: clone, defaultDesign: defaultDesign, defaultLayout: defaultLayout,
    defaultProject: defaultProject, createEvent: createEvent, validate: validate, normProject: normProject, normEvent: normEvent,
    getPath: getPath, setPath: setPath, deepMerge: deepMerge, ENUMS: ENUMS, rangeFor: rangeFor, imageUrl: imageUrl, linkUrl: linkUrl, COLOR_RE: COLOR_RE
  };
})(window.KTM = window.KTM || {});
