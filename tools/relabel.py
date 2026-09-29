#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Schreibt neue Labels und Erklaerungen in data/content/*.txt.

Eingabe ueber stdin, eine Zeile je Item:
  <sektion> | <slug> | <DE Label> | <EN Label> | <DE Erklaerung> | <EN explanation>

„-" in einem Feld laesst den vorhandenen Wert stehen. Die Id bleibt unveraendert:
sie steht in data/ids.lock und wird nicht mehr aus dem Label abgeleitet. Das
deutsche Label geht ins fuenfte Feld der Inhaltsdatei.
"""
import io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEEP = '-'
cache, changed, err = {}, 0, []

def load(sid):
    if sid not in cache:
        p = os.path.join(ROOT, 'data/content', sid + '.txt')
        if not os.path.exists(p):
            err.append('keine Inhaltsdatei: %s' % sid); return None
        items = json.load(io.open(os.path.join(ROOT, 'data/items', sid + '.json'),
                                 encoding='utf-8'))['items']
        cache[sid] = [io.open(p, encoding='utf-8').read(),
                      {it['id'].split('/', 1)[1]: it for it in items}, p]
    return cache[sid]

for lno, raw in enumerate(sys.stdin, 1):
    line = raw.strip()
    if not line or line.startswith('#'):
        continue
    f = [x.strip() for x in line.split('|')]
    if len(f) < 4:
        err.append('Zeile %d: zu wenige Felder' % lno); continue
    sid, slug = f[0], f[1]
    c = load(sid)
    if c is None: continue
    txt, byslug, path = c
    if slug not in byslug:
        err.append('Zeile %d: %s/%s unbekannt' % (lno, sid, slug)); continue
    # Inhaltsdateien sind ausschliesslich nach Slug geschluesselt. Aeltere
    # Zeilen trugen das deutsche Label als Schluessel; die werden hier mit
    # umgestellt, falls doch noch eine auftaucht.
    old = byslug[slug]['de']
    pat = re.compile(r'^(%s|%s) \|(.*)$' % (re.escape(slug), re.escape(old)), re.M)
    m = pat.search(txt)
    if not m:
        # Neues Item: Zeile anlegen statt zu scheitern.
        if not txt.endswith('\n'): txt += '\n'
        txt += '%s | | | |\n' % slug
        cache[sid][0] = txt
        m = pat.search(txt)
        if not m:
            err.append('Zeile %d: %s/%s konnte nicht angelegt werden' % (lno, sid, slug))
            continue
    cur = [x.strip() for x in m.group(2).split('|')]
    while len(cur) < 4: cur.append('')
    de, en = f[2], f[3]
    xde = f[4] if len(f) > 4 else KEEP
    xen = f[5] if len(f) > 5 else KEEP
    new = '%s | %s | %s | %s | %s' % (
        slug,
        cur[0] if en == KEEP else en,
        cur[1] if xde == KEEP else xde,
        cur[2] if xen == KEEP else xen,
        old if de == KEEP else de)
    cache[sid][0] = txt[:m.start()] + new + txt[m.end():]
    changed += 1

for sid, (txt, _, path) in cache.items():
    io.open(path, 'w', encoding='utf-8').write(txt)
if err:
    print('FEHLER (%d):' % len(err))
    for e in err[:25]: print('  ' + e)
    sys.exit(1)
print('%d Items umformuliert in %d Sektionen' % (changed, len(cache)))
