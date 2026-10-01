#!/usr/bin/env python3
"""Fuegt englische Texte und Erklaerungen in die kuratierten Daten ein.

Quelle: data/content/<sektions-id>.txt   und   data/content/_themes.txt

  #SEC   | <EN Titel> | <EN Hinweis>
  #GRP   | <gruppen-id> | <EN Titel>
  <slug> | <EN Label> | <DE Erklaerung> | <EN explanation> | <DE Label, optional>

Der Slug ist der Teil der Id hinter dem Schraegstrich (data/ids.lock).

Das fuenfte Feld ist das deutsche Label. Fehlt es, gilt der Wortlaut aus der
Quellcheckliste. Es steht hier, weil rund 280 Items bei der Fragebogen-
Ueberarbeitung neu formuliert wurden — die Quelle bleibt unveraendert, damit
nachvollziehbar ist, woraus ein Item entstanden ist.

Frueher hatte das Feld einen zweiten Zweck: die Id aus dem alten Wortlaut retten.
Den gibt es nicht mehr, die Ids stehen in data/ids.lock. Ein fuenftes Feld, das
denselben Text wie die Quelle enthaelt, bewirkt also nichts und wird abgelehnt —
sonst sammeln sich Zeilen an, die Arbeit vortaeuschen.

  _themes.txt:  #THEME | <theme-id> | <EN Titel> | <EN Beschreibung der Oberkategorie>

Leere Felder lassen den vorhandenen Wert stehen. Laeuft nach curate.py.
"""
import io, json, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'data/content')
ERR = []

def split(line):
    return [x.strip() for x in line.split('|')]

def rollen(secs):
    """data/rollen.txt: eigene Rollenbezeichnungen je Item oder Sektion.

    Die Vorgabe „ausfuehrend/empfangend" trifft nur transitive Punkte. Bei einer
    Haltung wie „Knien" fuehrt die kniende Person aus — das liest sich verkehrt
    herum. Hier darf ein Item seine beiden Seiten selbst benennen."""
    path = os.path.join(ROOT, 'data/rollen.txt')
    if not os.path.exists(path):
        return {}, {}
    persec, peritem = {}, {}
    for lno, raw in enumerate(io.open(path, encoding='utf-8'), 1):
        t = raw.strip()
        if not t or t.startswith('#!'):
            continue
        p_ = [x.strip() for x in t.split('|')]
        if len(p_) != 6 or p_[0].upper() not in ('SEKTION', 'ITEM'):
            ERR.append('rollen.txt:%d erwartet 6 Felder, SEKTION oder ITEM' % lno); continue
        if not all(p_[2:]):
            ERR.append('rollen.txt:%d leeres Feld — ein Paar stimmt nur als Paar' % lno); continue
        wert = {'a': {'de': p_[2], 'en': p_[4]}, 'p': {'de': p_[3], 'en': p_[5]}}
        (persec if p_[0].upper() == 'SEKTION' else peritem)[p_[1]] = wert
    for k in persec:
        if k not in secs:
            ERR.append('rollen.txt: Sektion unbekannt: %s' % k)
    return persec, peritem


def main():
    tree = json.load(io.open(os.path.join(ROOT, 'data/tree.json'), encoding='utf-8'))
    secs = {s['id']: s for t in tree['themes'] for s in t['sections']}
    themes = {t['id']: t for t in tree['themes']}

    # --- Themen ---
    tf = os.path.join(CONTENT, '_themes.txt')
    if os.path.exists(tf):
        for lno, raw in enumerate(io.open(tf, encoding='utf-8'), 1):
            line = raw.strip()
            if not line or line.startswith('#!'):
                continue
            p = split(line)
            if p[0] == '#THEME':
                if p[1] not in themes:
                    ERR.append('_themes.txt:%d unbekanntes Thema %s' % (lno, p[1])); continue
                if len(p) > 2 and p[2]:
                    themes[p[1]]['title_en'] = p[2]
                if len(p) > 3 and p[3]:
                    themes[p[1]]['ekat_en'] = p[3]
            elif p[0] == '#EKAT':
                # Teilfrage im Einstieg: Sektion oder Sektion.Gruppe
                hit = [n for t in tree['themes'] for n in t.get('ekat_nodes', [])
                       if n['ref'] == p[1]]
                if not hit:
                    ERR.append('_themes.txt:%d unbekannte Einstiegsfrage %s' % (lno, p[1])); continue
                hit[0]['title_en'] = p[2] if len(p) > 2 else ''
                hit[0]['en'] = p[3] if len(p) > 3 else ''
            elif p[0] == '#CHOICE':
                opts = tree.get('choices', {}).get(p[1])
                if opts is None:
                    ERR.append('_themes.txt:%d unbekannter Antwortsatz %s' % (lno, p[1])); continue
                vals = [x.strip() for x in p[2].split(';') if x.strip()]
                for o in opts:
                    for v in vals:
                        k, _, rest = v.partition('=')
                        if k.strip() != o['v']:
                            continue
                        lab, _, desc = rest.partition('::')
                        if lab.strip(): o['label_en'] = lab.strip()
                        if desc.strip(): o['desc_en'] = desc.strip()
            else:
                ERR.append('_themes.txt:%d unbekannte Zeile' % lno)

    # --- Sektionen ---
    stats = {'en': 0, 'de_expl': 0, 'en_expl': 0, 'total': 0}
    ROLLEN_SEC, ROLLEN_ITEM = rollen(secs)
    for sid, sec in secs.items():
        path = os.path.join(ROOT, 'data/items', sid + '.json')
        d = json.load(io.open(path, encoding='utf-8'))
        by = {}
        for it in d['items']:
            by[it['id'].split('/', 1)[1]] = it
            # Frueher ging auch das deutsche Label als Schluessel. Das war
            # zirkulaer — dieselbe Datei setzt das Label ueber das fuenfte Feld
            # und benutzte es zugleich als Schluessel — und band die Datei an
            # einen Wortlaut, der sich aendern darf. Der Slug ist die Identitaet.
        cf = os.path.join(CONTENT, sid + '.txt')
        if os.path.exists(cf):
            seen = set()
            for lno, raw in enumerate(io.open(cf, encoding='utf-8'), 1):
                line = raw.rstrip('\n').strip()
                if not line or line.startswith('#!'):
                    continue
                p = split(line)
                W = '%s.txt:%d' % (sid, lno)
                if p[0] == '#SEC':
                    if len(p) > 1 and p[1]: sec['title_en'] = p[1]
                    if len(p) > 2 and p[2]: sec['note_en'] = p[2]
                    continue
                if p[0] == '#GRP':
                    g = [x for x in sec['groups'] if x['id'] == p[1]]
                    if not g: ERR.append('%s unbekannte Gruppe %s' % (W, p[1])); continue
                    if len(p) > 2 and p[2]: g[0]['title_en'] = p[2]
                    continue
                slug = p[0]
                if slug not in by:
                    ERR.append('%s unbekanntes Item %s' % (W, slug)); continue
                if slug in seen:
                    ERR.append('%s Item doppelt: %s' % (W, slug)); continue
                seen.add(slug)
                it = by[slug]
                if len(p) > 1 and p[1]: it['en'] = p[1]
                if len(p) > 2 and p[2]: it['expl_de'] = p[2]
                if len(p) > 3 and p[3]: it['expl_en'] = p[3]
                if len(p) > 4 and p[4]:
                    if p[4] == it.get('de_src', it['de']):
                        ERR.append('%s fuenftes Feld wiederholt nur den Quelltext '
                                   'und bewirkt nichts: %s' % (W, slug))
                    else:
                        it['de'] = p[4]
        for it in d['items']:
            # Eine Sektionsregel ueberspringt Punkte ohne Rollentrennung still;
            # ein ausdruecklicher ITEM-Eintrag dort ist dagegen ein Irrtum.
            r = ROLLEN_ITEM.get(it['id'])
            if r and not it['ap']:
                ERR.append('rollen.txt: %s ist nicht rollengetrennt' % it['id']); r = None
            if not r and it['ap']:
                r = ROLLEN_SEC.get(sid)
            if r:
                it['roles'] = r
        for it in d['items']:
            stats['total'] += 1
            if it.get('en'): stats['en'] += 1
            if it.get('expl_de'): stats['de_expl'] += 1
            if it.get('expl_en'): stats['en_expl'] += 1
        io.open(path, 'w', encoding='utf-8').write(
            json.dumps(d, ensure_ascii=False, indent=1))

    io.open(os.path.join(ROOT, 'data/tree.json'), 'w', encoding='utf-8').write(
        json.dumps(tree, ensure_ascii=False, indent=1))

    if ERR:
        print('FEHLER (%d):' % len(ERR))
        for e in ERR[:30]: print('  ' + e)
        sys.exit(1)

    n = stats['total']
    pc = lambda k: '%4d/%d  %5.1f%%' % (stats[k], n, 100.0 * stats[k] / n)
    print('Inhalte:  EN-Label %s   DE-Erklärung %s   EN-Erklärung %s'
          % (pc('en'), pc('de_expl'), pc('en_expl')))
    co = [o for v in tree.get('choices', {}).values() for o in v]
    if co:
        print('          Antwortsätze: %d Optionen, %d mit englischem Label, %d mit Beschreibung'
              % (len(co), sum(1 for o in co if o.get('label_en')),
                 sum(1 for o in co if o.get('desc_de'))))
    missT = [t['id'] for t in tree['themes'] if not t.get('title_en')]
    missS = [s for s in secs if not secs[s].get('title_en')]
    if missT: print('  Themen ohne EN-Titel: %d' % len(missT))
    if missS: print('  Sektionen ohne EN-Titel: %d  (%s%s)'
                    % (len(missS), ', '.join(sorted(missS)[:4]), ' …' if len(missS) > 4 else ''))

if __name__ == '__main__':
    main()
