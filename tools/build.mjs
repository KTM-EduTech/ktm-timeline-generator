// Build: inline all sources into one self-contained dist/index.html
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = f => fs.readFileSync(path.join(root, f), 'utf8');
const rtCss = r('src/runtime/timeline.css'), rtJs = r('src/runtime/timeline.js');
const order = ['model','themes','templates','store','ui','exporter','events-panel','design-panel','dialogs','app'];
const appJs = order.map(n => `/* ===== ${n}.js ===== */\n` + r(`src/app/js/${n}.js`)).join('\n');
const guard = (s, tag, name) => { if (new RegExp('</' + tag, 'i').test(s)) throw new Error(`${name} contains </${tag}`); return s; };
const LS = new RegExp(String.fromCharCode(0x2028), 'g'), PS = new RegExp(String.fromCharCode(0x2029), 'g');
const lit = s => JSON.stringify(s).replace(/<\//g, '<\\/').replace(LS, '\\u2028').replace(PS, '\\u2029');
let html = r('src/app/index.html');
const rep = (k, v) => { if (!html.includes(k)) throw new Error('missing ' + k); html = html.split(k).join(v); };
rep('/*@APP_CSS@*/', guard(r('src/app/app.css'), 'style', 'app.css'));
rep('/*@RUNTIME_SOURCE@*/', `window.__KTM_RT__={css:${lit(guard(rtCss,'style','timeline.css'))},js:${lit(guard(rtJs,'script','timeline.js'))}};`);
rep('/*@RUNTIME_JS@*/', rtJs);
rep('/*@APP_JS@*/', guard(appJs.replace(/<\/script/gi, '<\\/script'), 'script', 'app js'));
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log('dist/index.html', (html.length/1024).toFixed(1), 'KB');
