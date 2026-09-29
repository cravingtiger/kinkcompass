#!/usr/bin/env python3
"""Setzt aus src/ und data/ die eine eigenstaendige HTML-Datei zusammen."""
import io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXEMPT = {'rahmen-sicherheit'}          # SPEC § 3: keine Vererbung (gekuerzt wird gekoppelt)
OUT = os.path.join(ROOT, 'KinkCompass.html')

def main():
    tree = json.load(io.open(os.path.join(ROOT, 'data/tree.json'), encoding='utf-8'))
    items, drop = {}, {}
    for t in tree['themes']:
        t['exempt'] = t['id'] in EXEMPT
        for s in t['sections']:
            d = json.load(io.open(os.path.join(ROOT, 'data/items', s['id'] + '.json'),
                                  encoding='utf-8'))
            for it in d['items']:
                # lockkey ist ein Bauartefakt (data/ids.lock), zur Laufzeit
                # nutzlos und in 1557 Items rund 47 KB in der Verteildatei.
                for k in ('n', 'expl_from_old', 'lockkey', 'de_src'):
                    it.pop(k, None)
            items[s['id']] = {'items': d['items'], 'dropped': d.get('dropped', [])}
    refs = json.load(io.open(os.path.join(ROOT, 'build/md.json'), encoding='utf-8'))['references']

    # Migrationen: alte Id -> neue Id (oder None, wenn entfernt)
    mig, mreason = {}, {}
    mpath = os.path.join(ROOT, 'data/migrations.txt')
    if os.path.exists(mpath):
        known = set(it['id'] for v in items.values() for it in v['items'])
        for lno, raw in enumerate(io.open(mpath, encoding='utf-8'), 1):
            line = raw.strip()
            if not line or line.startswith('#!'):
                continue
            p2 = [x.strip() for x in line.split('|')]
            if p2[0] == 'REMOVE':
                mig[p2[1]] = None
                mreason[p2[1]] = p2[2] if len(p2) > 2 else ''
            elif p2[0] == 'RENAME':
                if not p2[2].startswith(('T:', 'S:', 'G:')) and p2[2] not in known:
                    raise SystemExit('migrations.txt:%d Ziel unbekannt: %s' % (lno, p2[2]))
                mig[p2[1]] = p2[2]
                mreason[p2[1]] = p2[3] if len(p2) > 3 else ''
            else:
                raise SystemExit('migrations.txt:%d unbekannte Zeile' % lno)
            if p2[1] in known:
                raise SystemExit('migrations.txt:%d "%s" existiert noch — '
                                 'Migration nur fuer entfernte oder umbenannte Ids'
                                 % (lno, p2[1]))

    data = {'tree': tree, 'items': items, 'refs': refs,
            'migrations': mig, 'migrationReasons': mreason}
    blob = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    if '</script' in blob.lower():
        blob = re.sub(r'(?i)</script', r'<\\/script', blob)

    parts = [io.open(os.path.join(ROOT, 'src', n), encoding='utf-8').read()
             for n in ('app.head.html', 'app.body.html')]
    html = parts[0] + parts[1] + '\n<script>const DATA=' + blob + ';</script>\n'
    for n in ('app.1.js', 'app.2.js', 'app.3.js', 'app.5.js', 'app.6.js', 'app.4.js'):
        html += io.open(os.path.join(ROOT, 'src', n), encoding='utf-8').read()

    # Sanity: jede Top-Level-Funktion genau einmal definiert
    import collections as _c
    defs = _c.Counter(re.findall(r'^function ([A-Za-z_$][\w$]*)\s*\(', html, re.M))
    dupes = [k for k, v in defs.items() if v > 1]
    if dupes:
        raise SystemExit('Funktion mehrfach definiert: %s' % ', '.join(sorted(dupes)))
    called = set(re.findall(r'\b([A-Za-z_$][\w$]*)\s*\(', html))
    known = set(defs) | set(re.findall(r'^const ([A-Za-z_$][\w$]*)\s*=\s*\(', html, re.M))
    io.open(OUT, 'w', encoding='utf-8').write(html)
    n = sum(len(v['items']) for v in items.values())
    print('KinkCompass.html  %.0f KB  ·  %d Themen, %d Sektionen, %d Items, %d Quellen, '
          '%d Migrationen'
          % (len(html.encode('utf-8')) / 1024.0, len(tree['themes']),
             sum(len(t['sections']) for t in tree['themes']), n, len(refs), len(mig)))

if __name__ == '__main__':
    main()
