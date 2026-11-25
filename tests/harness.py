import os, re, json
from playwright.sync_api import sync_playwright
ROOT = '/home/claude/ktm-timeline'
NM = ROOT + '/tools/node_modules'
PNG1 = bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010806000000'+'1f15c4890000000d49444154789c6360f8cfc0f01f0005000201a5f4b3c30000000049454e44ae426082')
def route(r):
    u = r.request.url
    if 'cdnjs.cloudflare.com' in u and 'font-awesome' in u:
        if u.endswith('.css'):
            return r.fulfill(path=NM + '/@fortawesome/fontawesome-free/css/all.min.css', content_type='text/css', headers={'access-control-allow-origin':'*'})
        name = u.split('/webfonts/')[-1].split('?')[0]
        return r.fulfill(path=NM + '/@fortawesome/fontawesome-free/webfonts/' + name, headers={'access-control-allow-origin':'*'})
    if 'html2canvas' in u:
        return r.fulfill(path=NM + '/html2canvas/dist/html2canvas.min.js', content_type='application/javascript', headers={'access-control-allow-origin':'*'})
    if 'fonts.googleapis.com' in u:
        return r.fulfill(body='/* fonts stub */', content_type='text/css', headers={'access-control-allow-origin':'*'})
    if 'imagekit.io' in u or 'example-cors.test' in u:
        return r.fulfill(body=PNG1, content_type='image/png', headers={'access-control-allow-origin':'*'})
    if 'no-cors.test' in u:
        return r.fulfill(body=PNG1, content_type='image/png')
    if u.startswith('http://localhost') or u.startswith('data:') or u.startswith('blob:') or u.startswith('about:'):
        return r.continue_()
    return r.abort()
def launch(p, **kw):
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(**kw)
    ctx.route('**/*', route)
    return b, ctx
