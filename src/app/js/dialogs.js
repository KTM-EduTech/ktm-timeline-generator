/* KTM Timeline — export centre, Google Sites panel, projects, templates, import, help */
(function (K) {
  'use strict';
  var U = K.ui, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon, X = K.exporter, M = K.model;
  var A;
  function P() { return A.P(); }
  function fname(ext) { return X.slug(P().meta.title || P().name) + ext; }
  function codeBox(id, label, rows) { return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><textarea id="' + id + '" class="input code" rows="' + (rows || 8) + '" readonly spellcheck="false"></textarea></div>'; }
  function safeDownload(name, content, mime) {
    try { var n = X.download(name, content, mime); U.toast('Downloaded ' + name + ' (' + U.fmtBytes(n) + ')'); return true; }
    catch (e) { U.toast('This browser blocked the download. Use the Copy button instead.', 'error'); return false; }
  }

  /* ---------- Export centre ---------- */
  function openExport(tab) {
    var gs = A.prefs().gsites || {};
    var body = U.h('<div class="export">' +
      '<div class="tabs" role="tablist" aria-label="Export type">' +
      [['html', 'fa-file-code', 'Standalone HTML'], ['gsites', 'fa-brands fa-google', 'Google Sites'], ['source', 'fa-code', 'HTML/CSS source'], ['png', 'fa-image', 'PNG image'], ['json', 'fa-floppy-disk', 'Project file (JSON)']].map(function (t) {
        return '<button type="button" role="tab" id="xt-' + t[0] + '" aria-controls="xp-' + t[0] + '" data-tab="' + t[0] + '" aria-selected="false" tabindex="-1">' + (t[1].indexOf('fa-brands') === 0 ? '<i class="' + t[1] + '" aria-hidden="true"></i>' : icon(t[1])) + '<span>' + t[2] + '</span></button>';
      }).join('') + '</div>' +

      '<section class="tabpanel" role="tabpanel" id="xp-html" aria-labelledby="xt-html" hidden>' +
      '<p>A single <code>.html</code> file with the timeline, its data, styles and scripts built in. It works without this editor — open it in any browser or upload it to a web host.</p>' +
      '<label class="check"><input type="checkbox" id="xEmbedImg"><span>Embed images from other websites inside the file (where the image host allows it)</span></label>' +
      '<p class="hint">Uploaded images are always embedded. Font Awesome icons and Google Fonts load from their CDNs, so viewers need an internet connection for icons and custom fonts (text falls back to system fonts).</p>' +
      '<div class="row wrap"><button type="button" class="btn primary" id="xHtmlDl">' + icon('fa-download') + '<span>Download HTML file</span></button><button type="button" class="btn ghost" id="xHtmlCopy">' + icon('fa-copy') + '<span>Copy HTML</span></button><button type="button" class="btn ghost" id="xHtmlOpen">' + icon('fa-up-right-from-square') + '<span>Open in new tab</span></button></div>' +
      '<p class="hint" id="xHtmlInfo"></p></section>' +

      '<section class="tabpanel" role="tabpanel" id="xp-gsites" aria-labelledby="xt-gsites" hidden>' +
      '<div class="callout">' + icon('fa-circle-info') + '<div><b>Google Sites can only embed a timeline that is published on the web.</b> Downloading the HTML file does not publish it. Host the file on a public <code>https://</code> address first, then paste that address below.</div></div>' +
      '<ol class="steps"><li><b>Download</b> the standalone HTML (first tab) and rename it, e.g. <code>timeline.html</code>.</li>' +
      '<li><b>Host it publicly.</b> Free options: <em>GitHub Pages</em> (upload to a repository, Settings → Pages), <em>Netlify Drop</em> (drag the file onto app.netlify.com/drop), or <em>Cloudflare Pages</em>. Do not set <code>X-Frame-Options</code> or a restrictive <code>frame-ancestors</code> header — those stop Google Sites from showing the page. Google Drive cannot host web pages.</li>' +
      '<li><b>Paste the address</b> below and copy the embed code.</li>' +
      '<li>In Google Sites choose <b>Insert → Embed → Embed code</b>, paste, click <b>Next → Insert</b>, then drag the box to the size you want. (Or use <b>Embed → By URL</b> with just the address.)</li></ol>' +
      '<div class="field"><label for="gsUrl">Hosted timeline URL</label><input id="gsUrl" class="input" type="url" placeholder="https://username.github.io/timeline.html" autocomplete="off"><p class="hint" id="gsCheck" aria-live="polite"></p></div>' +
      '<div class="grid3"><div class="field"><label for="gsH">Height (px)</label><input id="gsH" class="input" type="number" min="200" max="6000" step="10"></div>' +
      '<div class="field"><label for="gsW">Width (px)</label><input id="gsW" class="input" type="number" min="200" max="3000" step="10"></div>' +
      '<div class="field"><label for="gsTitle">Accessible title</label><input id="gsTitle" class="input"></div></div>' +
      '<div class="row wrap"><label class="check"><input type="checkbox" id="gsFull"><span>Full width</span></label><label class="check"><input type="checkbox" id="gsBorder"><span>Show a border</span></label><label class="check"><input type="checkbox" id="gsLazy"><span>Lazy loading</span></label></div>' +
      '<p class="hint">Suggested height for this timeline: <b id="gsSuggest">…</b>. A fixed height is the reliable option in Google Sites — it does not let embedded pages resize themselves. If the content is taller, the timeline scrolls inside its box.</p>' +
      codeBox('gsCode', 'Embed code', 9) +
      '<div class="row wrap"><button type="button" class="btn primary" id="gsCopy">' + icon('fa-copy') + '<span>Copy embed code</span></button><button type="button" class="btn ghost" id="gsTest">' + icon('fa-vial') + '<span>Test in a preview iframe</span></button></div>' +
      '<div id="gsTestBox" hidden></div>' +
      '<details class="sub"><summary>No web hosting? Paste the whole timeline instead</summary><p>Google Sites\' <b>Embed code</b> box also accepts a complete HTML document. Copy the standalone HTML below and paste it there. This works well for small timelines; very large ones (for example with many uploaded images) may be rejected by Google Sites, and you will need to re-paste after every change.</p><button type="button" class="btn ghost sm" id="gsCopyFull">' + icon('fa-copy') + '<span>Copy full HTML for Embed code</span></button></details>' +
      '</section>' +

      '<section class="tabpanel" role="tabpanel" id="xp-source" aria-labelledby="xt-source" hidden>' +
      '<p>Separate, readable files for developers: <code>index.html</code>, <code>timeline.css</code> (all rules scoped to <code>.ktm-tl</code>) and <code>timeline.js</code> (no dependencies).</p>' +
      '<div class="row wrap"><button type="button" class="btn primary" id="srcZip">' + icon('fa-file-zipper') + '<span>Download source (.zip)</span></button></div>' +
      '<div class="tabs mini" role="tablist" aria-label="Source file"><button type="button" role="tab" data-src="0" aria-selected="true">index.html</button><button type="button" role="tab" data-src="1" aria-selected="false" tabindex="-1">timeline.css</button><button type="button" role="tab" data-src="2" aria-selected="false" tabindex="-1">timeline.js</button><button type="button" role="tab" data-src="snip" aria-selected="false" tabindex="-1">Embeddable snippet</button></div>' +
      codeBox('srcCode', 'Source', 12) + '<p class="hint" id="srcHint"></p>' +
      '<button type="button" class="btn ghost" id="srcCopy">' + icon('fa-copy') + '<span>Copy this file</span></button></section>' +

      '<section class="tabpanel" role="tabpanel" id="xp-png" aria-labelledby="xt-png" hidden>' +
      '<p>A picture of the whole timeline for slides, posters, worksheets or social media.</p>' +
      '<div class="grid3"><div class="field"><label for="pngW">Page width</label><select id="pngW" class="input"><option value="1200">Desktop (1200 px)</option><option value="1600">Wide (1600 px)</option><option value="820">Tablet (820 px)</option><option value="420">Phone (420 px)</option></select></div>' +
      '<div class="field"><label for="pngS">Resolution</label><select id="pngS" class="input"><option value="1">Standard (1×)</option><option value="2" selected>High (2×)</option><option value="3">Print (3×)</option></select></div>' +
      '<div class="field"><span class="ctl-label">&nbsp;</span><label class="check"><input type="checkbox" id="pngTools"><span>Include search and filters</span></label></div></div>' +
      '<p class="hint">Animations are switched off and every description is shown. Horizontal timelines are captured at their full length. Images from websites that block capture are replaced with labelled placeholders — you will be asked first.</p>' +
      '<div class="row wrap"><button type="button" class="btn primary" id="pngGo">' + icon('fa-camera') + '<span>Create PNG</span></button></div>' +
      '<div id="pngOut" aria-live="polite"></div></section>' +

      '<section class="tabpanel" role="tabpanel" id="xp-json" aria-labelledby="xt-json" hidden>' +
      '<p>The complete project — events, categories, layout, design settings and saved themes — as a <code>.json</code> file. Use it as a backup, to move a project to another computer or browser, or to share an editable copy with a colleague (they open it with <b>Import</b>).</p>' +
      '<div class="callout">' + icon('fa-triangle-exclamation') + '<div>Autosave keeps projects in <b>this browser only</b>. It is not cloud sync: clearing browser data, using another browser or another computer means the project is not there. Export JSON regularly to keep a safe copy.</div></div>' +
      '<div class="row wrap"><button type="button" class="btn primary" id="jsonDl">' + icon('fa-download') + '<span>Download project (.json)</span></button><button type="button" class="btn ghost" id="jsonCopy">' + icon('fa-copy') + '<span>Copy JSON</span></button></div><p class="hint" id="jsonInfo"></p></section>' +
      '</div>');
    var d = U.dialog({ title: 'Export and publish', body: body, wide: true, cls: 'dlg-export' });

    function show(t) {
      $$('[data-tab]', body).forEach(function (b) { var on = b.getAttribute('data-tab') === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      $$('.tabpanel', body).forEach(function (p) { p.hidden = p.id !== 'xp-' + t; });
      if (t === 'gsites') gsUpdate(); if (t === 'source') srcShow(cur); if (t === 'json') jsonInfo(); if (t === 'html') htmlInfo();
    }
    $('.tabs', body).addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) show(b.getAttribute('data-tab')); });
    $('.tabs', body).addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; var tabs = $$('[data-tab]', body), i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); show(n.getAttribute('data-tab'));
    });

    /* HTML */
    function htmlDoc() {
      var embed = $('#xEmbedImg', body).checked;
      if (!embed) return Promise.resolve({ html: X.buildDocument(P(), { mode: 'export' }), note: '' });
      return X.embedImages(P()).then(function (r) {
        var note = r.embedded ? r.embedded + ' image(s) embedded. ' : '';
        if (r.failed.length) note += r.failed.length + ' image(s) could not be embedded because their website does not allow it, so they still load from the web: ' + r.failed.map(function (f) { return f.title; }).join(', ') + '.';
        return { html: X.buildDocument(r.P, { mode: 'export' }), note: note };
      });
    }
    function htmlInfo() {
      var html = X.buildDocument(P(), { mode: 'export' }), ext = P().events.filter(function (e) { return /^https?:/i.test(e.image.url); }).length;
      $('#xHtmlInfo', body).textContent = 'File size about ' + U.fmtBytes(new Blob([html]).size) + '. ' + (ext ? ext + ' image(s) are linked from other websites.' : 'No external images.');
    }
    $('#xHtmlDl', body).addEventListener('click', function (e) { var b = e.currentTarget; b.disabled = true; htmlDoc().then(function (r) { safeDownload(fname('.html'), r.html, 'text/html'); if (r.note) U.toast(r.note, 'warn', 9000); }).finally(function () { b.disabled = false; }); });
    $('#xHtmlCopy', body).addEventListener('click', function (e) { var b = e.currentTarget; htmlDoc().then(function (r) { U.copyText(r.html, b); }); });
    $('#xHtmlOpen', body).addEventListener('click', function () {
      htmlDoc().then(function (r) {
        var url = URL.createObjectURL(new Blob([r.html], { type: 'text/html' })), wdw = window.open(url, '_blank', 'noopener');
        if (!wdw) U.toast('The browser blocked the new tab. Allow pop-ups or use Download.', 'warn');
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      });
    });

    /* Google Sites */
    var gsDefaults = { url: '', height: 0, width: 960, title: '', full: true, border: false, lazy: true };
    var g = Object.assign({}, gsDefaults, gs[P().id] || {});
    var suggested = A.suggestHeight();
    $('#gsUrl', body).value = g.url; $('#gsH', body).value = g.height || suggested; $('#gsW', body).value = g.width; $('#gsTitle', body).value = g.title || P().meta.title || 'Interactive timeline';
    $('#gsFull', body).checked = g.full; $('#gsBorder', body).checked = g.border; $('#gsLazy', body).checked = g.lazy;
    $('#gsSuggest', body).textContent = suggested + ' px';
    function gsOpts() {
      return { url: $('#gsUrl', body).value.trim(), height: Math.max(200, Math.min(6000, parseInt($('#gsH', body).value, 10) || suggested)), width: Math.max(200, Math.min(3000, parseInt($('#gsW', body).value, 10) || 960)),
        title: $('#gsTitle', body).value.trim(), fullWidth: $('#gsFull', body).checked, border: $('#gsBorder', body).checked, lazy: $('#gsLazy', body).checked };
    }
    function gsUpdate() {
      var o = gsOpts(), chk = X.checkUrl(o.url), el = $('#gsCheck', body);
      el.textContent = o.url ? chk.msg : 'Required. The address must start with https://'; el.className = 'hint' + (o.url && !chk.ok ? ' bad' : o.url ? ' good' : '');
      $('#gsW', body).disabled = o.fullWidth;
      $('#gsCode', body).value = X.iframeCode(o);
      var all = A.prefs().gsites || {}; all[P().id] = { url: o.url, height: o.height, width: o.width, title: o.title, full: o.fullWidth, border: o.border, lazy: o.lazy }; A.prefs({ gsites: all });
    }
    $('#xp-gsites', body).addEventListener('input', gsUpdate); $('#xp-gsites', body).addEventListener('change', gsUpdate);
    $('#gsCopy', body).addEventListener('click', function (e) {
      var o = gsOpts(); if (!X.checkUrl(o.url).ok) { U.toast('Add a public https:// address first — the embed code needs to point at your hosted timeline.', 'warn'); $('#gsUrl', body).focus(); return; }
      U.copyText($('#gsCode', body).value, e.currentTarget);
    });
    $('#gsCopyFull', body).addEventListener('click', function (e) { var html = X.buildDocument(P(), { mode: 'export' }); U.copyText(html, e.currentTarget); if (html.length > 400000) U.toast('This timeline is ' + U.fmtBytes(html.length) + ' — Google Sites may reject very large embed code. Hosting the file is more reliable.', 'warn', 9000); });
    $('#gsTest', body).addEventListener('click', function () {
      // Test the generated document in a sandboxed iframe like Google Sites does (scripts allowed, separate origin)
      var o = gsOpts(), box = $('#gsTestBox', body), html = X.buildDocument(P(), { mode: 'export' });
      box.hidden = false;
      box.innerHTML = '<p class="hint">Exported file shown inside a sandboxed iframe (scripts on, separate origin) at ' + o.height + ' px high — the same way Google Sites isolates embeds. Hosted-URL embedding also needs your host to allow framing.</p>';
      var fr = document.createElement('iframe'); fr.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox'); fr.title = 'Embed test'; fr.className = 'gs-test';
      fr.style.height = Math.min(o.height, 700) + 'px'; fr.srcdoc = html; box.appendChild(fr);
    });

    /* Source */
    var cur = '0', files = null;
    function srcShow(k) {
      cur = k; files = files || X.sourceFiles(P());
      $$('[data-src]', body).forEach(function (b) { var on = b.getAttribute('data-src') === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      $('#srcCode', body).value = k === 'snip' ? X.snippet(P()) : files[+k].text;
      $('label[for="srcCode"]', body).textContent = k === 'snip' ? 'Snippet for an existing web page' : files[+k].name;
      $('#srcHint', body).textContent = k === 'snip' ? 'Paste into any HTML page or CMS block that allows scripts. All styles are scoped under .ktm-tl so they do not affect the rest of the page.' : '';
    }
    $('[data-src]', body).parentNode.addEventListener('click', function (e) { var b = e.target.closest('[data-src]'); if (b) srcShow(b.getAttribute('data-src')); });
    $('#srcCopy', body).addEventListener('click', function (e) { U.copyText($('#srcCode', body).value, e.currentTarget); });
    $('#srcZip', body).addEventListener('click', function () { files = X.sourceFiles(P()); safeDownload(fname('-source.zip'), X.zip(files)); });

    /* PNG */
    $('#pngGo', body).addEventListener('click', function (e) {
      var b = e.currentTarget, out = $('#pngOut', body);
      b.disabled = true; out.innerHTML = '<p class="hint">' + icon('fa-spinner fa-spin') + ' Rendering the timeline… this can take a few seconds.</p>';
      X.capturePNG(P(), { width: +$('#pngW', body).value, scale: +$('#pngS', body).value, tools: $('#pngTools', body).checked,
        confirmCors: function (names) {
          return U.confirm({ title: 'Some images cannot be captured', message: 'The website hosting these images does not allow them to be copied into a PNG: ' + names.join(', ') + '. Continue with labelled placeholders instead of those images? (Uploading the images to the project avoids this.)', confirm: 'Continue without them' });
        } }).then(function (r) {
        var url = URL.createObjectURL(r.blob);
        out.innerHTML = '<div class="png-res"><img alt="Preview of the exported PNG" src="' + url + '"><div><p><b>' + r.width + ' × ' + r.height + ' px</b> · ' + U.fmtBytes(r.blob.size) + '</p>' + r.warnings.map(function (w) { return '<p class="hint bad">' + esc(w) + '</p>'; }).join('') + '<button type="button" class="btn primary" id="pngDl">' + icon('fa-download') + '<span>Download PNG</span></button></div></div>';
        $('#pngDl', body).addEventListener('click', function () { safeDownload(fname('.png'), r.blob); });
      }).catch(function (err) {
        out.innerHTML = err.cancelled ? '<p class="hint">PNG export cancelled.</p>' : '<div class="callout bad">' + icon('fa-circle-exclamation') + '<div><b>PNG export failed.</b> ' + esc(err.message || String(err)) + '</div></div>';
      }).finally(function () { b.disabled = false; });
    });

    /* JSON */
    function jsonText() { return JSON.stringify(P(), null, 2); }
    function jsonInfo() { $('#jsonInfo', body).textContent = 'Schema version ' + M.VERSION + ' · ' + P().events.length + ' events · ' + U.fmtBytes(new Blob([jsonText()]).size); }
    $('#jsonDl', body).addEventListener('click', function () { safeDownload(fname('.ktm-timeline.json'), jsonText(), 'application/json'); });
    $('#jsonCopy', body).addEventListener('click', function (e) { U.copyText(jsonText(), e.currentTarget); });

    show(tab || 'html');
    return d;
  }

  /* ---------- Projects ---------- */
  function openProjects() {
    var body = U.h('<div class="projects"><div class="callout">' + icon('fa-circle-info') + '<div>Projects save automatically in <b>this browser on this device</b>. This is not cloud storage — export a JSON file to back up or move a project.</div></div>' +
      '<div class="row wrap"><button type="button" class="btn primary" data-pact="new">' + icon('fa-plus') + '<span>New blank project</span></button><button type="button" class="btn ghost" data-pact="templates">' + icon('fa-shapes') + '<span>Start from a template</span></button><button type="button" class="btn ghost" data-pact="import">' + icon('fa-file-import') + '<span>Import JSON</span></button></div>' +
      '<ul class="proj-list" aria-label="Saved projects"></ul><p class="hint" id="storeUse"></p></div>');
    var d = U.dialog({ title: 'Your projects', body: body, wide: true });
    function draw() {
      var l = K.store.list(), cur = P().id;
      $('.proj-list', body).innerHTML = l.length ? l.map(function (p) {
        var when = p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '';
        return '<li class="' + (p.id === cur ? 'is-cur' : '') + '" data-pid="' + esc(p.id) + '"><div class="pi"><b>' + esc(p.name) + '</b>' + (p.id === cur ? ' <span class="tag">Open now</span>' : '') + '<span class="hint">' + (p.events || 0) + ' events · ' + esc(p.layout || '') + ' · ' + esc(when) + '</span></div>' +
          '<div class="pa">' + (p.id !== cur ? '<button type="button" class="btn ghost sm" data-pact="open">' + icon('fa-folder-open') + '<span>Open</span></button>' : '') + '<button type="button" class="icon-btn sm" data-pact="rename" aria-label="Rename ' + esc(p.name) + '">' + icon('fa-pen') + '</button><button type="button" class="icon-btn sm" data-pact="copy" aria-label="Duplicate ' + esc(p.name) + '">' + icon('fa-clone') + '</button><button type="button" class="icon-btn sm" data-pact="delete" aria-label="Delete ' + esc(p.name) + '">' + icon('fa-trash-can') + '</button></div></li>';
      }).join('') : '<li class="hint">' + (K.store.available ? 'No saved projects yet.' : 'Browser storage is not available here (private browsing or blocked). Use JSON export to keep your work.') + '</li>';
      $('#storeUse', body).textContent = K.store.available ? 'Storage used by this app: ' + U.fmtBytes(K.store.usage()) + ' (browsers usually allow about 5 MB).' : '';
    }
    draw();
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pact]'); if (!b) return;
      var act = b.getAttribute('data-pact'), li = b.closest('[data-pid]'), id = li && li.getAttribute('data-pid');
      if (act === 'new') { A.openProject(K.templates.build(null)); d.close(); U.toast('New blank project created'); }
      else if (act === 'templates') { d.close(); openTemplates(); }
      else if (act === 'import') { d.close(); A.importJSON(); }
      else if (act === 'open') { var p = K.store.load(id); if (!p) { U.toast('That project could not be read — it may be damaged.', 'error'); return; } A.flushSave(); A.openProject(p, true); d.close(); U.toast('Opened "' + p.name + '"'); }
      else if (act === 'rename') {
        var meta = K.store.list().filter(function (x) { return x.id === id; })[0];
        U.prompt({ title: 'Rename project', label: 'Project name', value: meta ? meta.name : '' }).then(function (n) {
          if (!n) return;
          if (id === P().id) { P().name = n; A.commit('rename'); $('#projName').value = n; A.flushSave(); }
          else { var q = K.store.load(id); if (q) { q.name = n; K.store.save(q); A.restoreLast(); } }
          draw();
        });
      } else if (act === 'copy') {
        var src = id === P().id ? M.clone(P()) : K.store.load(id); if (!src) return;
        src.id = M.uid('tl'); src.name = src.name + ' (copy)'; src.createdAt = src.updatedAt = new Date().toISOString();
        var r = K.store.save(src); if (!r.ok) U.toast(r.error, 'error'); else { K.store.save(P()); U.toast('Copy saved'); }
        draw();
      } else if (act === 'delete') {
        var nm = (K.store.list().filter(function (x) { return x.id === id; })[0] || {}).name;
        U.confirm({ title: 'Delete project?', message: '"' + nm + '" will be permanently removed from this browser. This cannot be undone. Export it as JSON first if you might need it.', confirm: 'Delete permanently', danger: true }).then(function (ok) {
          if (!ok) return; K.store.remove(id);
          if (id === P().id) { var l = K.store.list(); var next = l.length ? K.store.load(l[0].id) : null; A.openProject(next || K.templates.build(null), true); }
          draw(); U.toast('Project deleted');
        });
      }
    });
  }

  /* ---------- Templates ---------- */
  function openTemplates() {
    var body = U.h('<div><p>Each template creates a <b>new project</b> with sample events you can edit or delete. Your current project stays saved.</p><div class="tpl-grid">' +
      '<button type="button" class="tpl" data-tpl="">' + icon('fa-file') + '<b>Blank timeline</b><span>Start from scratch</span></button>' +
      K.templates.list.map(function (t) { return '<button type="button" class="tpl" data-tpl="' + t.id + '"><i class="' + t.icon + '" aria-hidden="true"></i><b>' + esc(t.name) + '</b><span>' + t.events.length + ' events · ' + esc(t.layout) + '</span></button>'; }).join('') +
      '</div><label class="check"><input type="checkbox" id="tplReplace"><span>Replace the current project instead of creating a new one</span></label></div>');
    var d = U.dialog({ title: 'Templates', body: body, wide: true });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tpl]'); if (!b) return;
      var tid = b.getAttribute('data-tpl'), np = K.templates.build(tid || null), rep = $('#tplReplace', body).checked;
      if (!rep) { A.flushSave(); A.openProject(np, true); d.close(); U.toast('Created "' + np.name + '"'); return; }
      U.confirm({ title: 'Replace current project?', message: 'All events and design settings in "' + P().name + '" will be replaced by the template. You can undo this with Ctrl+Z while the project is open.', confirm: 'Replace', danger: true }).then(function (ok) {
        if (!ok) return;
        var keep = P().id; np.id = keep; np.name = P().name;
        A.replaceProject(np); d.close(); U.toast('Template applied — press Ctrl+Z to undo');
      });
    });
  }

  /* ---------- Help ---------- */
  function openHelp() {
    var body = U.h('<div class="help"><div class="help-brand"><img src="https://ik.imagekit.io/ktmedutech/KYDMASONG%20NET/Logo/Signature%20Gold%20(blackbg).png?updatedAt=1794056394378" alt="Kyd Masong signature logo" width="220" height="80" onerror="this.remove()"><div><b>KTM EduTech Timeline Generator</b><span>Version ' + window.KTMTimeline.version + '</span></div></div>' +
      '<h3>Quick start</h3><ol><li>Add or edit events on the left (click an event to open it).</li><li>Pick a layout and style on the right. The preview in the middle updates instantly.</li><li>Use <b>Export</b> to download a standalone HTML page, a PNG image or a project file, and to get Google Sites embed code.</li></ol>' +
      '<h3>Saving</h3><p>Work saves automatically in this browser. It is <b>not</b> synced to the cloud or other devices — export a JSON project file to back up, move or share a project.</p>' +
      '<h3>Keyboard shortcuts</h3><ul class="kbd-list"><li><kbd>Ctrl</kbd>+<kbd>Z</kbd> Undo</li><li><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> or <kbd>Ctrl</kbd>+<kbd>Y</kbd> Redo</li><li><kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> on an event: move it</li><li><kbd>Ctrl</kbd>+<kbd>S</kbd> Save now</li><li><kbd>Ctrl</kbd>+<kbd>E</kbd> Export</li></ul>' +
      '<h3>Dates</h3><p>Use a year (<code>1969</code>), a full date (<code>1969-07-20</code>), a range, or any custom label such as “Early 1900s” or “Week 3”. Use a minus sign for BCE (<code>-500</code>). Custom labels can have a sort year so that <b>Sort → Oldest first</b> places them correctly.</p>' +
      '<h3>Google Sites</h3><p>Host the exported HTML at a public https:// address (GitHub Pages, Netlify or Cloudflare Pages), then use <b>Export → Google Sites</b> to create the embed code. Google Sites embeds need a fixed height.</p></div>');
    U.dialog({ title: 'Help', body: body, wide: true });
  }

  K.dialogs = { init: function (app) { A = app; }, openExport: openExport, openProjects: openProjects, openTemplates: openTemplates, openHelp: openHelp };
})(window.KTM = window.KTM || {});
