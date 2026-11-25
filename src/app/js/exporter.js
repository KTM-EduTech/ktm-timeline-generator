/* KTM Timeline — document builder and export utilities (HTML, source, snippet, JSON, zip, Google Sites, PNG) */
(function (K) {
  'use strict';
  var FA_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
  var H2C = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  var esc = function (s) { return window.KTMTimeline.esc(s); };
  function rt() { return window.__KTM_RT__; }
  function usesIcons(P) {
    var s = P.design.structure;
    return (s.markerContent === 'icon' || s.titleIcon) && P.events.some(function (e) { return !!e.icon; });
  }
  function exportData(P) { var c = K.model.clone(P); delete c.customThemes; return c; }
  function jsonForScript(o) { return JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
  function bgSolid(D) { var c = D.colors; return c.bgType === 'gradient' ? c.gradFrom : (c.bgType === 'transparent' ? 'transparent' : c.background); }
  function headLinks(P, o) {
    var h = '', fonts = window.KTMTimeline.fontsHref(P.design);
    if (fonts) h += '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="' + esc(fonts) + '"' + (o.mode === 'preview' || o.mode === 'capture' ? ' id="ktm-tl-fonts"' : '') + '>';
    if (o.fa !== false && (usesIcons(P) || o.mode === 'preview')) h += '<link rel="stylesheet" href="' + FA_CSS + '" crossorigin="anonymous" referrerpolicy="no-referrer">';
    return h;
  }
  function pageCss(P, mode) {
    var c = 'html,body{margin:0;padding:0}body{background:' + bgSolid(P.design) + ';min-height:100vh}#ktm-timeline{min-height:100vh}';
    if (mode === 'preview') c += '.ktm-tl__card{cursor:pointer}.ktm-tl__item.is-editing>.ktm-tl__card,.ktm-tl__item.is-editing .ktm-tl__card{outline:3px dashed #E9B800;outline-offset:4px}';
    return c;
  }
  function staticMain(P, id) {
    var s = window.KTMTimeline.renderStatic(P);
    return '<main id="' + (id || 'ktm-timeline') + '" class="' + esc(s.className) + '" style="' + esc(s.style) + '" aria-label="' + esc(P.meta.title || 'Timeline') + '">' + s.html + '</main>';
  }
  /* Full standalone HTML document. mode: export | preview | capture */
  function buildDocument(P, o) {
    o = o || {}; var mode = o.mode || 'export', data = exportData(P), R = rt();
    var title = P.meta.title || P.name || 'Timeline';
    var h = '<!DOCTYPE html>\n<html lang="' + esc(P.meta.lang || 'en') + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + esc(title) + '</title>\n';
    if (mode === 'export') h += '<meta name="description" content="' + esc(P.meta.subtitle || ('Interactive timeline: ' + title)) + '">\n<meta name="generator" content="KTM EduTech Timeline Generator ' + window.KTMTimeline.version + '">\n';
    h += headLinks(P, o) + '\n<style>' + pageCss(P, mode) + '\n' + R.css + '</style>\n</head>\n<body>\n';
    if (mode === 'export' && o.prerender !== false) h += staticMain(P) + '\n';
    else h += '<main id="ktm-timeline" class="ktm-tl" aria-label="' + esc(title) + '"></main>\n';
    if (mode === 'export') h += '<script id="ktm-timeline-data" type="application/json">' + jsonForScript(data) + '</script>\n';
    h += '<script>' + R.js + '</script>\n';
    if (mode === 'export') h += '<script>KTMTimeline.boot();</script>\n';
    if (mode === 'capture' && o.h2c) h += '<script src="' + H2C + '" crossorigin="anonymous"></script>\n';
    h += '</body>\n</html>\n';
    return h;
  }
  /* Developer source: index.html + timeline.css + timeline.js */
  function sourceFiles(P) {
    var R = rt(), data = exportData(P), title = P.meta.title || P.name || 'Timeline';
    var html = '<!DOCTYPE html>\n<html lang="' + esc(P.meta.lang || 'en') + '">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>' + esc(title) + '</title>\n  ' +
      headLinks(P, {}).replace(/></g, '>\n  <') + '\n  <link rel="stylesheet" href="timeline.css">\n  <style>' + pageCss(P) + '</style>\n</head>\n<body>\n  ' + staticMain(P) +
      '\n  <!-- Timeline data (JSON, never executed). Edit in the KTM Timeline Generator and re-export, or edit carefully by hand. -->\n  <script id="ktm-timeline-data" type="application/json">' + jsonForScript(data) + '</script>\n  <script src="timeline.js"></script>\n  <script>KTMTimeline.boot();</script>\n</body>\n</html>\n';
    var readme = 'KTM EduTech Timeline — source export\n\nindex.html     page markup + timeline data (JSON block)\ntimeline.css   timeline styles, scoped under .ktm-tl\ntimeline.js    renderer/runtime (no dependencies)\n\nUpload all three files to the same folder on any static host (GitHub Pages, Netlify, Cloudflare Pages).\nFont Awesome and Google Fonts load from their CDNs when icons/fonts are used.\n';
    return [{ name: 'index.html', text: html }, { name: 'timeline.css', text: R.css }, { name: 'timeline.js', text: R.js }, { name: 'README.txt', text: readme }];
  }
  /* Paste-in snippet for an existing web page (uses a unique id so several can share a page) */
  function snippet(P) {
    var R = rt(), id = 'ktm-timeline-' + P.id.replace(/[^\w-]/g, '').slice(-10);
    return '<!-- KTM EduTech Timeline: ' + esc(P.meta.title || P.name) + ' -->\n' + headLinks(P, {}) + '\n<style>' + R.css + '</style>\n' + staticMain(P, id) +
      '\n<script id="' + id + '-data" type="application/json">' + jsonForScript(exportData(P)) + '</script>\n<script>' + R.js + '</script>\n<script>KTMTimeline.mount(document.getElementById("' + id + '"),JSON.parse(document.getElementById("' + id + '-data").textContent),{manageFonts:false});</script>\n';
  }
  /* Try to inline external images as data URLs (only works where the image host allows CORS) */
  function embedImages(P) {
    var C = K.model.clone(P), jobs = [], failed = [], done = 0;
    C.events.forEach(function (ev) {
      var u = ev.image.url;
      if (!/^https?:\/\//i.test(u)) return;
      jobs.push(fetch(u, { mode: 'cors', credentials: 'omit' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      }).then(function (b) {
        if (!/^image\//.test(b.type)) throw new Error('not an image');
        if (b.size > 4 * 1024 * 1024) throw new Error('larger than 4 MB');
        return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(b); });
      }).then(function (d) { ev.image.url = d; done++; }).catch(function (e) { failed.push({ title: ev.title, url: u, reason: e.message || 'blocked' }); }));
    });
    return Promise.all(jobs).then(function () { return { P: C, embedded: done, failed: failed }; });
  }
  /* Google Sites iframe code */
  function iframeCode(o) {
    var url = String(o.url || '').trim(), style = [];
    if (!o.border) style.push('border:0'); else style.push('border:' + (o.borderWidth || 1) + 'px solid ' + (o.borderColor || '#E3E5EE'));
    if (o.radius) style.push('border-radius:' + o.radius + 'px');
    style.push('max-width:100%');
    return '<iframe\n  src="' + esc(url || 'https://your-hosted-timeline.example/timeline.html') + '"\n  width="' + (o.fullWidth ? '100%' : (o.width || 960)) + '"\n  height="' + (o.height || 800) + '"\n  style="' + style.join(';') + ';"\n' +
      (o.lazy ? '  loading="lazy"\n' : '') + '  title="' + esc(o.title || 'Interactive timeline') + '"\n  allow="fullscreen; encrypted-media; picture-in-picture"\n  referrerpolicy="strict-origin-when-cross-origin">\n</iframe>';
  }
  function checkUrl(u) {
    u = String(u || '').trim();
    if (!u) return { ok: false, msg: 'Enter the public address where your timeline HTML is hosted.' };
    if (!/^https:\/\//i.test(u)) return { ok: false, msg: 'Google Sites needs an https:// address. http:// pages are blocked inside Google Sites.' };
    if (/^https:\/\/(localhost|127\.|192\.168\.|10\.)/i.test(u)) return { ok: false, msg: 'That is a local address — only you can see it. Use a public host.' };
    if (/docs\.google\.com|drive\.google\.com/i.test(u)) return { ok: false, msg: 'Google Drive does not serve HTML files as web pages. Use GitHub Pages, Netlify or Cloudflare Pages instead.' };
    if (/github\.com\/.+\/blob\//i.test(u)) return { ok: false, msg: 'That is a GitHub file view, not a hosted page. Turn on GitHub Pages and use the github.io address.' };
    try { new URL(u); } catch (e) { return { ok: false, msg: 'That does not look like a valid web address.' }; }
    return { ok: true, msg: 'Looks like a public HTTPS address.' };
  }

  /* Minimal ZIP writer (stored, no compression) */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0;
    var d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = f.bytes || enc.encode(f.text), crc = crc32(data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
      h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    });
    var csize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(central, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
  }
  function slug(s) { return String(s || 'timeline').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 60) || 'timeline'; }
  function download(name, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
    return blob.size;
  }

  /* ---------- PNG export ---------- */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function withTimeout(p, ms) { return Promise.race([p, wait(ms)]); }
  function testCors(src) {
    return new Promise(function (res) {
      if (!/^https?:/i.test(src)) return res(true);
      var im = new Image(); im.crossOrigin = 'anonymous';
      var t = setTimeout(function () { res(false); }, 8000);
      im.onload = function () { clearTimeout(t); res(true); }; im.onerror = function () { clearTimeout(t); res(false); };
      im.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'ktmcors=1';
    });
  }
  function capturePNG(P, o) {
    o = o || {};
    var W = o.width || 1200, scale = o.scale || 2, frame, warnings = [];
    var MAX_DIM = 16000, MAX_AREA = 120e6;
    return new Promise(function (resolve, reject) {
      frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + W + 'px;height:900px;border:0;opacity:0;pointer-events:none';
      var loaded = false;
      frame.onload = function () { if (loaded) return; loaded = true; resolve(frame); };
      frame.srcdoc = buildDocument(P, { mode: 'capture', h2c: true });
      document.body.appendChild(frame);
      setTimeout(function () { if (!loaded) reject(new Error('The capture page did not load.')); }, 20000);
    }).then(function () {
      var win = frame.contentWindow, d = win.document, root = d.getElementById('ktm-timeline');
      if (!win.html2canvas) throw new Error('The PNG renderer (html2canvas) could not be downloaded from cdnjs.cloudflare.com. Check your internet connection or content blockers and try again.');
      var C = K.model.clone(P);
      win.KTMTimeline.mount(root, JSON.stringify(C), { capture: true, captureTools: !!o.tools });
      return withTimeout(d.fonts ? d.fonts.ready : Promise.resolve(), 6000).then(function () {
        var imgs = Array.prototype.slice.call(d.querySelectorAll('img'));
        return withTimeout(Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (r) { im.addEventListener('load', r); im.addEventListener('error', r); }); })), 10000);
      }).then(function () {
        var hl = d.querySelector('.ktm-tl__hlist');
        if (hl) { var need = Math.ceil(hl.scrollWidth + 2 * (parseFloat(win.getComputedStyle(root).paddingLeft) || 0) + 40); if (need > W) frame.style.width = need + 'px'; }
        return wait(120);
      }).then(function () {
        frame.style.height = Math.ceil(root.scrollHeight + 4) + 'px';
        return wait(200);
      }).then(function () {
        var imgs = Array.prototype.slice.call(d.querySelectorAll('img.ktm-tl__img'));
        return Promise.all(imgs.map(function (im) { return testCors(im.currentSrc || im.src).then(function (ok) { return ok ? null : im; }); }));
      }).then(function (bad) {
        bad = bad.filter(Boolean);
        var failedImgs = d.querySelectorAll('.ktm-tl__imgfail').length;
        if (failedImgs) warnings.push(failedImgs + ' image(s) could not be loaded at all and appear as "Image unavailable".');
        if (!bad.length) return true;
        var names = bad.map(function (im) { var li = im.closest('.ktm-tl__item'); var t = li && li.querySelector('.ktm-tl__title'); return t ? t.textContent : (im.alt || im.src); });
        return (o.confirmCors ? o.confirmCors(names) : Promise.resolve(true)).then(function (go) {
          if (!go) { var e = new Error('cancelled'); e.cancelled = true; throw e; }
          bad.forEach(function (im) { im.setAttribute('data-ktm-nocors', '1'); });
          warnings.push(bad.length + ' image(s) are hosted on a server that blocks image capture; they are shown as labelled placeholders in the PNG.');
          return true;
        });
      }).then(function () {
        var w = Math.ceil(root.scrollWidth), h = Math.ceil(root.scrollHeight), s = scale;
        while (s > 1 && (w * s > MAX_DIM || h * s > MAX_DIM || w * h * s * s > MAX_AREA)) s = Math.max(1, s - 0.5);
        if (w * s > MAX_DIM || h * s > MAX_DIM || w * h * s * s > MAX_AREA) {
          throw new Error('This timeline is too long for one image (' + w + ' × ' + h + ' px). Try the Compact or Cards layout, a narrower width, or fewer events per image.');
        }
        if (s !== scale) warnings.push('Resolution reduced to ' + s + '× so the image stays within browser canvas limits.');
        var bg = bgSolid(P.design);
        return win.html2canvas(root, {
          scale: s, useCORS: true, allowTaint: false, logging: false, backgroundColor: bg === 'transparent' ? null : bg,
          width: w, height: h, windowWidth: parseInt(frame.style.width, 10), windowHeight: h, scrollX: 0, scrollY: 0,
          onclone: function (cd) {
            cd.querySelectorAll('img[data-ktm-nocors]').forEach(function (im) {
              var ph = cd.createElement('div'); ph.className = 'ktm-tl__imgfail'; ph.textContent = 'Image not included (host blocks capture)';
              (im.closest('.ktm-tl__imgbtn') || im).replaceWith(ph);
            });
          }
        }).then(function (canvas) { return { canvas: canvas, scale: s }; });
      }).then(function (r) {
        var canvas = r.canvas;
        if (!canvas || !canvas.width || !canvas.height) throw new Error('The renderer returned an empty image.');
        return new Promise(function (res, rej) {
          try {
            canvas.toBlob(function (b) { if (!b) rej(new Error('The browser could not encode the PNG (the image may be too large).')); else res({ blob: b, width: canvas.width, height: canvas.height, scale: r.scale, warnings: warnings }); }, 'image/png');
          } catch (e) { rej(new Error('The image could not be exported because a picture from another website blocked it (' + e.name + ').')); }
        });
      });
    }).then(function (res) { frame.remove(); return res; }, function (err) { if (frame) frame.remove(); throw err; });
  }

  K.exporter = {
    FA_CSS: FA_CSS, H2C: H2C, buildDocument: buildDocument, sourceFiles: sourceFiles, snippet: snippet, embedImages: embedImages,
    iframeCode: iframeCode, checkUrl: checkUrl, zip: zip, download: download, slug: slug, capturePNG: capturePNG, exportData: exportData
  };
})(window.KTM = window.KTM || {});
