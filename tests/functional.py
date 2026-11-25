import sys, json, time; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
R = []
def check(name, ok, info=''):
    R.append((name, bool(ok), info)); print(('PASS ' if ok else 'FAIL ') + name + (' — ' + str(info) if info else ''))
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1440,'height':900}, accept_downloads=True)
    pg = ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
    pg.on('console', lambda m: errs.append('console: '+m.text) if m.type=='error' else None)
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(1500)
    fr = pg.frame_locator('#previewFrame')
    n0 = pg.evaluate('KTM.app.P().events.length')
    # --- create
    pg.click('#btnAddEvent'); pg.wait_for_timeout(300)
    pg.keyboard.type('Test <b>Event</b>')
    sel = pg.evaluate('KTM.app.state.selected')
    pg.fill(f'#f-{sel}-date-start', '1999'); pg.wait_for_timeout(400)
    check('create event', pg.evaluate('KTM.app.P().events.length') == n0+1)
    t = fr.locator(f'.ktm-tl__item[data-id="{sel}"] .ktm-tl__title').inner_text()
    check('edit title reflected in preview (escaped)', t == 'Test <b>Event</b>', t)
    check('date shown in preview', '1999' in fr.locator(f'.ktm-tl__item[data-id="{sel}"]').inner_text())
    # description, category, highlight
    pg.fill(f'#f-{sel}-description', 'Para one.\n\nPara two.')
    pg.select_option(f'#f-{sel}-categoryId', index=1)
    pg.check(f'#f-{sel}-highlight'); pg.wait_for_timeout(300)
    check('description paragraphs', fr.locator(f'.ktm-tl__item[data-id="{sel}"] .ktm-tl__desc p').count() == 2)
    check('highlight badge', fr.locator(f'.ktm-tl__item[data-id="{sel}"] .ktm-tl__badge').count() == 1)
    # invalid date hint
    pg.fill(f'#f-{sel}-date-start', '19x9'); pg.wait_for_timeout(200)
    check('invalid date hint shown', 'Not a recognised' in pg.locator(f'li[data-id="{sel}"] [data-hint=date]').inner_text())
    pg.fill(f'#f-{sel}-date-start', '1999')
    # custom label
    pg.select_option(f'#f-{sel}-date-type', 'label'); pg.fill(f'#f-{sel}-date-label', 'Late 1990s'); pg.fill(f'#f-{sel}-date-sortYear', '1997'); pg.wait_for_timeout(300)
    check('custom date label', 'Late 1990s' in fr.locator(f'.ktm-tl__item[data-id="{sel}"]').inner_text())
    # xss attempts
    pg.click(f'li[data-id="{sel}"] summary:has-text("External link")')
    pg.fill(f'#f-{sel}-link-url', 'javascript:alert(1)'); pg.wait_for_timeout(200)
    check('javascript: link rejected', pg.evaluate(f'KTM.app.P().events.find(e=>e.id=="{sel}").link.url') == '')
    pg.fill(f'#f-{sel}-link-url', 'https://example.org/x'); pg.fill(f'#f-{sel}-link-label', 'Read "more"'); pg.wait_for_timeout(300)
    a = fr.locator(f'.ktm-tl__item[data-id="{sel}"] a.ktm-tl__link')
    check('external link rendered safely', a.get_attribute('href') == 'https://example.org/x' and a.get_attribute('rel') == 'noopener noreferrer' and a.get_attribute('target') == '_blank')
    # duplicate
    pg.click(f'li[data-id="{sel}"] [data-act=dup]'); pg.wait_for_timeout(300)
    check('duplicate event', pg.evaluate('KTM.app.P().events.length') == n0+2)
    dup = pg.evaluate('KTM.app.state.selected')
    check('duplicate has new id + copy title', dup != sel and pg.evaluate(f'KTM.app.P().events.find(e=>e.id=="{dup}").title').endswith('(copy)'))
    # reorder up
    idx = lambda i: pg.evaluate(f'KTM.app.P().events.findIndex(e=>e.id=="{i}")')
    before = idx(dup); pg.click(f'li[data-id="{dup}"] [data-act=up]'); pg.wait_for_timeout(200)
    check('move up', idx(dup) == before-1)
    # keyboard reorder
    pg.focus(f'li[data-id="{dup}"] .ev-toggle'); pg.keyboard.press('Alt+ArrowDown'); pg.wait_for_timeout(200)
    check('Alt+Down moves', idx(dup) == before)
    # drag and drop: move first item to after third
    first = pg.evaluate('KTM.app.P().events[0].id'); third = pg.evaluate('KTM.app.P().events[2].id')
    pg.locator(f'li[data-id="{first}"] .ev-head').drag_to(pg.locator(f'li[data-id="{third}"] .ev-head'), target_position={'x':100,'y':40})
    pg.wait_for_timeout(300)
    check('drag and drop reorder', idx(first) == 2, idx(first))
    # preview order matches
    order_ok = pg.evaluate("KTM.app.P().events.map(e=>e.id).join()") == ','.join(fr.locator('.ktm-tl__item').evaluate_all('els=>els.map(e=>e.dataset.id)'))
    check('preview order matches data', order_ok)
    # sort chronologically
    pg.select_option('#sortSelect', 'chrono'); pg.wait_for_timeout(300)
    keys = pg.evaluate('KTM.app.P().events.map(e=>KTMTimeline.sortKey(e))')
    check('chronological sort', all(keys[i] <= keys[i+1] for i in range(len(keys)-1)), keys)
    # undo sort / redo
    pg.locator('body').click(position={'x':700,'y':5}) if False else None
    pg.click('#btnUndo'); pg.wait_for_timeout(200)
    keys2 = pg.evaluate('KTM.app.P().events.map(e=>KTMTimeline.sortKey(e))')
    check('undo restores order', keys2 != keys)
    pg.click('#btnRedo'); pg.wait_for_timeout(200)
    check('redo', pg.evaluate('KTM.app.P().events.map(e=>KTMTimeline.sortKey(e))') == keys)
    # delete with confirm (cancel then confirm)
    pg.click(f'li[data-id="{dup}"] [data-act=del]'); pg.wait_for_timeout(200)
    pg.click('.dlg-foot .btn.ghost'); pg.wait_for_timeout(200)
    check('delete cancel keeps event', idx(dup) >= 0)
    pg.click(f'li[data-id="{dup}"] [data-act=del]'); pg.wait_for_timeout(200)
    pg.click('.dlg-foot .btn.danger'); pg.wait_for_timeout(300)
    check('delete confirmed', idx(dup) == -1)
    # search in list
    pg.fill('#eventSearch', 'transistor'); pg.wait_for_timeout(200)
    check('list search filters', pg.locator('#eventList li.ev:not([hidden])').count() == 1)
    pg.fill('#eventSearch', '')
    # layout switching keeps data
    snap = pg.evaluate('JSON.stringify(KTM.app.P().events)')
    for lay in ['single','horizontal','cards','roadmap','compact','alternating']:
        pg.click(f'[data-layout="{lay}"]'); pg.wait_for_timeout(250)
        c = fr.locator('.ktm-tl__item').count()
        check(f'layout {lay} renders all events', c == pg.evaluate('KTM.app.P().events.length') and fr.locator(f'.ktm-tl--{lay}').count()==1, c)
    check('layout switching preserves events', snap == pg.evaluate('JSON.stringify(KTM.app.P().events)'))
    # theme presets
    for pid in ['dark','pastel','ktm']:
        pg.click(f'[data-preset="{pid}"]'); pg.wait_for_timeout(200)
    bg = fr.locator('#ktm-timeline').evaluate('e=>getComputedStyle(e).getPropertyValue("--tl-bg")')
    check('preset applied', bg.strip().upper() == '#F8F9FB', bg)
    # colour + typography change
    pg.click('.ds-head[aria-controls=ds-colors]'); pg.fill('#c-design-colors-line-h', '#FF0000'); pg.wait_for_timeout(300)
    check('colour HEX input updates preview', fr.locator('#ktm-timeline').evaluate('e=>getComputedStyle(e).getPropertyValue("--tl-line")').strip().upper() == '#FF0000')
    pg.click('.ds-head[aria-controls=ds-type]'); pg.select_option('#c-design-typography-family', 'Lexend'); pg.wait_for_timeout(300)
    check('font change updates preview + loads font link', 'Lexend' in fr.locator('#ktm-timeline').evaluate('e=>getComputedStyle(e).fontFamily') and fr.locator('#ktm-tl-fonts').evaluate('e=>e.href').find('Lexend')>0)
    pg.click('.ds-head[aria-controls=ds-type]')
    # reset section
    pg.click('[data-reset=colors]'); pg.wait_for_timeout(200)
    check('reset section', pg.evaluate('KTM.app.P().design.colors.line') == '#232450')
    # responsive preview
    pg.click('[data-device=mobile]'); pg.wait_for_timeout(500)
    check('mobile preview narrow class', fr.locator('#ktm-timeline.is-narrow').count()==1)
    pg.click('[data-device=desktop]'); pg.wait_for_timeout(300)
    # click in preview selects event
    target = pg.evaluate('KTM.app.P().events[3].id')
    fr.locator(f'.ktm-tl__item[data-id="{target}"] .ktm-tl__title').click(); pg.wait_for_timeout(300)
    check('click preview selects event in editor', pg.evaluate('KTM.app.state.selected') == target and pg.locator(f'li[data-id="{target}"] .ev-form').is_visible())
    # categories
    pg.click('summary:has-text("Categories")'); pg.click('#btnAddCat'); pg.wait_for_timeout(200)
    check('add category', pg.evaluate('KTM.app.P().categories.length') == 4)
    # autosave + reload
    pg.wait_for_timeout(1300)
    pid = pg.evaluate('KTM.app.P().id'); cnt = pg.evaluate('KTM.app.P().events.length'); line = pg.evaluate('KTM.app.P().design.colors.line')
    pg.reload(); pg.wait_for_timeout(1500)
    check('LocalStorage persistence after reload', pg.evaluate('KTM.app.P().id')==pid and pg.evaluate('KTM.app.P().events.length')==cnt)
    # JSON export via download
    pg.click('#btnExport'); pg.click('[data-tab=json]')
    with pg.expect_download() as d: pg.click('#jsonDl')
    path = d.value.path(); data = json.load(open(path))
    check('JSON export has schema+version', data['schema']=='ktm-timeline' and data['version']==1 and len(data['events'])==cnt)
    # HTML export download
    pg.click('[data-tab=html]')
    with pg.expect_download() as d2: pg.click('#xHtmlDl')
    hpath = ROOT+'/tests/export.html'; d2.value.save_as(hpath)
    check('HTML export downloaded', os.path.getsize(hpath) > 20000, os.path.getsize(hpath))
    # source zip
    pg.click('[data-tab=source]')
    with pg.expect_download() as d3: pg.click('#srcZip')
    zpath = ROOT+'/tests/source.zip'; d3.value.save_as(zpath)
    import zipfile; z = zipfile.ZipFile(zpath); names = z.namelist(); bad = z.testzip()
    check('source zip valid', bad is None and set(['index.html','timeline.css','timeline.js']).issubset(names), names)
    z.extractall(ROOT+'/tests/source')
    # Google Sites
    pg.click('[data-tab=gsites]'); pg.fill('#gsUrl', 'http://insecure.example'); pg.wait_for_timeout(100)
    check('gsites rejects http', 'https' in pg.locator('#gsCheck').inner_text())
    pg.fill('#gsUrl', 'https://kyd.github.io/timeline.html'); pg.fill('#gsH', '950'); pg.wait_for_timeout(100)
    code = pg.locator('#gsCode').input_value()
    check('gsites iframe code', 'src="https://kyd.github.io/timeline.html"' in code and 'height="950"' in code and 'width="100%"' in code and 'title=' in code, code.replace('\n',' '))
    pg.click('#gsTest'); pg.wait_for_timeout(1500)
    tf = pg.frame_locator('.gs-test')
    check('sandboxed iframe test renders + JS works', tf.locator('.ktm-tl__item').count()==cnt)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # PNG
    pg.click('#btnExport'); pg.click('[data-tab=png]'); pg.click('#pngGo')
    pg.wait_for_selector('#pngDl, .callout.bad', timeout=60000)
    ok = pg.locator('#pngDl').count()==1
    info = pg.locator('#pngOut').inner_text()
    check('PNG export', ok, info.replace('\n',' '))
    if ok:
        with pg.expect_download() as d4: pg.click('#pngDl')
        d4.value.save_as(ROOT+'/tests/shots/export.png')
    pg.keyboard.press('Escape')
    # JSON import roundtrip as copy
    with pg.expect_file_chooser() as fc: pg.click('#btnImport')
    fc.value.set_files(path); pg.wait_for_timeout(500)
    pg.click('.dlg-foot .btn.primary'); pg.wait_for_timeout(600)
    check('import as copy', pg.evaluate('KTM.app.P().id') != pid and pg.evaluate('KTM.app.P().events.length') == cnt and len(pg.evaluate('KTM.store.list()')) >= 2)
    # invalid imports
    bad1 = ROOT+'/tests/bad1.json'; open(bad1,'w').write('{"schema":"ktm-timeline","version":99}')
    with pg.expect_file_chooser() as fc: pg.click('#btnImport')
    fc.value.set_files(bad1); pg.wait_for_timeout(400)
    check('newer version rejected', 'newer' in pg.locator('.toast').last.inner_text())
    bad2 = ROOT+'/tests/bad2.json'; open(bad2,'w').write('not json')
    with pg.expect_file_chooser() as fc: pg.click('#btnImport')
    fc.value.set_files(bad2); pg.wait_for_timeout(400)
    check('invalid JSON rejected', 'not valid JSON' in pg.locator('.toast').last.inner_text())
    evil = {'schema':'ktm-timeline','version':1,'name':'Evil','events':[{'title':'<img src=x onerror=alert(1)>','description':'<script>alert(2)</script>','link':{'url':'javascript:alert(3)'},'image':{'url':'javascript:alert(4)'},'icon':'"><script>','date':{'type':'year','start':'1900'}}],'design':{'colors':{'line':'red;}</style><script>alert(5)</script>'}, 'typography':{'family':'x"</style><script>alert(6)</script>'}}}
    bad3 = ROOT+'/tests/evil.json'; json.dump(evil, open(bad3,'w'))
    with pg.expect_file_chooser() as fc: pg.click('#btnImport')
    fc.value.set_files(bad3); pg.wait_for_timeout(700)
    ev = pg.evaluate('KTM.app.P().events[0]')
    check('malicious import sanitised', ev['link']['url']=='' and ev['image']['url']=='' and ev['icon']=='' and pg.evaluate('KTM.app.P().design.colors.line')=='#232450')
    check('no script elements injected in preview', fr.locator('#ktm-timeline script, #ktm-timeline img[onerror]').count()==0)
    evhtml = pg.evaluate("KTM.exporter.buildDocument(KTM.app.P(),{mode:'export'})")
    check('export escapes </script> in data', evhtml.count('<script>alert') == 0)
    # templates create new project without overwrite
    nproj = len(pg.evaluate('KTM.store.list()'))
    pg.click('#btnTemplates'); pg.click('[data-tpl=roadmap]'); pg.wait_for_timeout(800)
    check('template creates new project', len(pg.evaluate('KTM.store.list()')) == nproj+1 and pg.evaluate('KTM.app.P().layout.type')=='roadmap')
    # projects dialog: rename + delete
    pg.click('#btnProjects'); pg.wait_for_timeout(200)
    check('projects dialog lists projects', pg.locator('.proj-list li').count() == nproj+1)
    pg.keyboard.press('Escape')
    print('\nJS errors:', errs or 'none')
    b.close()
fails = [r for r in R if not r[1]]
print(f'\n{len(R)-len(fails)}/{len(R)} passed')
json.dump(R, open(ROOT+'/tests/functional-results.json','w'), indent=1)
