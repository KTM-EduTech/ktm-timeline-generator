/* KTM Timeline — application controller: state, history, autosave, preview, shortcuts */
(function (K) {
  'use strict';
  var U = K.ui, $ = U.$, $$ = U.$$, M = K.model, X = K.exporter;
  var S = { P: null, hist: new K.History(120), selected: null, openRows: {}, listQuery: '', device: 'desktop', zoom: 'fit', frameReady: false, saveT: 0, prevT: 0, dirty: false, prefs: {} };
  var DEV = { desktop: 1280, tablet: 820, mobile: 390 };

  function app() { return API; }
  var API = {
    P: function () { return S.P; }, state: S,
    commit: commit, replay: replay, focusPreview: focusPreview, showPanel: showPanel, openProject: openProject, replaceProject: replaceProject,
    flushSave: flushSave, importJSON: importJSON, restoreLast: function () { }, suggestHeight: suggestHeight,
    prefs: function (p) { if (p) { Object.assign(S.prefs, p); K.store.prefs(S.prefs); } return S.prefs; }
  };

  /* ---------- state changes ---------- */
  function commit(key, o) {
    o = o || {};
    S.P.updatedAt = new Date().toISOString();
    S.P.events.forEach(function (e, i) { e.order = i; });
    S.hist.push(JSON.stringify(S.P), key);
    updateUndo(); syncQuick();
    if (o.list) { K.eventsPanel.renderList(); K.eventsPanel.renderCats(); }
    schedulePreview(o.anim);
    scheduleSave();
  }
  function restore(snap) {
    var keepOpen = S.openRows;
    S.P = JSON.parse(snap); S.openRows = keepOpen;
    refreshAll(); scheduleSave(); updateUndo();
  }
  function refreshAll() {
    $('#projName').value = S.P.name;
    K.eventsPanel.renderMeta(); K.eventsPanel.renderList(); K.eventsPanel.renderCats();
    K.designPanel.refresh(); K.designPanel.renderCustomThemes(); syncQuick();
    pushPreview(false);
  }
  function syncQuick() { var q = $('#layoutQuick'); if (q && S.P) q.value = S.P.layout.type; }
  function undo() { var s = S.hist.undo(); if (s) { restore(s); U.toast('Undone', 'info', 1000); } }
  function redo() { var s = S.hist.redo(); if (s) { restore(s); U.toast('Redone', 'info', 1000); } }
  function updateUndo() { $('#btnUndo').disabled = !S.hist.canUndo(); $('#btnRedo').disabled = !S.hist.canRedo(); }

  /* ---------- saving ---------- */
  function setStatus(kind, text) { var el = $('#saveStatus'); el.className = 'save-status ' + kind; el.innerHTML = U.icon(kind === 'saving' ? 'fa-circle-notch fa-spin' : kind === 'error' ? 'fa-triangle-exclamation' : kind === 'local' ? 'fa-hard-drive' : 'fa-circle-check') + '<span></span>'; $('span', el).textContent = text; }
  function scheduleSave() {
    S.dirty = true; setStatus('saving', 'Saving…');
    clearTimeout(S.saveT); S.saveT = setTimeout(flushSave, 900);
  }
  function flushSave() {
    clearTimeout(S.saveT); if (!S.P) return;
    if (!S.dirty && K.store.list().some(function (x) { return x.id === S.P.id; })) return;
    var r = K.store.save(S.P); S.dirty = !r.ok;
    if (r.ok) setStatus('ok', 'Saved in this browser');
    else { setStatus('error', K.store.available ? 'Not saved' : 'Storage off'); if (!S.warned || r.quota) { U.toast(r.error, 'error', 9000); S.warned = true; } }
  }

  /* ---------- preview ---------- */
  function buildFrame() {
    var fr = $('#previewFrame'); S.frameReady = false;
    fr.onload = function () { S.frameReady = true; pushPreview(true); };
    fr.srcdoc = X.buildDocument(S.P, { mode: 'preview' });
  }
  function schedulePreview(anim) { clearTimeout(S.prevT); S.prevT = setTimeout(function () { pushPreview(anim); }, 60); }
  function pushPreview(anim) {
    if (!S.frameReady) return;
    var win = $('#previewFrame').contentWindow;
    try {
      var root = win.document.getElementById('ktm-timeline');
      win.KTMTimeline.mount(root, JSON.stringify(S.P), { noAnim: !anim, onSelect: onPreviewSelect });
      if (S.selected) mark(S.selected);
    } catch (e) { console.error(e); U.toast('Preview error: ' + e.message, 'error'); }
  }
  function onPreviewSelect(id) { S.selected = id; K.eventsPanel.select(id, true); mark(id); if (window.innerWidth < 760) showPanel('events'); }
  function mark(id) {
    try {
      var d = $('#previewFrame').contentWindow.document;
      d.querySelectorAll('.ktm-tl__item.is-editing').forEach(function (x) { x.classList.remove('is-editing'); });
      var li = d.querySelector('.ktm-tl__item[data-id="' + id + '"]'); if (li) li.classList.add('is-editing');
      return li;
    } catch (e) { return null; }
  }
  function focusPreview(id) { var li = mark(id); if (li && li.scrollIntoView) { li.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); } }
  function replay() {
    try { $('#previewFrame').contentWindow.scrollTo(0, 0); } catch (e) { }
    pushPreview(true);
  }
  function layoutStage() {
    var stage = $('#stage'), wrap = $('#frameWrap'), fr = $('#previewFrame');
    var sw = stage.clientWidth - 24, sh = stage.clientHeight - 24, dw = DEV[S.device];
    if (sw <= 0 || sh <= 0) return;
    var scale = S.zoom === 'fit' ? Math.min(1, sw / dw) : S.zoom;
    fr.style.width = dw + 'px'; fr.style.height = Math.round(sh / scale) + 'px'; fr.style.transform = 'scale(' + scale + ')';
    wrap.style.width = Math.round(dw * scale) + 'px'; wrap.style.height = Math.round(sh) + 'px';
    wrap.className = 'frame-wrap dev-' + S.device;
    $('#zoomLabel').textContent = Math.round(scale * 100) + '%' + (S.zoom === 'fit' ? ' (fit)' : '');
    $$('[data-device]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-device') === S.device)); });
    $('#deviceInfo').textContent = dw + ' px wide';
  }
  function setZoom(z) {
    var cur = S.zoom === 'fit' ? parseFloat($('#zoomLabel').textContent) / 100 : S.zoom;
    if (z === 'in') S.zoom = Math.min(1.5, Math.round((cur + 0.1) * 10) / 10);
    else if (z === 'out') S.zoom = Math.max(0.3, Math.round((cur - 0.1) * 10) / 10);
    else S.zoom = 'fit';
    layoutStage();
  }
  function suggestHeight() {
    try {
      var d = $('#previewFrame').contentWindow.document, root = d.getElementById('ktm-timeline');
      var h = root ? root.scrollHeight : 900;
      return Math.max(400, Math.min(2400, Math.ceil(h / 50) * 50));
    } catch (e) { return 900; }
  }

  /* ---------- projects ---------- */
  function openProject(p, quiet) {
    if (S.P && S.dirty) flushSave();
    S.P = p; S.openRows = {}; S.selected = null; S.listQuery = ''; $('#eventSearch').value = '';
    S.hist.reset(JSON.stringify(S.P)); updateUndo();
    refreshAll(); buildFrame(); S.dirty = true; flushSave();
    if (!quiet) { }
  }
  function replaceProject(p) { S.P = p; commit('replace', { list: true }); refreshAll(); buildFrame(); }
  function importJSON() {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > 25 * 1024 * 1024) { U.toast('That file is larger than 25 MB and was not opened.', 'error'); return; }
      var r = new FileReader();
      r.onload = function () {
        var raw;
        try { raw = JSON.parse(r.result); } catch (e) { U.toast('That file is not valid JSON: ' + e.message, 'error', 9000); return; }
        var p;
        try { p = M.validate(raw); } catch (e) { U.toast(e.message, 'error', 9000); return; }
        var exists = K.store.list().some(function (x) { return x.id === p.id; });
        var go = function (asNew) {
          if (asNew) { p.id = M.uid('tl'); if (exists) p.name += ' (imported)'; }
          flushSave(); openProject(p, true);
          var dropped = (Array.isArray(raw.events) ? raw.events.length : 0) - p.events.length;
          U.toast('Imported "' + p.name + '" — ' + p.events.length + ' events' + (dropped > 0 ? ' (' + dropped + ' over the limit were skipped)' : ''));
        };
        if (!exists) { go(false); return; }
        U.dialog({ title: 'This project is already saved here', body: '<p class="dlg-msg">A project with the same ID ("' + U.esc(p.name) + '") is already in this browser. Open the imported file as a separate copy, or replace the saved version?</p>',
          actions: [{ label: 'Cancel' }, { label: 'Replace saved version', danger: true, onClick: function () { go(false); } }, { label: 'Open as a copy', primary: true, onClick: function () { go(true); } }] });
      };
      r.onerror = function () { U.toast('The file could not be read.', 'error'); };
      r.readAsText(f);
    });
    inp.click();
  }

  /* ---------- panels (tablet/mobile) ---------- */
  function showPanel(name) {
    document.body.setAttribute('data-panel', name);
    $$('.mtab').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-panel') === name)); });
    setTimeout(layoutStage, 30);
  }
  function setAppTheme(t) {
    document.documentElement.setAttribute('data-app-theme', t);
    var b = $('#btnAppTheme'); b.innerHTML = U.icon(t === 'dark' ? 'fa-sun' : 'fa-moon'); b.setAttribute('aria-label', t === 'dark' ? 'Switch editor to light theme' : 'Switch editor to dark theme');
    API.prefs({ appTheme: t });
  }

  function init() {
    S.prefs = K.store.prefs() || {};
    if (window.innerWidth < 760) S.device = 'mobile';
    K.eventsPanel.init(API); K.dialogs.init(API);
    var last = K.store.lastId(), p = last ? K.store.load(last) : null;
    if (!p) { var l = K.store.list(); if (l.length) p = K.store.load(l[0].id); }
    var first = !p;
    if (!p) p = K.templates.build('computers');
    S.P = p; S.hist.reset(JSON.stringify(S.P));
    K.designPanel.init(API);
    setAppTheme(S.prefs.appTheme === 'dark' ? 'dark' : 'light');
    refreshAll(); buildFrame(); updateUndo();
    if (first) { S.dirty = true; flushSave(); } else setStatus('ok', 'Saved in this browser');
    if (!K.store.available) { setStatus('error', 'Storage off'); U.toast('Browser storage is unavailable here, so autosave is off. Use Export → Project file (JSON) to keep your work.', 'warn', 10000); }

    $('#projName').addEventListener('input', function (e) { S.P.name = e.target.value.slice(0, 120) || 'Untitled timeline'; commit('name'); });
    $('#btnUndo').addEventListener('click', undo); $('#btnRedo').addEventListener('click', redo);
    $('#btnExport').addEventListener('click', function () { K.dialogs.openExport(); });
    $('#btnProjects').addEventListener('click', K.dialogs.openProjects);
    $('#btnTemplates').addEventListener('click', K.dialogs.openTemplates);
    $('#btnImport').addEventListener('click', importJSON);
    $('#btnHelp').addEventListener('click', K.dialogs.openHelp);
    $('#btnAppTheme').addEventListener('click', function () { setAppTheme(document.documentElement.getAttribute('data-app-theme') === 'dark' ? 'light' : 'dark'); });
    $$('[data-device]').forEach(function (b) { b.addEventListener('click', function () { S.device = b.getAttribute('data-device'); layoutStage(); }); });
    $('#zoomIn').addEventListener('click', function () { setZoom('in'); }); $('#zoomOut').addEventListener('click', function () { setZoom('out'); }); $('#zoomFit').addEventListener('click', function () { setZoom('fit'); });
    $('#btnRefresh').addEventListener('click', function () { buildFrame(); U.toast('Preview reloaded', 'info', 1200); });
    $('#btnReplay').addEventListener('click', replay);
    $('#btnFull').addEventListener('click', function () {
      var st = $('#stageBox');
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (st.requestFullscreen) st.requestFullscreen().catch(function () { U.toast('Full screen is not available here.', 'warn'); }); else U.toast('Full screen is not available here.', 'warn');
    });
    document.addEventListener('fullscreenchange', function () { var on = !!document.fullscreenElement; $('#btnFull').setAttribute('aria-pressed', String(on)); $('#btnFull').innerHTML = U.icon(on ? 'fa-compress' : 'fa-expand'); setTimeout(layoutStage, 60); });
    $('#layoutQuick').addEventListener('change', function (e) { S.P.layout.type = e.target.value; commit('d:layout.type', { anim: true }); K.designPanel.refresh(); });
    $('#btnDesignToggle').addEventListener('click', function () { var open = document.body.getAttribute('data-design') !== 'open'; document.body.setAttribute('data-design', open ? 'open' : ''); this.setAttribute('aria-expanded', String(open)); setTimeout(layoutStage, 220); });
    $('#btnDesignClose').addEventListener('click', function () { document.body.setAttribute('data-design', ''); $('#btnDesignToggle').setAttribute('aria-expanded', 'false'); $('#btnDesignToggle').focus(); });
    $$('.mtab').forEach(function (b) { b.addEventListener('click', function () { showPanel(b.getAttribute('data-panel')); }); });
    var ro = window.ResizeObserver ? new ResizeObserver(function () { layoutStage(); }) : null;
    if (ro) ro.observe($('#stage')); else window.addEventListener('resize', layoutStage);
    layoutStage();
    document.addEventListener('keydown', function (e) {
      var mod = e.ctrlKey || e.metaKey, tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' && !/^(checkbox|radio|range|color|button)$/.test(e.target.type) || tag === 'textarea' || tag === 'select';
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); S.dirty = true; flushSave(); U.toast(K.store.available ? 'Saved' : 'Storage unavailable — export JSON instead', K.store.available ? 'info' : 'warn', 1500); return; }
      if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); K.dialogs.openExport(); return; }
      if (typing || $('.dlg-wrap')) return;
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
    });
    window.addEventListener('beforeunload', function () { if (S.dirty) flushSave(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && S.dirty) flushSave(); });
    window.addEventListener('storage', function (e) { if (e.key === 'ktm-tlg:p:' + S.P.id && e.newValue) U.toast('This project was changed in another tab. The newest save wins — avoid editing the same project in two tabs.', 'warn', 8000); });
    showPanel('preview');
    K.app = API;
  }
  document.addEventListener('DOMContentLoaded', function () {
    try { init(); } catch (e) { console.error(e); var b = document.getElementById('fatal'); if (b) { b.hidden = false; b.querySelector('span').textContent = e.message; } }
  });
  void app;
})(window.KTM = window.KTM || {});
