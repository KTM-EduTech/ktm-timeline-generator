/* KTM Timeline — left sidebar: timeline details, event manager, categories */
(function (K) {
  'use strict';
  var U = K.ui, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon, M = K.model;
  var A; // app API, set in init
  var ICONS = ['fa-star', 'fa-flag', 'fa-rocket', 'fa-lightbulb', 'fa-book', 'fa-book-open', 'fa-graduation-cap', 'fa-school', 'fa-chalkboard-user', 'fa-pencil', 'fa-pen-nib', 'fa-calculator',
    'fa-computer', 'fa-desktop', 'fa-laptop-code', 'fa-code', 'fa-microchip', 'fa-server', 'fa-robot', 'fa-brain', 'fa-mobile-screen', 'fa-wifi', 'fa-globe', 'fa-earth-asia',
    'fa-landmark', 'fa-crown', 'fa-scroll', 'fa-feather', 'fa-monument', 'fa-chess-rook', 'fa-shield-halved', 'fa-dove', 'fa-flask', 'fa-atom', 'fa-dna', 'fa-microscope',
    'fa-seedling', 'fa-leaf', 'fa-tree', 'fa-bug', 'fa-egg', 'fa-paw', 'fa-fish', 'fa-sun', 'fa-moon', 'fa-water', 'fa-mountain', 'fa-fire',
    'fa-heart', 'fa-user', 'fa-users', 'fa-baby', 'fa-person-walking', 'fa-house', 'fa-city', 'fa-building', 'fa-briefcase', 'fa-handshake', 'fa-trophy', 'fa-medal',
    'fa-award', 'fa-calendar', 'fa-clock', 'fa-hourglass-half', 'fa-map', 'fa-location-dot', 'fa-ship', 'fa-plane', 'fa-car', 'fa-train', 'fa-bolt', 'fa-gear',
    'fa-gears', 'fa-wrench', 'fa-hammer', 'fa-palette', 'fa-music', 'fa-camera', 'fa-film', 'fa-phone', 'fa-satellite', 'fa-satellite-dish', 'fa-chart-line', 'fa-circle-check',
    'fa-puzzle-piece', 'fa-language', 'fa-print', 'fa-envelope', 'fa-magnifying-glass', 'fa-comments', 'fa-gamepad', 'fa-apple-whole'];

  function P() { return A.P(); }
  function catOf(id) { return P().categories.filter(function (c) { return c.id === id; })[0]; }
  function dateText(ev) { var D = P().design.advanced; return window.KTMTimeline.formatDate(ev, D.dateFormat, D.locale) || 'No date'; }
  function findEv(id) { var a = P().events; for (var i = 0; i < a.length; i++) if (a[i].id === id) return { ev: a[i], i: i }; return null; }

  /* ---------- timeline details ---------- */
  function renderMeta() {
    var m = P().meta;
    $('#metaTitle').value = m.title; $('#metaSubtitle').value = m.subtitle; $('#metaShowHeader').checked = m.showHeader;
  }

  /* ---------- event list ---------- */
  function summaryHTML(ev) {
    var c = catOf(ev.categoryId);
    return '<span class="ev-dot" style="background:' + esc(c ? c.color : 'transparent') + (c ? '' : ';border:1px dashed var(--line-strong)') + '" title="' + esc(c ? c.name : 'No category') + '"></span>' +
      '<span class="ev-sum"><span class="ev-date">' + esc(dateText(ev)) + '</span><span class="ev-title">' + esc(ev.title || 'Untitled event') + '</span></span>' +
      (ev.highlight ? '<span class="ev-hl" title="Key milestone">' + icon('fa-star') + '<span class="sr">Key milestone</span></span>' : '');
  }
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function dateHint(ev) {
    var t = ev.date.type, p = window.KTMTimeline.parseDate;
    if (t === 'label') return ev.date.sortYear && !isFinite(parseFloat(ev.date.sortYear)) ? { bad: true, msg: 'Sort year must be a number, e.g. 1905 or -500.' } : { msg: 'Shown exactly as typed. Add a sort year so chronological sorting knows where it belongs.' };
    if (!ev.date.start) return { msg: t === 'date' ? 'Use YYYY-MM-DD, YYYY-MM or YYYY. Use a minus sign for BCE (e.g. -500).' : 'Use a year, e.g. 1969 or -500 for 500 BCE.' };
    if (!p(ev.date.start)) return { bad: true, msg: 'Not a recognised date. Use YYYY, YYYY-MM or YYYY-MM-DD.' };
    if (t === 'range' && ev.date.end && !p(ev.date.end)) return { bad: true, msg: 'End is not a recognised date. Leave it empty to show "present".' };
    return { msg: 'Shows as: ' + dateText(ev) };
  }
  function formHTML(ev) {
    var id = esc(ev.id), d = ev.date, t = d.type, cats = P().categories, hint = dateHint(ev), ic = window.KTMTimeline.safeUrl ? ev.icon : '';
    var f = function (key) { return 'id="f-' + id + '-' + key.replace(/\./g, '-') + '" data-f="' + key + '"'; };
    var L = function (key, label) { return '<label for="f-' + id + '-' + key.replace(/\./g, '-') + '">' + label + '</label>'; };
    var img = ev.image.url, isData = /^data:/.test(img);
    return '<div class="ev-form" id="evf-' + id + '" hidden>' +
      '<div class="grid2"><div class="field">' + L('date.type', 'Date type') + '<select class="input" ' + f('date.type') + '>' + opt('year', 'Year', t) + opt('date', 'Full date', t) + opt('range', 'Date range', t) + opt('label', 'Custom label', t) + '</select></div>' +
      '<div class="field" data-when="year date range">' + L('date.start', t === 'range' ? 'From' : t === 'date' ? 'Date' : 'Year') + '<input class="input" ' + f('date.start') + ' value="' + esc(d.start) + '" placeholder="' + (t === 'date' ? '1946-02-14' : '1969') + '" inputmode="numeric" autocomplete="off"></div>' +
      '<div class="field" data-when="label">' + L('date.label', 'Label') + '<input class="input" ' + f('date.label') + ' value="' + esc(d.label) + '" placeholder="Early 1900s"></div></div>' +
      '<div class="grid2"><div class="field" data-when="range">' + L('date.end', 'To (empty = present)') + '<input class="input" ' + f('date.end') + ' value="' + esc(d.end) + '" placeholder="1991" autocomplete="off"></div>' +
      '<div class="field" data-when="label">' + L('date.sortYear', 'Sort year (optional)') + '<input class="input" ' + f('date.sortYear') + ' value="' + esc(d.sortYear) + '" placeholder="1900" inputmode="decimal"></div></div>' +
      '<p class="hint' + (hint.bad ? ' bad' : '') + '" data-hint="date" aria-live="polite">' + esc(hint.msg) + '</p>' +
      '<div class="field">' + L('title', 'Title') + '<input class="input" ' + f('title') + ' value="' + esc(ev.title) + '" maxlength="300"></div>' +
      '<div class="field">' + L('description', 'Description') + '<textarea class="input" rows="4" ' + f('description') + ' maxlength="20000">' + esc(ev.description) + '</textarea><p class="hint">Leave a blank line between paragraphs.</p></div>' +
      '<div class="grid2"><div class="field">' + L('categoryId', 'Category') + '<select class="input" ' + f('categoryId') + '>' + opt('', 'None', ev.categoryId) + cats.map(function (c) { return opt(c.id, c.name, ev.categoryId); }).join('') + '</select></div>' +
      '<div class="field">' + L('icon', 'Icon') + '<div class="icon-field"><span class="icon-prev" aria-hidden="true"><i class="' + esc(ic) + '"></i></span><input class="input" ' + f('icon') + ' value="' + esc(ev.icon) + '" placeholder="fa-solid fa-star" autocomplete="off"><button type="button" class="icon-btn" data-act="icons" aria-label="Choose an icon">' + icon('fa-icons') + '</button></div></div></div>' +
      '<label class="check"><input type="checkbox" ' + f('highlight') + (ev.highlight ? ' checked' : '') + '><span>Highlight as a key milestone</span></label>' +
      '<details class="sub"' + (img ? ' open' : '') + '><summary>' + icon('fa-image') + ' Image</summary>' +
      '<div class="field">' + L('image.url', 'Image URL') + '<div class="row"><input class="input" ' + f('image.url') + ' value="' + esc(isData ? '' : img) + '" placeholder="' + (isData ? 'Uploaded image in use' : 'https://…/photo.jpg') + '" autocomplete="off"><button type="button" class="btn ghost sm" data-act="upload">' + icon('fa-upload') + '<span>Upload</span></button></div>' +
      (isData ? '<p class="hint">Uploaded image stored in this project (' + U.fmtBytes(Math.round(img.length * 0.75)) + '). <button type="button" class="linkbtn" data-act="clearimg">Remove</button></p>' : '') + '</div>' +
      '<div class="field">' + L('image.alt', 'Alternative text (describe the image)') + '<input class="input" ' + f('image.alt') + ' value="' + esc(ev.image.alt) + '"></div>' +
      '<div class="field">' + L('image.caption', 'Caption') + '<input class="input" ' + f('image.caption') + ' value="' + esc(ev.image.caption) + '"></div>' + (img && !ev.image.alt ? '<p class="hint bad">Add alternative text so screen-reader users know what the image shows.</p>' : '') + '</details>' +
      '<details class="sub"' + (ev.media.type !== 'none' ? ' open' : '') + '><summary>' + icon('fa-photo-film') + ' Video or audio</summary>' +
      '<div class="field">' + L('media.type', 'Media type') + '<select class="input" ' + f('media.type') + '>' + opt('none', 'None', ev.media.type) + opt('youtube', 'YouTube video', ev.media.type) + opt('audio', 'Audio file link (MP3, OGG…)', ev.media.type) + '</select></div>' +
      '<div class="field" data-media>' + L('media.url', ev.media.type === 'youtube' ? 'YouTube link' : 'Audio URL') + '<input class="input" ' + f('media.url') + ' value="' + esc(ev.media.url) + '" placeholder="https://…" autocomplete="off"></div>' +
      '<div class="field" data-media>' + L('media.caption', 'Media caption') + '<input class="input" ' + f('media.caption') + ' value="' + esc(ev.media.caption) + '"></div>' +
      '<p class="hint" data-hint="media"></p></details>' +
      '<details class="sub"' + (ev.link.url ? ' open' : '') + '><summary>' + icon('fa-link') + ' External link</summary>' +
      '<div class="field">' + L('link.url', 'Link URL') + '<input class="input" ' + f('link.url') + ' value="' + esc(ev.link.url) + '" placeholder="https://…" autocomplete="off"></div>' +
      '<div class="field">' + L('link.label', 'Link label') + '<input class="input" ' + f('link.label') + ' value="' + esc(ev.link.label) + '" placeholder="Learn more"></div></details>' +
      '<div class="ev-actions"><button type="button" class="btn ghost sm" data-act="up">' + icon('fa-arrow-up') + '<span>Up</span></button><button type="button" class="btn ghost sm" data-act="down">' + icon('fa-arrow-down') + '<span>Down</span></button>' +
      '<button type="button" class="btn ghost sm" data-act="dup">' + icon('fa-clone') + '<span>Duplicate</span></button><button type="button" class="btn danger-ghost sm" data-act="del">' + icon('fa-trash-can') + '<span>Delete</span></button></div></div>';
  }
  function syncFormVisibility(li, ev) {
    $$('[data-when]', li).forEach(function (el) { el.hidden = el.getAttribute('data-when').split(' ').indexOf(ev.date.type) < 0; });
    $$('[data-media]', li).forEach(function (el) { el.hidden = ev.media.type === 'none'; });
    var mh = $('[data-hint="media"]', li);
    if (mh) {
      var msg = '', bad = false;
      if (ev.media.type === 'youtube' && ev.media.url) { if (window.KTMTimeline.youtubeId(ev.media.url)) msg = 'Video found.'; else { msg = 'This does not look like a YouTube link.'; bad = true; } }
      if (ev.media.type === 'audio' && ev.media.url && !/^https?:\/\//i.test(ev.media.url)) { msg = 'Use a full https:// link to the audio file.'; bad = true; }
      mh.textContent = msg; mh.classList.toggle('bad', bad); mh.hidden = !msg;
    }
    var lab = $('label[for="f-' + ev.id + '-date-start"]', li); if (lab) lab.textContent = ev.date.type === 'range' ? 'From' : ev.date.type === 'date' ? 'Date' : 'Year';
  }
  function rowHTML(ev, open) {
    return '<li class="ev' + (open ? ' is-open' : '') + (A.state.selected === ev.id ? ' is-sel' : '') + '" data-id="' + esc(ev.id) + '">' +
      '<div class="ev-head" draggable="true"><span class="ev-grip" title="Drag to reorder" aria-hidden="true">' + icon('fa-grip-vertical') + '</span>' +
      '<button type="button" class="ev-toggle" aria-expanded="' + !!open + '" aria-controls="evf-' + esc(ev.id) + '" aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown">' + summaryHTML(ev) + '<span class="ev-chev">' + icon('fa-chevron-down') + '</span></button></div>' +
      formHTML(ev) + '</li>';
  }
  function renderList() {
    var list = $('#eventList'), evs = P().events, open = A.state.openRows, q = A.state.listQuery.trim().toLowerCase();
    list.innerHTML = evs.map(function (ev) { return rowHTML(ev, open[ev.id]); }).join('');
    $$('li.ev', list).forEach(function (li) {
      var f = findEv(li.getAttribute('data-id')), ev = f.ev;
      if (open[ev.id]) $('.ev-form', li).hidden = false;
      syncFormVisibility(li, ev);
      if (q) li.hidden = (ev.title + ' ' + ev.description + ' ' + dateText(ev)).toLowerCase().indexOf(q) < 0;
    });
    updateCount();
    $('#eventsEmpty').hidden = evs.length > 0;
  }
  function updateCount() {
    var n = P().events.length, shown = $$('#eventList li.ev:not([hidden])').length;
    $('#eventCount').textContent = A.state.listQuery ? shown + ' of ' + n : String(n);
    $('#eventCount').setAttribute('aria-label', (A.state.listQuery ? shown + ' of ' : '') + n + (n === 1 ? ' event' : ' events'));
  }
  function updateRow(id) {
    var li = $('#eventList li[data-id="' + id + '"]'), f = findEv(id); if (!li || !f) return;
    $('.ev-toggle', li).innerHTML = summaryHTML(f.ev) + '<span class="ev-chev">' + icon('fa-chevron-down') + '</span>';
    var hint = dateHint(f.ev), he = $('[data-hint="date"]', li); if (he) { he.textContent = hint.msg; he.classList.toggle('bad', !!hint.bad); }
    syncFormVisibility(li, f.ev);
  }
  function setOpen(id, open, focusForm) {
    var li = $('#eventList li[data-id="' + id + '"]'); if (!li) return;
    A.state.openRows[id] = open;
    li.classList.toggle('is-open', open); $('.ev-form', li).hidden = !open; $('.ev-toggle', li).setAttribute('aria-expanded', String(open));
    if (open && focusForm) { var t = $('[data-f="title"]', li); if (t) { t.focus(); t.select(); } }
  }
  function select(id, scroll) {
    A.state.selected = id;
    $$('#eventList li.ev').forEach(function (li) { li.classList.toggle('is-sel', li.getAttribute('data-id') === id); });
    var li = $('#eventList li[data-id="' + id + '"]');
    if (li) { setOpen(id, true); if (scroll) li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
  function move(id, delta) {
    var a = P().events, f = findEv(id); if (!f) return;
    var j = f.i + delta; if (j < 0 || j >= a.length) return;
    a.splice(f.i, 1); a.splice(j, 0, f.ev);
    A.commit('move', { list: true });
    var btn = $('#eventList li[data-id="' + id + '"] .ev-toggle'); if (btn) btn.focus();
    U.toast('Moved to position ' + (j + 1) + ' of ' + a.length, 'info', 1500);
  }
  function addEvent() {
    var a = P().events, last = a[a.length - 1];
    var ev = M.createEvent({ date: { type: last && last.date.type === 'date' ? 'date' : 'year', start: '' } });
    var ref = A.state.selected ? findEv(A.state.selected) : null;
    if (ref) a.splice(ref.i + 1, 0, ev); else a.push(ev);
    A.state.openRows[ev.id] = true; A.state.selected = ev.id;
    A.state.listQuery = ''; $('#eventSearch').value = '';
    A.commit('add', { list: true });
    setOpen(ev.id, true, true);
    var li = $('#eventList li[data-id="' + ev.id + '"]'); if (li) li.scrollIntoView({ block: 'nearest' });
    A.showPanel('events');
  }
  function dupEvent(id) {
    var f = findEv(id); if (!f) return;
    var c = M.clone(f.ev); c.id = M.uid('ev'); c.title = (c.title || 'Event') + ' (copy)';
    P().events.splice(f.i + 1, 0, c); A.state.openRows[c.id] = true; A.state.selected = c.id;
    A.commit('dup', { list: true }); setOpen(c.id, true, true); U.toast('Event duplicated');
  }
  function delEvent(id) {
    var f = findEv(id); if (!f) return;
    U.confirm({ title: 'Delete this event?', message: '"' + (f.ev.title || 'Untitled event') + '" will be removed. You can undo this with Ctrl+Z.', confirm: 'Delete event', danger: true }).then(function (ok) {
      if (!ok) return;
      P().events.splice(f.i, 1); delete A.state.openRows[id]; if (A.state.selected === id) A.state.selected = null;
      A.commit('del', { list: true }); U.toast('Event deleted — Undo is available');
      var next = $$('#eventList .ev-toggle')[Math.min(f.i, P().events.length - 1)]; if (next) next.focus(); else $('#btnAddEvent').focus();
    });
  }
  function sortEvents(kind) {
    var a = P().events, TL = window.KTMTimeline, cats = P().categories.map(function (c) { return c.id; });
    var idx = {}; a.forEach(function (e, i) { idx[e.id] = i; });
    var key = function (e) { var k = TL.sortKey(e); return k === Infinity ? 1e12 : k; };
    var by = {
      'chrono': function (x, y) { return key(x) - key(y) || idx[x.id] - idx[y.id]; },
      'chrono-desc': function (x, y) { return key(y) - key(x) || idx[x.id] - idx[y.id]; },
      'category': function (x, y) { var cx = cats.indexOf(x.categoryId), cy = cats.indexOf(y.categoryId); cx = cx < 0 ? 999 : cx; cy = cy < 0 ? 999 : cy; return cx - cy || key(x) - key(y) || idx[x.id] - idx[y.id]; },
      'title': function (x, y) { return String(x.title).localeCompare(String(y.title)) || idx[x.id] - idx[y.id]; }
    }[kind];
    if (!by) return;
    var undated = a.filter(function (e) { return TL.sortKey(e) === Infinity; }).length;
    a.sort(by); A.commit('sort', { list: true });
    U.toast({ chrono: 'Sorted oldest first', 'chrono-desc': 'Sorted newest first', category: 'Grouped by category', title: 'Sorted A–Z' }[kind] + (undated && kind.indexOf('chrono') === 0 ? ' — ' + undated + ' event(s) without a sortable date placed last' : ''));
  }
  function setField(ev, path, el) {
    var v = el.type === 'checkbox' ? el.checked : el.value;
    if (path === 'image.url') { v = String(v).trim(); if (v && !M.imageUrl(v)) { el.classList.add('bad'); return false; } el.classList.remove('bad'); }
    if (path === 'link.url' || path === 'media.url') { v = String(v).trim(); if (v && !M.linkUrl(v)) { el.classList.add('bad'); return false; } el.classList.remove('bad'); }
    if (path === 'icon') { v = String(v).trim(); if (/^fa-[a-z0-9-]+$/i.test(v)) v = 'fa-solid ' + v; if (!/^[a-z0-9 \-]{0,80}$/i.test(v)) { el.classList.add('bad'); return false; } el.classList.remove('bad'); }
    M.setPath(ev, path, v); return true;
  }

  /* ---------- image upload ---------- */
  function uploadImage(id) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/gif,image/webp';
    inp.addEventListener('change', function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) { U.toast('Choose a PNG, JPEG, GIF or WebP image.', 'error'); return; }
      if (file.size > 15 * 1024 * 1024) { U.toast('That image is larger than 15 MB. Choose a smaller image.', 'error'); return; }
      readAsDataURL(file).then(function (url) { return file.type === 'image/gif' && file.size < 600 * 1024 ? url : downscale(url, file.type); }).then(function (url) {
        var f = findEv(id); if (!f) return;
        f.ev.image.url = url; if (!f.ev.image.alt) f.ev.image.alt = '';
        A.commit('img', { list: true }); setOpen(id, true);
        var kb = Math.round(url.length * 0.75 / 1024);
        U.toast('Image added (' + kb + ' KB).' + (kb > 700 ? ' Large images fill browser storage quickly — consider an image URL.' : ''), kb > 700 ? 'warn' : 'info');
      }).catch(function () { U.toast('That image could not be read.', 'error'); });
    });
    inp.click();
  }
  function readAsDataURL(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(file); }); }
  function downscale(url, type) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () {
        var max = 1600, w = im.naturalWidth, h = im.naturalHeight, s = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * s); cv.height = Math.round(h * s);
        var cx = cv.getContext('2d'); cx.drawImage(im, 0, 0, cv.width, cv.height);
        var out = type === 'image/png' ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.85);
        if (type === 'image/png' && out.length > 900 * 1024) { var jpg = cv.toDataURL('image/webp', 0.86); if (/^data:image\/webp/.test(jpg) && jpg.length < out.length) out = jpg; }
        res(out.length < url.length || s < 1 ? out : url);
      };
      im.onerror = rej; im.src = url;
    });
  }
  function iconPicker(id) {
    var f = findEv(id); if (!f) return;
    var cur = f.ev.icon;
    var body = U.h('<div><div class="field"><label for="ipSearch">Search icons</label><input id="ipSearch" class="input" placeholder="e.g. book, flag, rocket" autocomplete="off"></div><div class="icon-grid" role="listbox" aria-label="Icons"></div><p class="hint">Any free <a href="https://fontawesome.com/search?o=r&m=free&s=solid" target="_blank" rel="noopener">Font Awesome 6 icon</a> works — type its class name (for example <code>fa-solid fa-bicycle</code>) in the icon box.</p><div class="row"><button type="button" class="btn ghost sm" data-none>No icon</button></div></div>');
    var grid = $('.icon-grid', body);
    function draw(q) {
      grid.innerHTML = ICONS.filter(function (n) { return !q || n.indexOf(q.toLowerCase().replace(/\s+/g, '-')) > -1; }).map(function (n) {
        var cls = 'fa-solid ' + n;
        return '<button type="button" class="icon-cell' + (cls === cur ? ' is-cur' : '') + '" role="option" aria-selected="' + (cls === cur) + '" data-icon="' + cls + '" title="' + n.replace('fa-', '') + '"><i class="' + cls + '" aria-hidden="true"></i><span class="sr">' + n.replace('fa-', '').replace(/-/g, ' ') + '</span></button>';
      }).join('') || '<p class="hint">No matches in this short list — type the class name directly.</p>';
    }
    draw('');
    var d = U.dialog({ title: 'Choose an icon', body: body, initialFocus: '#ipSearch' });
    $('#ipSearch', body).addEventListener('input', function (e) { draw(e.target.value.trim()); });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-icon]'), none = e.target.closest('[data-none]');
      if (!b && !none) return;
      f.ev.icon = b ? b.getAttribute('data-icon') : '';
      A.commit('icon', { list: true }); d.close(); setOpen(id, true);
      var inp = $('#f-' + id + '-icon'); if (inp) inp.focus();
    });
  }

  /* ---------- categories ---------- */
  var CAT_COLORS = ['#232450', '#2563EB', '#16A34A', '#EE6C4D', '#9333EA', '#C9A227', '#0891B2', '#DB2777'];
  function renderCats() {
    var cats = P().categories, box = $('#catList');
    box.innerHTML = cats.map(function (c) {
      var n = P().events.filter(function (e) { return e.categoryId === c.id; }).length;
      return '<li class="cat" data-cat="' + esc(c.id) + '"><input type="color" class="swatch" value="' + esc(c.color) + '" aria-label="Colour for ' + esc(c.name) + '"><label class="sr" for="cn-' + esc(c.id) + '">Category name</label><input id="cn-' + esc(c.id) + '" class="input sm" value="' + esc(c.name) + '" maxlength="60"><span class="cat-n" title="Events in this category">' + n + '</span><button type="button" class="icon-btn sm" data-catdel aria-label="Delete category ' + esc(c.name) + '">' + icon('fa-trash-can') + '</button></li>';
    }).join('');
    $('#catEmpty').hidden = cats.length > 0;
  }
  function addCat() {
    var cats = P().categories, c = { id: M.uid('cat'), name: 'Category ' + (cats.length + 1), color: CAT_COLORS[cats.length % CAT_COLORS.length] };
    cats.push(c); A.commit('cat', { list: true }); renderCats();
    var inp = $('#cn-' + c.id); if (inp) { inp.focus(); inp.select(); }
  }

  function bindDnD(list) {
    var dragId = null;
    list.addEventListener('dragstart', function (e) {
      var li = e.target.closest && e.target.closest('li.ev');
      if (!li || e.target.closest('.ev-form')) { if (li) e.preventDefault(); return; }
      dragId = li.getAttribute('data-id'); li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (x) { }
    });
    list.addEventListener('dragover', function (e) {
      if (!dragId) return; e.preventDefault();
      var li = e.target.closest('li.ev'); $$('li.ev', list).forEach(function (x) { x.classList.remove('drop-before', 'drop-after'); });
      if (!li || li.getAttribute('data-id') === dragId) return;
      var r = li.getBoundingClientRect(); li.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-before' : 'drop-after');
    });
    list.addEventListener('drop', function (e) {
      if (!dragId) return; e.preventDefault();
      var li = e.target.closest('li.ev'), a = P().events, from = findEv(dragId);
      $$('li.ev', list).forEach(function (x) { x.classList.remove('drop-before', 'drop-after', 'dragging'); });
      if (!li || !from || li.getAttribute('data-id') === dragId) { dragId = null; return; }
      var r = li.getBoundingClientRect(), after = e.clientY >= r.top + r.height / 2;
      a.splice(from.i, 1);
      var to = findEv(li.getAttribute('data-id')).i + (after ? 1 : 0);
      a.splice(to, 0, from.ev); dragId = null;
      A.commit('move', { list: true });
    });
    list.addEventListener('dragend', function () { dragId = null; $$('li.ev', list).forEach(function (x) { x.classList.remove('drop-before', 'drop-after', 'dragging'); }); });
  }

  function init(app) {
    A = app;
    var list = $('#eventList');
    ['metaTitle', 'metaSubtitle'].forEach(function (id) {
      $('#' + id).addEventListener('input', function (e) { P().meta[id === 'metaTitle' ? 'title' : 'subtitle'] = e.target.value; A.commit('meta:' + id); });
    });
    $('#metaShowHeader').addEventListener('change', function (e) { P().meta.showHeader = e.target.checked; A.commit('meta:hdr'); });
    $('#btnAddEvent').addEventListener('click', addEvent);
    $('#btnAddEvent2').addEventListener('click', addEvent);
    $('#eventSearch').addEventListener('input', function (e) {
      A.state.listQuery = e.target.value; var q = e.target.value.trim().toLowerCase();
      $$('li.ev', list).forEach(function (li) { var f = findEv(li.getAttribute('data-id')); li.hidden = !!q && (f.ev.title + ' ' + f.ev.description + ' ' + dateText(f.ev)).toLowerCase().indexOf(q) < 0; });
      updateCount();
    });
    $('#sortSelect').addEventListener('change', function (e) { var v = e.target.value; e.target.value = ''; if (v) sortEvents(v); });
    $('#btnExpandAll').addEventListener('click', function () { $$('li.ev', list).forEach(function (li) { setOpen(li.getAttribute('data-id'), true); }); });
    $('#btnCollapseAll').addEventListener('click', function () { $$('li.ev', list).forEach(function (li) { setOpen(li.getAttribute('data-id'), false); }); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li.ev'); if (!li) return; var id = li.getAttribute('data-id');
      var tg = e.target.closest('.ev-toggle');
      if (tg) { var open = tg.getAttribute('aria-expanded') !== 'true'; setOpen(id, open); A.state.selected = id; $$('li.ev', list).forEach(function (x) { x.classList.toggle('is-sel', x === li); }); A.focusPreview(id); return; }
      var act = e.target.closest('[data-act]'); if (!act) return;
      var a = act.getAttribute('data-act');
      if (a === 'up') move(id, -1); else if (a === 'down') move(id, 1); else if (a === 'dup') dupEvent(id); else if (a === 'del') delEvent(id);
      else if (a === 'upload') uploadImage(id); else if (a === 'icons') iconPicker(id);
      else if (a === 'clearimg') { findEv(id).ev.image.url = ''; A.commit('img', { list: true }); }
    });
    list.addEventListener('keydown', function (e) {
      var tg = e.target.closest('.ev-toggle'); if (!tg || !e.altKey) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); move(tg.closest('li.ev').getAttribute('data-id'), e.key === 'ArrowUp' ? -1 : 1); }
    });
    function onField(e) {
      var el = e.target, path = el.getAttribute('data-f'); if (!path) return;
      var li = el.closest('li.ev'), f = findEv(li.getAttribute('data-id')); if (!f) return;
      if (!setField(f.ev, path, el)) return;
      if (path === 'icon') { var pv = $('.icon-prev i', li); if (pv) pv.className = f.ev.icon; }
      A.commit('ev:' + f.ev.id + ':' + path);
      updateRow(f.ev.id);
      if (path === 'categoryId') renderCats();
      if (path === 'image.url' || path === 'media.type') { /* re-render form section labels */ var lab = $('label[for="f-' + f.ev.id + '-media-url"]', li); if (lab) lab.textContent = f.ev.media.type === 'youtube' ? 'YouTube link' : 'Audio URL'; }
    }
    list.addEventListener('input', onField);
    list.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') onField(e); });
    bindDnD(list);
    $('#btnAddCat').addEventListener('click', addCat);
    $('#catList').addEventListener('input', function (e) {
      var li = e.target.closest('li.cat'); if (!li) return;
      var c = P().categories.filter(function (x) { return x.id === li.getAttribute('data-cat'); })[0]; if (!c) return;
      if (e.target.type === 'color') c.color = e.target.value; else c.name = e.target.value.slice(0, 60) || 'Category';
      A.commit('cat:' + c.id + ':' + e.target.type);
      $$('#eventList select[data-f="categoryId"] option[value="' + c.id + '"]').forEach(function (o) { o.textContent = c.name; });
      P().events.forEach(function (ev) { if (ev.categoryId === c.id) updateRow(ev.id); });
    });
    $('#catList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-catdel]'); if (!b) return;
      var id = b.closest('li.cat').getAttribute('data-cat'), c = P().categories.filter(function (x) { return x.id === id; })[0];
      var n = P().events.filter(function (ev) { return ev.categoryId === id; }).length;
      U.confirm({ title: 'Delete category?', message: '"' + c.name + '" will be removed.' + (n ? ' ' + n + ' event(s) will keep their content but have no category.' : ''), confirm: 'Delete category', danger: true }).then(function (ok) {
        if (!ok) return;
        P().categories = P().categories.filter(function (x) { return x.id !== id; });
        P().events.forEach(function (ev) { if (ev.categoryId === id) ev.categoryId = ''; });
        A.commit('catdel', { list: true }); renderCats();
      });
    });
  }
  K.eventsPanel = { init: init, renderList: renderList, renderMeta: renderMeta, renderCats: renderCats, select: select, addEvent: addEvent, sortEvents: sortEvents, move: move, dupEvent: dupEvent, findEv: findEv };
})(window.KTM = window.KTM || {});
