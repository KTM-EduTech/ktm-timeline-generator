/* KTM Timeline — small UI toolkit: DOM helpers, dialogs, toasts, clipboard */
(function (K) {
  'use strict';
  var esc = function (s) { return window.KTMTimeline.esc(s); };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function icon(n) { return '<i class="fa-solid ' + n + '" aria-hidden="true"></i>'; }

  function toast(msg, type, ms) {
    var box = $('#toasts'), t = h('<div class="toast toast-' + (type || 'info') + '" role="' + (type === 'error' ? 'alert' : 'status') + '">' + icon(type === 'error' ? 'fa-circle-exclamation' : type === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-check') + '<span></span></div>');
    t.querySelector('span').textContent = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, ms || (type === 'error' ? 7000 : 3200));
  }

  var stack = [];
  function focusables(el) { return $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null; }); }
  function dialog(o) {
    var id = 'dlg-' + Math.random().toString(36).slice(2, 7);
    var el = h('<div class="dlg-wrap"><div class="dlg-backdrop"></div><div class="dlg' + (o.wide ? ' dlg-wide' : '') + (o.cls ? ' ' + o.cls : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '-t"><header class="dlg-head"><h2 id="' + id + '-t">' + esc(o.title) + '</h2><button type="button" class="icon-btn" data-dlg-close aria-label="Close dialog">' + icon('fa-xmark') + '</button></header><div class="dlg-body"></div><footer class="dlg-foot" hidden></footer></div></div>');
    var body = $('.dlg-body', el), foot = $('.dlg-foot', el), prev = document.activeElement;
    if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    (o.actions || []).forEach(function (a) {
      var b = h('<button type="button" class="btn ' + (a.primary ? 'primary' : a.danger ? 'danger' : 'ghost') + '">' + (a.icon ? icon(a.icon) : '') + '<span></span></button>');
      b.querySelector('span').textContent = a.label;
      b.addEventListener('click', function () { var r = a.onClick ? a.onClick(api) : undefined; if (r !== false) api.close(a.value); });
      foot.appendChild(b); foot.hidden = false;
    });
    var api = {
      el: el, body: body,
      close: function (v) {
        if (!el.isConnected) return; el.remove(); stack.splice(stack.indexOf(api), 1);
        document.removeEventListener('keydown', onKey, true);
        if (o.onClose) o.onClose(v);
        if (prev && prev.focus && prev.isConnected) prev.focus();
      }
    };
    function onKey(e) {
      if (stack[stack.length - 1] !== api) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); api.close(); }
      if (e.key === 'Tab') {
        var f = focusables($('.dlg', el)); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    el.addEventListener('click', function (e) { if (e.target.closest('[data-dlg-close]') || e.target.classList.contains('dlg-backdrop')) api.close(); });
    document.addEventListener('keydown', onKey, true);
    $('#dialogRoot').appendChild(el); stack.push(api);
    var first = o.initialFocus ? $(o.initialFocus, el) : (focusables(body)[0] || $('[data-dlg-close]', el));
    setTimeout(function () { if (first) first.focus(); }, 30);
    return api;
  }
  function confirmDialog(o) {
    return new Promise(function (res) {
      var p = document.createElement('p'); p.className = 'dlg-msg'; p.textContent = o.message;
      dialog({ title: o.title || 'Are you sure?', body: p, onClose: function (v) { res(v === true); },
        actions: [{ label: o.cancel || 'Cancel', value: false }, { label: o.confirm || 'Confirm', value: true, primary: !o.danger, danger: !!o.danger }] });
    });
  }
  function promptDialog(o) {
    return new Promise(function (res) {
      var f = h('<form class="field"><label for="pd-in"></label><input id="pd-in" class="input" maxlength="120"></form>');
      $('label', f).textContent = o.label; $('input', f).value = o.value || '';
      var result = null, d = dialog({ title: o.title, body: f, initialFocus: '#pd-in', onClose: function () { res(result); },
        actions: [{ label: 'Cancel' }, { label: o.ok || 'Save', primary: true, onClick: function () { result = $('input', f).value.trim() || null; } }] });
      f.addEventListener('submit', function (e) { e.preventDefault(); result = $('input', f).value.trim() || null; d.close(); });
    });
  }
  function copyText(text, btn) {
    function done(ok) {
      if (btn) { var s = btn.querySelector('span') || btn, old = s.textContent; s.textContent = ok ? 'Copied' : 'Press Ctrl+C'; setTimeout(function () { s.textContent = old; }, 1800); }
      if (!ok) toast('Copy was blocked by the browser. Select the code and press Ctrl+C (⌘C on Mac).', 'warn');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { } ta.remove(); done(ok);
    }
  }
  function fmtBytes(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB'; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); }; }

  K.ui = { $: $, $$: $$, h: h, icon: icon, esc: esc, toast: toast, dialog: dialog, confirm: confirmDialog, prompt: promptDialog, copyText: copyText, fmtBytes: fmtBytes, debounce: debounce };
})(window.KTM = window.KTM || {});
