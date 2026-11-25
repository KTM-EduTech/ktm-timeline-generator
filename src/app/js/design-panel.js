/* KTM Timeline — right sidebar: design studio (spec-driven controls), presets and custom themes */
(function (K) {
  'use strict';
  var U = K.ui, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon, M = K.model;
  var A;
  function P() { return A.P(); }
  var FONT_OPTS = [['System UI', 'System UI (no download)']].concat(Object.keys(window.KTMTimeline.FONTS).sort().map(function (f) { return [f, f]; }));
  var WEIGHTS = [[300, 'Light 300'], [400, 'Regular 400'], [500, 'Medium 500'], [600, 'Semibold 600'], [700, 'Bold 700'], [800, 'Extra bold 800']];
  var ALIGN = [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']];
  var is = function (path, vals) { vals = [].concat(vals); return function (p) { return vals.indexOf(M.getPath(p, path)) > -1; }; };
  var layoutIs = function (t) { return is('layout.type', t); };
  function textGroup(el, label) {
    var b = 'design.typography.' + el + '.';
    var c = [
      { t: 'font', p: b + 'family', l: label + ' font', inherit: true },
      { t: 'range', p: b + 'size', l: 'Size', min: 10, max: el === 'heading' ? 64 : 40, step: 1, u: 'px' },
      { t: 'select', p: b + 'weight', l: 'Weight', o: WEIGHTS, num: true },
      { t: 'color', p: b + 'color', l: 'Colour' },
      { t: 'range', p: b + 'lineHeight', l: 'Line height', min: 1, max: 2.2, step: 0.05 },
      { t: 'seg', p: b + 'align', l: 'Alignment', o: el === 'description' ? ALIGN.concat([['justify', 'Justify']]) : ALIGN }
    ];
    if (el === 'date') c.push({ t: 'seg', p: b + 'transform', l: 'Letter case', o: [['none', 'As typed'], ['uppercase', 'UPPERCASE']] });
    return c.map(function (x) { x.group = el; return x; });
  }
  var SECTIONS = [
    { id: 'layout', title: 'Layout', icon: 'fa-table-columns', open: true, controls: [
      { t: 'layouts', p: 'layout.type', l: 'Layout style' },
      { t: 'seg', p: 'layout.alternating.arrangement', l: 'Card arrangement', o: [['alternate', 'Alternate'], ['left', 'All left'], ['right', 'All right']], show: layoutIs('alternating') },
      { t: 'seg', p: 'layout.alternating.startSide', l: 'First card on', o: [['left', 'Left'], ['right', 'Right']], show: function (p) { return p.layout.type === 'alternating' && p.layout.alternating.arrangement === 'alternate'; } },
      { t: 'seg', p: 'layout.single.linePosition', l: 'Line position', o: [['left', 'Left'], ['center', 'Centre (dates left)']], show: layoutIs('single'), hint: 'Centre works best with "Date beside the line" (Timeline structure).' },
      { t: 'range', p: 'layout.horizontal.cardWidth', l: 'Card width', min: 200, max: 480, step: 10, u: 'px', show: layoutIs('horizontal') },
      { t: 'toggle', p: 'layout.horizontal.snap', l: 'Snap cards while scrolling', show: layoutIs('horizontal') },
      { t: 'range', p: 'layout.cards.columns', l: 'Columns (maximum)', min: 1, max: 5, step: 1, show: layoutIs('cards'), hint: 'Columns reduce automatically on narrow screens.' },
      { t: 'toggle', p: 'layout.cards.connectors', l: 'Connect cards with a line', show: layoutIs('cards') },
      { t: 'seg', p: 'layout.roadmap.path', l: 'Path style', o: [['straight', 'Straight'], ['curved', 'Curved'], ['stepped', 'Stepped']], show: layoutIs('roadmap') },
      { t: 'range', p: 'layout.roadmap.perRow', l: 'Milestones per row', min: 1, max: 6, step: 1, show: layoutIs('roadmap') },
      { t: 'toggle', p: 'layout.roadmap.showProgress', l: 'Show progress', show: layoutIs('roadmap') },
      { t: 'range', p: 'layout.roadmap.progress', l: 'Completed milestones', min: 0, max: function (p) { return p.events.length; }, step: 1, show: function (p) { return p.layout.type === 'roadmap' && p.layout.roadmap.showProgress; }, hint: 'Milestones are completed in display order.' },
      { t: 'toggle', p: 'layout.compact.showDescriptions', l: 'Show descriptions', show: layoutIs('compact') },
      { t: 'toggle', p: 'meta.showHeader', l: 'Show title and subtitle' }
    ] },
    { id: 'type', title: 'Typography', icon: 'fa-font', controls: [
      { t: 'font', p: 'design.typography.family', l: 'Main font' },
      { t: 'range', p: 'design.typography.baseSize', l: 'Base size', min: 12, max: 20, step: 1, u: 'px' },
      { t: 'groups', l: 'Text element', o: [['heading', 'Heading'], ['title', 'Titles'], ['date', 'Dates'], ['description', 'Descriptions']] }
    ].concat(textGroup('heading', 'Heading'), textGroup('title', 'Title'), textGroup('date', 'Date'), textGroup('description', 'Description')) },
    { id: 'colors', title: 'Colours', icon: 'fa-palette', controls: [
      { t: 'seg', p: 'design.colors.bgType', l: 'Background', o: [['solid', 'Solid'], ['gradient', 'Gradient'], ['transparent', 'None']] },
      { t: 'color', p: 'design.colors.background', l: 'Background colour', show: is('design.colors.bgType', 'solid') },
      { t: 'color', p: 'design.colors.gradFrom', l: 'Gradient start', show: is('design.colors.bgType', 'gradient') },
      { t: 'color', p: 'design.colors.gradTo', l: 'Gradient end', show: is('design.colors.bgType', 'gradient') },
      { t: 'range', p: 'design.colors.gradAngle', l: 'Gradient angle', min: 0, max: 360, step: 5, u: '°', show: is('design.colors.bgType', 'gradient') },
      { t: 'color', p: 'design.colors.line', l: 'Timeline line' },
      { t: 'color', p: 'design.colors.marker', l: 'Marker fill' },
      { t: 'color', p: 'design.colors.markerIcon', l: 'Marker icon / number' },
      { t: 'color', p: 'design.colors.markerBorder', l: 'Marker border' },
      { t: 'color', p: 'design.colors.cardBg', l: 'Card background' },
      { t: 'range', p: 'design.colors.cardOpacity', l: 'Card opacity', min: 0, max: 100, step: 5, u: '%' },
      { t: 'color', p: 'design.colors.border', l: 'Card border' },
      { t: 'color', p: 'design.typography.heading.color', l: 'Heading text' },
      { t: 'color', p: 'design.typography.title.color', l: 'Event title text' },
      { t: 'color', p: 'design.typography.description.color', l: 'Description text' },
      { t: 'color', p: 'design.typography.date.color', l: 'Date text' },
      { t: 'color', p: 'design.colors.dateBg', l: 'Date pill background', show: is('design.structure.dateStyle', 'pill') },
      { t: 'color', p: 'design.colors.accent', l: 'Accent (links, buttons, filters)' },
      { t: 'color', p: 'design.colors.highlight', l: 'Key milestone highlight' },
      { t: 'color', p: 'design.colors.progress', l: 'Roadmap progress', show: layoutIs('roadmap') },
      { t: 'color', p: 'design.colors.focus', l: 'Keyboard focus ring' },
      { t: 'contrast' }
    ] },
    { id: 'structure', title: 'Timeline structure', icon: 'fa-timeline', controls: [
      { t: 'range', p: 'design.structure.lineWidth', l: 'Line thickness', min: 1, max: 10, step: 1, u: 'px' },
      { t: 'seg', p: 'design.structure.lineStyle', l: 'Line style', o: [['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted']] },
      { t: 'select', p: 'design.structure.markerShape', l: 'Marker shape', o: [['circle', 'Circle'], ['square', 'Rounded square'], ['diamond', 'Diamond'], ['ring', 'Ring'], ['hexagon', 'Hexagon'], ['none', 'Hidden']] },
      { t: 'range', p: 'design.structure.markerSize', l: 'Marker size', min: 16, max: 64, step: 2, u: 'px' },
      { t: 'range', p: 'design.structure.markerBorderWidth', l: 'Marker border', min: 0, max: 6, step: 1, u: 'px' },
      { t: 'select', p: 'design.structure.connector', l: 'Card connector', o: [['arrow', 'Pointer arrow'], ['line', 'Line to marker'], ['none', 'None']] },
      { t: 'seg', p: 'design.structure.datePosition', l: 'Date position', o: [['card', 'In the card'], ['line', 'Beside the line']] },
      { t: 'seg', p: 'design.structure.dateStyle', l: 'Date style', o: [['pill', 'Pill'], ['plain', 'Plain text']] },
      { t: 'select', p: 'design.advanced.dateFormat', l: 'Date format', o: [['long', '14 February 1946'], ['short', '14 Feb 1946'], ['numeric', '1946-02-14'], ['year', 'Year only']] }
    ] },
    { id: 'cards', title: 'Event cards', icon: 'fa-square', controls: [
      { t: 'range', p: 'design.cards.radius', l: 'Corner radius', min: 0, max: 32, step: 1, u: 'px' },
      { t: 'range', p: 'design.cards.borderWidth', l: 'Border thickness', min: 0, max: 6, step: 1, u: 'px' },
      { t: 'seg', p: 'design.cards.shadow', l: 'Shadow', o: [['none', 'None'], ['sm', 'Soft'], ['md', 'Medium'], ['lg', 'Deep']] },
      { t: 'range', p: 'design.cards.padding', l: 'Padding', min: 8, max: 40, step: 1, u: 'px' },
      { t: 'select', p: 'design.cards.hover', l: 'Hover effect', o: [['lift', 'Lift'], ['glow', 'Glow'], ['scale', 'Grow'], ['border', 'Accent border'], ['none', 'None']] },
      { t: 'toggle', p: 'design.cards.categoryAccent', l: 'Category colour strip on cards' },
      { t: 'heading', l: 'Interaction' },
      { t: 'select', p: 'design.interaction.mode', l: 'Descriptions', o: [['always', 'Always visible'], ['expand', 'Expand on click'], ['modal', 'Open in a pop-up'], ['hover', 'Show on hover / tap']] },
      { t: 'toggle', p: 'design.interaction.expandAll', l: 'Show "Expand all" button', show: is('design.interaction.mode', 'expand') },
      { t: 'toggle', p: 'design.interaction.lightbox', l: 'Enlarge images on click (lightbox)' },
      { t: 'toggle', p: 'design.interaction.search', l: 'Search box' },
      { t: 'toggle', p: 'design.interaction.filter', l: 'Category filter buttons', hint: 'Appears when two or more categories are in use.' }
    ] },
    { id: 'media', title: 'Images and media', icon: 'fa-image', controls: [
      { t: 'select', p: 'design.cards.imagePosition', l: 'Image position', o: [['top', 'Top of card'], ['bottom', 'Bottom of card'], ['left', 'Left side'], ['right', 'Right side'], ['none', 'Hide images']] },
      { t: 'range', p: 'design.cards.imageHeight', l: 'Image height', min: 80, max: 400, step: 10, u: 'px', show: function (p) { return p.design.cards.imagePosition !== 'none'; } },
      { t: 'seg', p: 'design.cards.imageFit', l: 'Image fit', o: [['cover', 'Fill (crop)'], ['contain', 'Fit whole image']], show: function (p) { return p.design.cards.imagePosition !== 'none'; } },
      { t: 'note', html: 'Add images, YouTube videos and audio links inside each event. Images from other websites need an internet connection when the timeline is viewed; uploaded images are stored inside the project.' }
    ] },
    { id: 'icons', title: 'Icons', icon: 'fa-icons', controls: [
      { t: 'select', p: 'design.structure.markerContent', l: 'Marker shows', o: [['icon', 'Event icon'], ['number', 'Event number'], ['dot', 'Dot'], ['empty', 'Nothing']] },
      { t: 'toggle', p: 'design.structure.titleIcon', l: 'Show icon next to titles' },
      { t: 'note', html: 'Icons come from Font Awesome 6 (free set). Pick one per event in the event editor.' }
    ] },
    { id: 'anim', title: 'Animation', icon: 'fa-wand-magic-sparkles', controls: [
      { t: 'toggle', p: 'design.animation.enabled', l: 'Animate events' },
      { t: 'select', p: 'design.animation.type', l: 'Entrance', o: [['fade', 'Fade in'], ['slide-up', 'Slide up'], ['slide-side', 'Slide from the side'], ['zoom', 'Zoom in']], show: is('design.animation.enabled', true) },
      { t: 'range', p: 'design.animation.duration', l: 'Duration', min: 150, max: 1500, step: 50, u: 'ms', show: is('design.animation.enabled', true) },
      { t: 'range', p: 'design.animation.delay', l: 'Delay', min: 0, max: 1500, step: 50, u: 'ms', show: is('design.animation.enabled', true) },
      { t: 'range', p: 'design.animation.stagger', l: 'Stagger between events', min: 0, max: 400, step: 10, u: 'ms', show: is('design.animation.enabled', true) },
      { t: 'toggle', p: 'design.animation.scrollReveal', l: 'Reveal while scrolling', show: is('design.animation.enabled', true) },
      { t: 'toggle', p: 'design.animation.drawLine', l: 'Draw the timeline line', show: is('design.animation.enabled', true) },
      { t: 'toggle', p: 'design.animation.markers', l: 'Animate markers', show: is('design.animation.enabled', true) },
      { t: 'action', l: 'Replay animation in preview', icon: 'fa-play', act: 'replay', show: is('design.animation.enabled', true) },
      { t: 'note', html: 'Visitors who turn on "reduce motion" in their device settings always see the timeline without animation.' }
    ] },
    { id: 'dims', title: 'Spacing and dimensions', icon: 'fa-ruler-combined', controls: [
      { t: 'toggle', p: 'design.dims.fullWidth', l: 'Full width' },
      { t: 'range', p: 'design.dims.maxWidth', l: 'Maximum width', min: 600, max: 1600, step: 20, u: 'px', show: is('design.dims.fullWidth', false) },
      { t: 'seg', p: 'design.dims.align', l: 'Content alignment', o: [['center', 'Centre'], ['left', 'Left']], show: is('design.dims.fullWidth', false) },
      { t: 'range', p: 'design.dims.cardGap', l: 'Space between events', min: 8, max: 80, step: 2, u: 'px' },
      { t: 'range', p: 'design.dims.sectionPadding', l: 'Outer padding', min: 0, max: 120, step: 4, u: 'px' }
    ] },
    { id: 'resp', title: 'Responsive settings', icon: 'fa-mobile-screen', controls: [
      { t: 'range', p: 'design.responsive.breakpoint', l: 'Mobile layout below', min: 480, max: 900, step: 10, u: 'px', hint: 'Below this width the alternating layout stacks into one column and side images move to the top.' },
      { t: 'range', p: 'design.responsive.mobileScale', l: 'Text size on mobile', min: 0.75, max: 1.05, step: 0.01, u: '×' },
      { t: 'seg', p: 'design.responsive.mobileHorizontal', l: 'Horizontal layout on mobile', o: [['scroll', 'Keep scrolling'], ['vertical', 'Switch to vertical']] },
      { t: 'toggle', p: 'design.responsive.hideImagesMobile', l: 'Hide card images on mobile' }
    ] },
    { id: 'adv', title: 'Advanced settings', icon: 'fa-sliders', controls: [
      { t: 'select', p: 'design.advanced.locale', l: 'Date language', o: [['en-GB', 'English (UK)'], ['en-US', 'English (US)'], ['th-TH', 'Thai'], ['fil-PH', 'Filipino'], ['fr-FR', 'French'], ['de-DE', 'German'], ['es-ES', 'Spanish'], ['zh-CN', 'Chinese'], ['ja-JP', 'Japanese']] },
      { t: 'select', p: 'meta.lang', l: 'Page language (for screen readers)', o: [['en', 'English'], ['th', 'Thai'], ['fil', 'Filipino'], ['ceb', 'Cebuano'], ['fr', 'French'], ['de', 'German'], ['es', 'Spanish'], ['zh', 'Chinese'], ['ja', 'Japanese']] },
      { t: 'toggle', p: 'design.advanced.showCount', l: 'Show event count' },
      { t: 'toggle', p: 'design.advanced.autoHeight', l: 'Send height to parent page', hint: 'For your own websites: the timeline posts its height so a listening page can resize the iframe. Google Sites ignores this — set a fixed height there.' },
      { t: 'action', l: 'Reset all design settings', icon: 'fa-rotate', act: 'resetall', danger: true }
    ] }
  ];
  var LAYOUTS = [
    ['alternating', 'Alternating', '<path d="M24 4v40" /><rect x="4" y="8" width="16" height="9" rx="2"/><rect x="28" y="22" width="16" height="9" rx="2"/><circle cx="24" cy="12" r="2.5"/><circle cx="24" cy="26" r="2.5"/>'],
    ['single', 'Single-sided', '<path d="M10 4v40"/><rect x="16" y="7" width="26" height="9" rx="2"/><rect x="16" y="22" width="26" height="9" rx="2"/><circle cx="10" cy="11" r="2.5"/><circle cx="10" cy="26" r="2.5"/>'],
    ['horizontal', 'Horizontal', '<path d="M2 14h44"/><circle cx="10" cy="14" r="2.5"/><circle cx="24" cy="14" r="2.5"/><circle cx="38" cy="14" r="2.5"/><rect x="3" y="20" width="14" height="14" rx="2"/><rect x="17" y="20" width="14" height="14" rx="2" transform="translate(1 0)"/><rect x="32" y="20" width="14" height="14" rx="2"/>'],
    ['cards', 'Cards', '<rect x="4" y="6" width="12" height="15" rx="2"/><rect x="18" y="6" width="12" height="15" rx="2"/><rect x="32" y="6" width="12" height="15" rx="2"/><rect x="4" y="25" width="12" height="15" rx="2"/><rect x="18" y="25" width="12" height="15" rx="2"/>'],
    ['roadmap', 'Roadmap', '<path d="M6 10h32c6 0 6 14 0 14H10c-6 0-6 14 0 14h32"/><circle cx="6" cy="10" r="2.5"/><circle cx="24" cy="24" r="2.5"/><circle cx="42" cy="38" r="2.5"/>'],
    ['compact', 'Compact', '<path d="M16 4v40"/><circle cx="16" cy="9" r="1.8"/><circle cx="16" cy="19" r="1.8"/><circle cx="16" cy="29" r="1.8"/><circle cx="16" cy="39" r="1.8"/><path d="M3 9h8M3 19h8M3 29h8M3 39h8M21 9h22M21 19h18M21 29h22M21 39h16"/>']
  ];

  function ctlId(c) { return 'c-' + c.p.replace(/\./g, '-'); }
  function val(c) { return M.getPath(P(), c.p); }
  function controlHTML(c) {
    var id = c.p ? ctlId(c) : '', g = c.group ? ' data-group="' + c.group + '"' : '';
    var wrap = function (inner, extra) { return '<div class="ctl ctl-' + c.t + (extra || '') + '" data-ctl="' + esc(c.p || '') + '"' + g + '>' + inner + (c.hint ? '<p class="hint">' + esc(c.hint) + '</p>' : '') + '</div>'; };
    switch (c.t) {
      case 'layouts':
        return wrap('<span class="ctl-label" id="lbl-layouts">' + esc(c.l) + '</span><div class="layout-tiles" role="radiogroup" aria-labelledby="lbl-layouts">' + LAYOUTS.map(function (L) {
          return '<button type="button" role="radio" class="layout-tile" data-layout="' + L[0] + '" aria-checked="false"><svg viewBox="0 0 48 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + L[2] + '</svg><span>' + L[1] + '</span></button>';
        }).join('') + '</div>');
      case 'range':
        return wrap('<div class="ctl-row"><label for="' + id + '">' + esc(c.l) + '</label><span class="num"><input type="number" class="input xs" id="' + id + '-n" aria-label="' + esc(c.l) + ' value" step="' + c.step + '">' + (c.u ? '<span class="unit">' + esc(c.u) + '</span>' : '') + '</span></div><input type="range" id="' + id + '" step="' + c.step + '">');
      case 'color':
        return wrap('<div class="ctl-row"><label for="' + id + '-h">' + esc(c.l) + '</label><span class="color-pair"><input type="color" id="' + id + '" aria-label="' + esc(c.l) + ' picker"><input class="input xs hex" id="' + id + '-h" maxlength="7" spellcheck="false" autocomplete="off"></span></div>');
      case 'select': case 'font':
        var opts = c.t === 'font' ? (c.inherit ? [['inherit', 'Same as main font']] : []).concat(FONT_OPTS) : c.o;
        return wrap('<label for="' + id + '">' + esc(c.l) + '</label><select class="input" id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>'; }).join('') + '</select>');
      case 'toggle':
        return wrap('<label class="switch" for="' + id + '"><input type="checkbox" role="switch" id="' + id + '"><span class="track" aria-hidden="true"></span><span>' + esc(c.l) + '</span></label>');
      case 'seg':
        return wrap('<span class="ctl-label" id="' + id + '-l">' + esc(c.l) + '</span><div class="seg" role="radiogroup" aria-labelledby="' + id + '-l">' + c.o.map(function (o) { return '<button type="button" role="radio" aria-checked="false" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>');
      case 'groups':
        return '<div class="ctl ctl-groups"><span class="ctl-label" id="tg-l">' + esc(c.l) + '</span><div class="seg" role="tablist" aria-labelledby="tg-l">' + c.o.map(function (o, i) { return '<button type="button" role="tab" aria-selected="' + (i === 1) + '" data-tg="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div></div>';
      case 'heading': return '<h4 class="ctl-heading">' + esc(c.l) + '</h4>';
      case 'note': return '<p class="hint note">' + c.html + '</p>';
      case 'contrast': return '<div class="ctl contrast" id="contrastBox" aria-live="polite"></div>';
      case 'action': return wrap('<button type="button" class="btn ' + (c.danger ? 'danger-ghost' : 'ghost') + ' sm" data-action="' + c.act + '">' + icon(c.icon) + '<span>' + esc(c.l) + '</span></button>');
    }
    return '';
  }
  function render() {
    var box = $('#designSections');
    box.innerHTML = SECTIONS.map(function (s) {
      return '<section class="ds" data-sec="' + s.id + '"><h3><button type="button" class="ds-head" aria-expanded="' + !!s.open + '" aria-controls="ds-' + s.id + '">' + icon(s.icon) + '<span>' + esc(s.title) + '</span>' + icon('fa-chevron-down') + '</button></h3>' +
        '<div class="ds-body" id="ds-' + s.id + '"' + (s.open ? '' : ' hidden') + '>' + s.controls.map(controlHTML).join('') +
        (s.id !== 'adv' ? '<button type="button" class="linkbtn reset-sec" data-reset="' + s.id + '">' + icon('fa-rotate-left') + ' Reset this section</button>' : '') + '</div></section>';
    }).join('');
    renderPresets(); refresh();
    showGroup('title');
  }
  function allControls() { var a = []; SECTIONS.forEach(function (s) { s.controls.forEach(function (c) { if (c.p) a.push(c); }); }); return a; }
  function findCtl(path) { return allControls().filter(function (c) { return c.p === path; }); }
  function refresh() {
    var p = P();
    allControls().forEach(function (c) {
      var host = $('#designSections [data-ctl="' + c.p + '"]' + (c.group ? '[data-group="' + c.group + '"]' : ''));
      $$('#designSections [data-ctl="' + c.p + '"]').forEach(function (h) { setCtl(h, c, val(c)); });
      var vis = !c.show || c.show(p);
      $$('#designSections [data-ctl="' + c.p + '"]').forEach(function (h) { if (!h.hasAttribute('data-group')) h.hidden = !vis; });
      void host;
    });
    contrast();
  }
  function setCtl(host, c, v) {
    var id = ctlId(c);
    if (c.t === 'range') {
      var mx = typeof c.max === 'function' ? c.max(P()) : c.max, r = $('input[type=range]', host), n = $('input[type=number]', host);
      r.min = c.min; r.max = mx; n.min = c.min; n.max = mx;
      if (document.activeElement !== r) r.value = v; if (document.activeElement !== n) n.value = v;
    } else if (c.t === 'color') {
      var cp = $('input[type=color]', host), hx = $('.hex', host), six = /^#[0-9a-f]{6}$/i.test(v) ? v : expand(v);
      cp.value = six.toLowerCase(); if (document.activeElement !== hx) hx.value = String(v).toUpperCase();
    } else if (c.t === 'select' || c.t === 'font') { var s = $('select', host); s.value = String(v); if (s.value !== String(v) && c.t === 'font') { addFontOpt(s, v); s.value = v; } }
    else if (c.t === 'toggle') $('input', host).checked = !!v;
    else if (c.t === 'seg') $$('[data-v]', host).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-v') === String(v))); b.tabIndex = b.getAttribute('data-v') === String(v) ? 0 : -1; });
    else if (c.t === 'layouts') $$('[data-layout]', host).forEach(function (b) { var on = b.getAttribute('data-layout') === v; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    void id;
  }
  function addFontOpt(sel, v) { var o = document.createElement('option'); o.value = v; o.textContent = v + ' (custom)'; sel.appendChild(o); }
  function expand(v) { v = String(v || '#000000'); if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(function (c) { return c + c; }).join(''); if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7); return /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'; }
  function showGroup(g) {
    $$('#designSections [data-tg]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tg') === g)); b.tabIndex = b.getAttribute('data-tg') === g ? 0 : -1; });
    $$('#designSections [data-group]').forEach(function (h) { h.hidden = h.getAttribute('data-group') !== g; });
  }
  function ctlFromEl(el) {
    var host = el.closest('[data-ctl]'); if (!host) return null;
    var path = host.getAttribute('data-ctl'), group = host.getAttribute('data-group');
    var c = findCtl(path).filter(function (x) { return !group || x.group === group; })[0];
    return c ? { c: c, host: host } : null;
  }
  function setVal(c, v, key) {
    var r = M.rangeFor(c.p);
    if (typeof v === 'number' && r) v = Math.min(r[1], Math.max(r[0], v));
    M.setPath(P(), c.p, v);
    var structural = c.t === 'layouts' || c.t === 'toggle' || c.t === 'seg' || c.t === 'select';
    A.commit(key || ('d:' + c.p), { anim: c.p === 'layout.type' });
    if (structural || c.t === 'color') refresh(); else contrast();
  }
  function contrast() {
    var box = $('#contrastBox'); if (!box) return;
    var p = P(), t = p.design.typography, c = p.design.colors, TL = window.KTMTimeline;
    var bg = c.bgType === 'gradient' ? c.gradFrom : c.background;
    var checks = [['Titles on cards', t.title.color, c.cardBg], ['Descriptions on cards', t.description.color, c.cardBg], ['Heading on background', t.heading.color, bg],
      ['Dates', t.date.color, p.design.structure.dateStyle === 'pill' ? c.dateBg : c.cardBg], ['Links/buttons on cards', c.accent, c.cardBg]];
    var rows = checks.map(function (x) { var r = ratio(x[1], x[2]); var ok = r >= 4.5, mid = r >= 3; return '<li class="' + (ok ? 'ok' : mid ? 'mid' : 'bad') + '">' + icon(ok ? 'fa-circle-check' : 'fa-triangle-exclamation') + '<span>' + esc(x[0]) + '</span><b>' + r.toFixed(1) + ':1</b><span class="sr">' + (ok ? 'passes' : mid ? 'passes for large text only' : 'too low') + '</span></li>'; }).join('');
    box.innerHTML = '<span class="ctl-label">Contrast check (WCAG AA needs 4.5:1)</span><ul class="contrast-list">' + rows + '</ul>';
    void TL;
  }
  function L(h) { var x = parseInt(expand(h).slice(1), 16), v = [(x >> 16) & 255, (x >> 8) & 255, x & 255].map(function (n) { n /= 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
  function ratio(a, b) { var x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  /* ---------- presets ---------- */
  function renderPresets() {
    var box = $('#presetGrid');
    box.innerHTML = K.themes.list.map(function (t) {
      return '<button type="button" class="preset" data-preset="' + t.id + '" title="Apply ' + esc(t.name) + '"><span class="sw">' + t.swatch.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span><span class="pn">' + esc(t.name) + '</span></button>';
    }).join('');
    renderCustomThemes();
  }
  function renderCustomThemes() {
    var th = P().customThemes, box = $('#customThemes');
    box.innerHTML = th.length ? th.map(function (t) {
      var c = t.design.colors;
      return '<li><button type="button" class="preset sm" data-ctheme="' + esc(t.id) + '"><span class="sw"><i style="background:' + esc(c.background) + '"></i><i style="background:' + esc(c.line) + '"></i><i style="background:' + esc(c.marker) + '"></i></span><span class="pn">' + esc(t.name) + '</span></button><button type="button" class="icon-btn sm" data-cthemedel="' + esc(t.id) + '" aria-label="Delete theme ' + esc(t.name) + '">' + icon('fa-trash-can') + '</button></li>';
    }).join('') : '<li class="hint">No saved themes yet. Customise the design, then save it here to reuse it in this project.</li>';
  }

  function init(app) {
    A = app;
    render();
    var box = $('#designSections');
    box.addEventListener('click', function (e) {
      var t = e.target, el;
      if ((el = t.closest('.ds-head'))) { var open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', String(open)); $('#' + el.getAttribute('aria-controls')).hidden = !open; return; }
      if ((el = t.closest('[data-tg]'))) { showGroup(el.getAttribute('data-tg')); return; }
      if ((el = t.closest('[data-layout]'))) { var c0 = findCtl('layout.type')[0]; setVal(c0, el.getAttribute('data-layout')); U.toast('Layout: ' + el.textContent.trim() + ' — your events are unchanged', 'info', 1600); return; }
      if ((el = t.closest('.seg [data-v]'))) { var x = ctlFromEl(el); if (x) setVal(x.c, el.getAttribute('data-v')); return; }
      if ((el = t.closest('[data-reset]'))) { resetSection(el.getAttribute('data-reset')); return; }
      if ((el = t.closest('[data-action]'))) {
        var a = el.getAttribute('data-action');
        if (a === 'replay') A.replay();
        if (a === 'resetall') U.confirm({ title: 'Reset all design settings?', message: 'Layout options, typography, colours, cards, animation and spacing go back to the KTM Navy & Gold defaults. Events are not affected. You can undo this.', confirm: 'Reset design', danger: true }).then(function (ok) {
          if (!ok) return; var lt = P().layout.type; P().design = M.defaultDesign(); P().layout = M.defaultLayout(); P().layout.type = lt; A.commit('reset'); refresh(); U.toast('Design reset');
        });
      }
    });
    box.addEventListener('keydown', function (e) {
      var grp = e.target.closest('[role=radiogroup],[role=tablist]'); if (!grp || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
      var items = $$('[role=radio],[role=tab]', grp), i = items.indexOf(e.target); if (i < 0) return;
      e.preventDefault(); var n = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]; n.focus(); n.click();
    });
    box.addEventListener('input', function (e) {
      var x = ctlFromEl(e.target); if (!x) return; var c = x.c, el = e.target;
      if (c.t === 'range') { var v = parseFloat(el.value); if (!isFinite(v)) return; if (el.type === 'number') $('input[type=range]', x.host).value = v; else $('input[type=number]', x.host).value = v; setVal(c, v); }
      else if (c.t === 'color') {
        if (el.type === 'color') { $('.hex', x.host).value = el.value.toUpperCase(); setVal(c, el.value.toUpperCase()); }
        else { var hv = el.value.trim(); if (hv && hv[0] !== '#') hv = '#' + hv; var good = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hv); el.classList.toggle('bad', !good && hv.length > 1); if (good) { $('input[type=color]', x.host).value = expand(hv).toLowerCase(); setVal(c, hv.toUpperCase()); } }
      }
    });
    box.addEventListener('change', function (e) {
      var x = ctlFromEl(e.target); if (!x) return; var c = x.c, el = e.target;
      if (c.t === 'select' || c.t === 'font') setVal(c, c.num ? parseInt(el.value, 10) : el.value);
      else if (c.t === 'toggle') setVal(c, el.checked);
      else if (c.t === 'color' && el.classList.contains('hex')) { el.value = String(val(c)).toUpperCase(); el.classList.remove('bad'); }
    });
    $('#presetGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-preset]'); if (!b) return;
      K.themes.apply(P().design, b.getAttribute('data-preset')); A.commit('preset'); refresh();
      U.toast('Applied "' + K.themes.byId(b.getAttribute('data-preset')).name + '" — adjust anything below');
    });
    $('#btnSaveTheme').addEventListener('click', function () {
      U.prompt({ title: 'Save current design as a theme', label: 'Theme name', value: 'My theme ' + (P().customThemes.length + 1) }).then(function (name) {
        if (!name) return; P().customThemes.push({ id: M.uid('th'), name: name.slice(0, 60), design: M.clone(P().design) }); A.commit('theme'); renderCustomThemes(); U.toast('Theme saved in this project');
      });
    });
    $('#customThemes').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ctheme]'), d = e.target.closest('[data-cthemedel]');
      if (b) { var t = P().customThemes.filter(function (x) { return x.id === b.getAttribute('data-ctheme'); })[0]; if (t) { P().design = M.clone(t.design); A.commit('ctheme'); refresh(); U.toast('Applied "' + t.name + '"'); } }
      if (d) { var id = d.getAttribute('data-cthemedel'); P().customThemes = P().customThemes.filter(function (x) { return x.id !== id; }); A.commit('cthemedel'); renderCustomThemes(); }
    });
  }
  function resetSection(id) {
    var s = SECTIONS.filter(function (x) { return x.id === id; })[0], defP = { design: M.defaultDesign(), layout: M.defaultLayout(), meta: M.defaultProject().meta };
    s.controls.forEach(function (c) { if (c.p && c.p !== 'layout.type' && c.p !== 'meta.lang') M.setPath(P(), c.p, M.getPath(defP, c.p)); });
    if (id === 'type') ['heading', 'title', 'date', 'description'].forEach(function (g) { P().design.typography[g] = M.clone(defP.design.typography[g]); });
    A.commit('reset:' + id); refresh(); U.toast(s.title + ' reset to defaults');
  }
  K.designPanel = { init: init, refresh: refresh, renderCustomThemes: renderCustomThemes, SECTIONS: SECTIONS };
})(window.KTM = window.KTM || {});
