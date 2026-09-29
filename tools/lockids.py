#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vergibt Item-Ids neu und friert sie ein.

Hintergrund: Die Id entsteht aus dem Quelltext der Checkliste. Wird ein Label
spaeter umformuliert — und rund 300 wurden das bei der Fragebogen-Ueberarbeitung —
bleibt die Id beim alten Wortlaut stehen. Das Ergebnis waren Ids wie
"kotspiel-scat-als-erheblich-hygienisch-riskantes-spezialinte" fuer das Label
"Kotspiel / Scat"; 54 davon mitten im Wort abgeschnitten. Diese Zeichenketten
stehen im JSON-Block jedes exportierten Profils.

Zwei Schritte:

  --init   einmalig vor dem ersten Release. Vergibt die Ids aus den aktuellen
           Labels neu, schreibt data/ids.lock und zieht alle Dateien nach, die
           Ids nennen. Bricht laufende Exporte — deshalb nur vor dem Release.

  (ohne)   Pruefmodus: meldet Abweichungen zwischen Lock und gebauten Daten.

Danach gilt: curate.py liest data/ids.lock und setzt die dort festgehaltene Id.
Ein Label darf sich ab jetzt aendern, ohne dass die Id mitwandert — genau das
braucht die Rueckwaertskompatibilitaet nach dem Release.
"""
import io, json, os, re, sys, glob, unicodedata, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCK = os.path.join(ROOT, 'data/ids.lock')
UML = {'ä':'ae','ö':'oe','ü':'ue','Ä':'ae','Ö':'oe','Ü':'ue','ß':'ss'}

def slug(s, maxlen=72):
    """Id aus einem Label. Wird gekuerzt, dann aber an einer Wortgrenze:
    "...ohne-veraenderung-der-at" ist als dauerhafte Id in jedem Export
    schlechter lesbar als "...ohne-veraenderung-der"."""
    s = ''.join(UML.get(c, c) for c in s)
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    if len(s) <= maxlen:
        return s
    cut = s[:maxlen]
    return (cut.rsplit('-', 1)[0] if '-' in cut else cut).rstrip('-')

def key_of(sec, it):
    """Stabiler Schluessel, unabhaengig vom Label: Quellindex, sonst Herkunfts-Slug.

    Nach der Umbenennung ist die Id nicht mehr die abgeleitete, der Schluessel
    also nicht mehr aus ihr zu berechnen — curate.py legt ihn deshalb ab."""
    if it.get('lockkey'):
        return it['lockkey']
    return '%s|n%d' % (sec, it['n']) if it.get('n') else '%s|i%s' % (sec, it['id'].split('/',1)[1])

def load_items():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data/items/*.json'))):
        d = json.load(io.open(f, encoding='utf-8'))
        for it in d['items']:
            out.append((d['section'], it))
    return out

def read_lock():
    m = {}
    if not os.path.exists(LOCK):
        return m
    for raw in io.open(LOCK, encoding='utf-8'):
        t = raw.strip()
        if not t or t.startswith('#!'):
            continue
        k, _, v = t.rpartition('|')   # der Schluessel enthaelt selbst ein '|'
        m[k.strip()] = v.strip()
    return m

# --------------------------------------------------------------------------- #

def init():
    items = load_items()
    mapping, lock = {}, {}
    perSec = collections.defaultdict(dict)
    for sec, it in items:
        new = sec + '/' + slug(it['de'])
        lock[key_of(sec, it)] = new
        if new != it['id']:
            mapping[it['id']] = new
        perSec[sec].setdefault(new, []).append(it['id'])

    coll = {s: {k: v for k, v in d.items() if len(v) > 1} for s, d in perSec.items()}
    coll = {s: d for s, d in coll.items() if d}
    if coll:
        print('ABBRUCH — die Neuvergabe waere nicht eindeutig:')
        for s, d in list(coll.items())[:8]:
            for k, v in d.items():
                print('  %s  <-  %s' % (k, ', '.join(v)))
        sys.exit(1)

    print('%d Items, %d Ids aendern sich' % (len(items), len(mapping)))

    # ---- Lock schreiben --------------------------------------------------- #
    L = ['#! Eingefrorene Item-Ids. Von tools/lockids.py erzeugt, von curate.py gelesen.',
         '#!',
         '#! Die Id eines Items steht hier und wird NICHT mehr aus dem Label abgeleitet.',
         '#! Damit darf ein Label umformuliert werden, ohne dass aeltere Exporte brechen.',
         '#! Schluessel: <sektion>|n<Quellindex>  bzw.  <sektion>|i<Slug aus curation.txt>',
         '#!',
         '#! Neue Items traegt curate.py selbst nach. Verschwindet ein Eintrag, verlangt',
         '#! der Bau einen Eintrag in data/migrations.txt.',
         '']
    for k in sorted(lock):
        L.append('%-58s | %s' % (k, lock[k]))
    io.open(LOCK, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    print('data/ids.lock: %d Eintraege' % len(lock))

    if not mapping:
        return

    # ---- Volle Ids in allen Dateien ersetzen ------------------------------- #
    targets = ['data/audit-exempt.txt', 'data/einstieg.txt', 'data/einstieg-kopplung.txt',
               'data/migrations.txt', 'src/app.5.js', 'tools/test/run.js',
               'tools/test/compare.js', 'tools/test/render.js', 'tools/test/migrate.js',
               'tools/test/rollen.js', 'tools/test/storage.js']
    # Wortgrenzen sind hier keine Kosmetik: "…/safeword" ist ein Praefix von
    # "…/safeword-vereinbaren". Ohne die Grenze ersetzt ein zweiter Lauf mitten
    # in einer bereits umbenannten Id und macht daraus
    # "safeword-vereinbaren-vereinbaren".
    rx = re.compile(r'(?<![-\w/])(?:' +
                    '|'.join(re.escape(k) for k in sorted(mapping, key=len, reverse=True)) +
                    r')(?![-\w])')
    for rel in targets:
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        t = io.open(p, encoding='utf-8').read()
        n = len(rx.findall(t))
        if not n:
            continue
        io.open(p, 'w', encoding='utf-8').write(rx.sub(lambda m: mapping[m.group(0)], t))
        print('  %-34s %3d Ersetzungen' % (rel, n))

    # ---- Content-Dateien: dort ist der Schluessel der nackte Slug ---------- #
    bySec = collections.defaultdict(dict)
    for old, new in mapping.items():
        s, o = old.split('/', 1)
        bySec[s][o] = new.split('/', 1)[1]
    tot = 0
    for sec, m in bySec.items():
        p = os.path.join(ROOT, 'data/content', sec + '.txt')
        if not os.path.exists(p):
            continue
        out, n = [], 0
        for raw in io.open(p, encoding='utf-8'):
            t = raw.rstrip('\n')
            if t.strip().startswith('#') or '|' not in t:
                out.append(t); continue
            head, _, rest = t.partition('|')
            k = head.strip()   # nackter Slug, exakter Vergleich — kein Teilstring
            if k in m:
                out.append('%s |%s' % (m[k], rest)); n += 1
            else:
                out.append(t)
        if n:
            io.open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
            tot += n
    print('  %-34s %3d Schluessel' % ('data/content/*.txt', tot))

# --------------------------------------------------------------------------- #

def check():
    lock = read_lock()
    if not lock:
        print('data/ids.lock fehlt — einmalig "lockids.py --init" laufen lassen.')
        sys.exit(1)
    items = load_items()
    bad = [(k, lock[k], it['id']) for k, it in
           ((key_of(s, i), i) for s, i in items) if k in lock and lock[k] != it['id']]
    neu = [k for k, it in ((key_of(s, i), i) for s, i in items) if k not in lock]
    weg = set(lock) - {key_of(s, i) for s, i in items}
    print('Lock: %d Eintraege, gebaut: %d Items' % (len(lock), len(items)))
    print('  abweichend: %d   neu: %d   verschwunden: %d' % (len(bad), len(neu), len(weg)))
    for k, a, b in bad[:8]:
        print('    %s  Lock %s  gebaut %s' % (k, a, b))
    if weg:
        for k in sorted(weg)[:8]:
            print('    verschwunden: %s -> %s' % (k, lock[k]))
    sys.exit(1 if (bad or weg) else 0)

if __name__ == '__main__':
    init() if '--init' in sys.argv else check()
