#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft, dass jede im Code oder in den Datendateien genannte Item-Id existiert.

Anlass: bei der Neuvergabe der Ids blieb eine Stelle unentdeckt, weil app.5.js
die Id aus Praefix und nacktem Slug zusammensetzte — "'sektion/'+k". Ein solcher
Verweis bricht lautlos: der Querverweis findet nichts und meldet auch nichts.

Erlaubt sind nur Ids aus data/ids.lock, dazu die in data/migrations.txt
verzeichneten (die gehoeren zu aelteren Fassungen) und die Testattrappen.
"""
import io, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATTRAPPE = re.compile(r'/(entfernt-|hiess-frueher-anders|gibt-es-nicht)')

def ids_aus_lock():
    out = set()
    for raw in io.open(os.path.join(ROOT, 'data/ids.lock'), encoding='utf-8'):
        t = raw.strip()
        if t and not t.startswith('#!'):
            out.add(t.rpartition('|')[2].strip())
    return out

def main():
    gueltig = ids_aus_lock()
    sektionen = {i.split('/')[0] for i in gueltig}
    mig = ''
    mp = os.path.join(ROOT, 'data/migrations.txt')
    if os.path.exists(mp):
        mig = io.open(mp, encoding='utf-8').read()

    dateien = (['src/app.%d.js' % i for i in (1, 2, 3, 4, 5, 6)] +
               sorted(glob.glob(os.path.join(ROOT, 'tools/test/*.js'))) +
               ['data/audit-exempt.txt', 'data/einstieg.txt',
                'data/einstieg-kopplung.txt'])

    VOLL = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*/[a-z0-9]+(?:-[a-z0-9]+)*")
    # "'sektion/'+variable" — der Verweis, der den Fehler ermoeglicht hat
    ZUSAMMEN = re.compile(r"'([a-z0-9-]+)/'\s*\+")

    fehler, zusammengesetzt = [], []
    for rel in dateien:
        p = rel if os.path.isabs(rel) else os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        name = os.path.relpath(p, ROOT)
        t = io.open(p, encoding='utf-8').read()
        for m in ZUSAMMEN.finditer(t):
            if m.group(1) in sektionen:
                zusammengesetzt.append((name, m.group(1)))
        for tok in sorted(set(VOLL.findall(t))):
            if tok in gueltig or tok.split('/')[0] not in sektionen:
                continue
            if ATTRAPPE.search(tok) or tok in mig:
                continue
            fehler.append((name, tok))

    if zusammengesetzt:
        print('Id wird aus Praefix und Variable zusammengesetzt — so bleibt ein')
        print('Umbenennen unbemerkt. Bitte die volle Id ausschreiben:')
        for n, s in zusammengesetzt:
            print('  %-24s %s/…' % (n, s))
    if fehler:
        print('Unbekannte Item-Ids:')
        for n, tok in fehler:
            print('  %-24s %s' % (n, tok))
    if fehler or zusammengesetzt:
        sys.exit(1)
    print('Id-Verweise: alle %d gepruefte Nennungen gueltig' % len(gueltig))

if __name__ == '__main__':
    main()
