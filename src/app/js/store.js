/* KTM Timeline — LocalStorage project storage and undo/redo history */
(function (K) {
  'use strict';
  var PFX = 'ktm-tlg:', IDX = PFX + 'index', LAST = PFX + 'last', PREF = PFX + 'prefs';
  var ok = (function () { try { var k = PFX + 't'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function isQuota(e) { return e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014); }
  function readJSON(k, def) { if (!ok) return def; try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function list() { var l = readJSON(IDX, []); return Array.isArray(l) ? l.filter(function (x) { return x && typeof x.id === 'string'; }) : []; }
  function writeIndex(l) { localStorage.setItem(IDX, JSON.stringify(l)); }
  function save(P) {
    if (!ok) return { ok: false, error: 'Browser storage is unavailable (private browsing or blocked by settings). Export your project as JSON to keep it.' };
    try {
      var json = JSON.stringify(P);
      localStorage.setItem(PFX + 'p:' + P.id, json);
      var l = list().filter(function (x) { return x.id !== P.id; });
      l.unshift({ id: P.id, name: P.name, updatedAt: P.updatedAt, events: P.events.length, layout: P.layout.type, size: json.length });
      writeIndex(l); localStorage.setItem(LAST, P.id);
      return { ok: true, size: json.length };
    } catch (e) {
      return { ok: false, quota: isQuota(e), error: isQuota(e) ? 'Browser storage is full. Large uploaded images use most of the space — use image URLs instead, delete old projects, or export this project as JSON.' : 'Could not save: ' + e.message };
    }
  }
  function load(id) {
    var raw = readJSON(PFX + 'p:' + id, null); if (!raw) return null;
    try { return K.model.validate(raw); } catch (e) { return null; }
  }
  function remove(id) { if (!ok) return; try { localStorage.removeItem(PFX + 'p:' + id); writeIndex(list().filter(function (x) { return x.id !== id; })); if (localStorage.getItem(LAST) === id) localStorage.removeItem(LAST); } catch (e) { } }
  function lastId() { if (!ok) return null; try { return localStorage.getItem(LAST); } catch (e) { return null; } }
  function usage() {
    if (!ok) return 0; var n = 0;
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PFX) === 0) n += (localStorage.getItem(k) || '').length + k.length; } } catch (e) { }
    return n * 2; // UTF-16 bytes
  }
  function prefs(p) {
    if (p === undefined) return readJSON(PREF, {});
    if (!ok) return; try { localStorage.setItem(PREF, JSON.stringify(p)); } catch (e) { }
  }

  function History(limit) { this.stack = []; this.i = -1; this.limit = limit || 120; this.key = null; this.t = 0; }
  History.prototype.reset = function (snap) { this.stack = [snap]; this.i = 0; this.key = null; };
  History.prototype.push = function (snap, key) {
    var now = Date.now();
    if (this.stack[this.i] === snap) return;
    if (key && key === this.key && now - this.t < 900 && this.i === this.stack.length - 1 && this.i > 0) { this.stack[this.i] = snap; this.t = now; return; }
    this.stack = this.stack.slice(0, this.i + 1); this.stack.push(snap);
    if (this.stack.length > this.limit) this.stack.shift();
    this.i = this.stack.length - 1; this.key = key || null; this.t = now;
  };
  History.prototype.canUndo = function () { return this.i > 0; };
  History.prototype.canRedo = function () { return this.i < this.stack.length - 1; };
  History.prototype.undo = function () { if (!this.canUndo()) return null; this.i--; this.key = null; return this.stack[this.i]; };
  History.prototype.redo = function () { if (!this.canRedo()) return null; this.i++; this.key = null; return this.stack[this.i]; };

  K.store = { available: ok, list: list, save: save, load: load, remove: remove, lastId: lastId, usage: usage, prefs: prefs };
  K.History = History;
})(window.KTM = window.KTM || {});
