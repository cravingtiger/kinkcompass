#!/usr/bin/env python3
"""Liest data/curation.txt, prueft gegen build/md.json und baut data/items/*.json + data/tree.json.

Format von curation.txt (| als Trenner, Einrueckung nur Kosmetik):

  THEME | <id> | <Titel DE> | <order>
  SEC   | <quelle> | <sec-id> | <Titel DE> | <typ>
        quelle: "md:<exakter Sektionstitel>" | "old:<Sektionstitel>" | "new"
        typ:    scale | vereinbarung | angabe | auswahl | multi | text | toys
  GRP   | <indizes> | <grp-id> | <Titel DE> | ap|noap | e|s|v
        indizes: 1-5,9,12-14  (1-basiert, bezogen auf die Quellsektion)
  SET   | <indizes> | <schalter>      schalter: e|s|v | ap|noap | risk:<stufe>
  ITEM  | <slug> | <Label DE> | ap|noap | e|s|v      (fuer typ=new / Zusatzitems)

Die Ids stehen nicht hier, sondern in data/ids.lock. Sie entstehen zwar
urspruenglich aus dem Quelltext, werden aber eingefroren: ein Label darf
umformuliert werden, ohne dass die Id mitwandert — sonst braeche jeder aeltere
Export. Neue Items traegt dieser Lauf selbst nach. FLAG, SET und DROP in
curation.txt sprechen Items weiterhin ueber den aus dem Quelltext abgeleiteten
Slug an; die Umbenennung passiert danach.

Der Einstiegsmodus wird nicht hier, sondern in data/einstieg.txt festgelegt:
dort steht eine Liste von Item-IDs, und genau diese Items bekommen level "e".
Alle anderen werden auf mindestens "s" angehoben. Grund: welche Fragen ein
Mensch beim ersten Kontakt mit dem Thema sieht, ist eine Entscheidung ueber
den ganzen Bogen hinweg — die kann man nicht beurteilen, wenn sie ueber 264
GRP-Zeilen verstreut ist.
"""
import io, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UML = {'ä':'ae','ö':'oe','ü':'ue','Ä':'ae','Ö':'oe','Ü':'ue','ß':'ss'}
LEVELS = ('e', 's', 'v')

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

def idx(spec, n, where):
    out = []
    for part in spec.split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            a, b = part.split('-', 1)
            a, b = int(a), int(b)
            out.extend(range(a, b + 1))
        else:
            out.append(int(part))
    bad = [i for i in out if i < 1 or i > n]
    if bad:
        die('%s: Index %s liegt ausserhalb 1..%d' % (where, bad, n))
    return out

ERR = []
def die(msg):
    ERR.append(msg)

def main():
    md  = json.load(io.open(os.path.join(ROOT, 'build/md.json'), encoding='utf-8'))
    old = json.load(io.open(os.path.join(ROOT, 'build/old.json'), encoding='utf-8'))
    look= json.load(io.open(os.path.join(ROOT, 'build/lookup.json'), encoding='utf-8'))
    src = {'md:'  + s['title_de']: s for s in md['sections']}
    src.update({'old:' + s['title_de']: s for s in old['sections']})

    path = os.path.join(ROOT, 'data/curation.txt')
    themes, theme, sec, srcitems = [], None, None, None
    choices = {}
    seen_sec, seen_item = set(), set()

    for lno, raw in enumerate(io.open(path, encoding='utf-8'), 1):
        line = raw.strip()
        if not line or line.startswith('#!') or line.startswith('//'):
            continue
        p = [x.strip() for x in line.split('|')]
        kind = p[0].upper()
        W = 'Zeile %d' % lno

        if kind == 'THEME':
            theme = {'id': p[1], 'title_de': p[2], 'title_en': '',
                     'order': int(p[3]), 'sections': []}
            themes.append(theme); sec = None; continue

        if kind == 'SEC':
            if theme is None: die('%s: SEC ohne THEME' % W); continue
            source, sid, title, typ = p[1], p[2], p[3], p[4]
            if sid in seen_sec: die('%s: Sektions-ID doppelt: %s' % (W, sid))
            seen_sec.add(sid)
            if source == 'new':
                srcitems = []
            elif source in src:
                s0 = src[source]
                srcitems = ([{'de': x} for x in s0['items']]
                            if s0['items'] and isinstance(s0['items'][0], str)
                            else list(s0['items']))
            else:
                die('%s: Quelle unbekannt: %s' % (W, source)); srcitems = []
            note = src[source]['note_de'] if source in src else ''
            sec = {'id': sid, 'title_de': title, 'title_en': '', 'type': typ,
                   'source': source, 'note_de': note, 'note_en': '',
                   'groups': [], 'items': [], 'n_src': len(srcitems)}
            theme['sections'].append(sec); continue

        if kind == 'NOINHERIT':
            if sec is None: die('%s: NOINHERIT ohne SEC' % W); continue
            if len(p) < 2 or not p[1]: die('%s: NOINHERIT ohne Begruendung' % W); continue
            sec['noinherit'] = p[1]
            continue

        if kind == 'NOTE':
            if sec is None: die('%s: NOTE ohne SEC' % W); continue
            sec['note_de'] = (sec['note_de'] + ' ' + p[1]).strip()
            continue

        if kind == 'FLAG':
            if sec is None: die('%s: FLAG ohne SEC' % W); continue
            want = [x.strip() for x in p[1].split(',') if x.strip()]
            flag = p[2]
            for sl in want:
                iid = sec['id'] + '/' + sl
                hit = [it for it in sec['items'] if it['id'] == iid]
                if not hit: die('%s: FLAG findet Item nicht: %s' % (W, sl)); continue
                for it in hit:
                    if flag in LEVELS: it['level'] = flag
                    elif flag == 'ap': it['ap'] = True
                    elif flag == 'noap': it['ap'] = False
                    elif flag.startswith('risk:'): it['risk'] = flag.split(':', 1)[1]
                    else: die('%s: Schalter unbekannt: %s' % (W, flag))
            continue

        if kind == 'CHOICE':
            opts = []
            for o in p[2].split(';'):
                o = o.strip()
                if not o: continue
                if '=' not in o:
                    die('%s: Option ohne "=" : "%s" — vermutlich ein Semikolon in '
                        'einer Beschreibung; ";" trennt die Optionen und darf im Text '
                        'nicht vorkommen.' % (W, o))
                    continue
                k, v = o.split('=', 1)
                lab, _, desc = v.partition('::')
                opts.append({'v': k.strip(), 'label_de': lab.strip(),
                             'label_en': '', 'desc_de': desc.strip(), 'desc_en': ''})
            if p[1] in choices: die('%s: CHOICE doppelt: %s' % (W, p[1]))
            choices[p[1]] = opts
            continue

        if kind == 'GRPDEF':
            if sec is None: die('%s: GRPDEF ohne SEC' % W); continue
            sec['groups'].append({'id': p[1], 'title_de': p[2], 'title_en': ''})
            continue

        if kind == 'GRP':
            if sec is None: die('%s: GRP ohne SEC' % W); continue
            ii = idx(p[1], len(srcitems), W)
            gid, gtitle, apf, lvl = p[2], p[3], p[4], p[5]
            if apf not in ('ap', 'noap'): die('%s: ap-Flag "%s"' % (W, apf))
            if lvl not in LEVELS: die('%s: level "%s"' % (W, lvl))
            sec['groups'].append({'id': gid, 'title_de': gtitle, 'title_en': ''})
            for i in ii:
                it = srcitems[i - 1]
                iid = sec['id'] + '/' + slug(it['de'])
                if iid in seen_item: die('%s: Item-ID doppelt: %s' % (W, iid))
                seen_item.add(iid)
                hit = look.get(slug(it['de']), {})
                sec['items'].append({
                    'id': iid, 'n': i, 'group': gid,
                    'de': it['de'], 'en': '',
                    'expl_de': it.get('expl_de') or hit.get('expl_de', ''),
                    'expl_en': '',
                    'ap': (apf == 'ap'), 'level': lvl, 'risk': None, 'scale': None,
                    'expl_from_old': bool(hit.get('expl_de')) and not it.get('expl_de'),
                })
            continue

        if kind == 'DROP':
            if sec is None: die('%s: DROP ohne SEC' % W); continue
            if len(p) < 3 or not p[2]: die('%s: DROP ohne Begruendung' % W); continue
            for i in idx(p[1], len(srcitems), W):
                sec.setdefault('dropped', []).append(
                    {'n': i, 'de': srcitems[i - 1]['de'], 'reason': p[2]})
            continue

        if kind == 'SET':
            if sec is None: die('%s: SET ohne SEC' % W); continue
            ii = set(idx(p[1], len(srcitems), W)); flag = p[2]
            hits = [it for it in sec['items'] if it['n'] in ii]
            if len(hits) != len(ii):
                die('%s: SET trifft %d von %d Items (nicht gruppiert?)' % (W, len(hits), len(ii)))
            for it in hits:
                if flag in LEVELS: it['level'] = flag
                elif flag == 'ap': it['ap'] = True
                elif flag == 'noap': it['ap'] = False
                elif flag.startswith('risk:'): it['risk'] = flag.split(':', 1)[1]
                else: die('%s: Schalter unbekannt: %s' % (W, flag))
            continue

        if kind == 'ITEM':
            if sec is None: die('%s: ITEM ohne SEC' % W); continue
            iid = sec['id'] + '/' + p[1]
            if iid in seen_item: die('%s: Item-ID doppelt: %s' % (W, iid))
            seen_item.add(iid)
            gref = p[5] if len(p) > 5 else None
            if gref and gref not in [g['id'] for g in sec['groups']]:
                die('%s: Gruppe unbekannt: %s' % (W, gref))
            sc = p[6] if len(p) > 6 and p[6] else None
            if sc and sc not in choices and sc not in ('vereinbarung', 'angabe', 'text'):
                die('%s: Antwortsatz unbekannt: %s' % (W, sc))
            sec['items'].append({'id': iid, 'n': None, 'group': gref,
                'de': p[2], 'en': '', 'expl_de': '', 'expl_en': '',
                'ap': (p[3] == 'ap'), 'level': p[4], 'risk': None,
                'scale': sc, 'expl_from_old': False})
            continue

        die('%s: unbekannte Zeile: %s' % (W, kind))

    # ---- Eingefrorene Ids aus data/ids.lock -------------------------------
    lockp = os.path.join(ROOT, 'data/ids.lock')
    lock, newlock = {}, []
    if os.path.exists(lockp):
        for raw in io.open(lockp, encoding='utf-8'):
            t = raw.strip()
            if not t or t.startswith('#!'):
                continue
            k, _, v = t.rpartition('|')   # der Schluessel enthaelt selbst ein '|'
            lock[k.strip()] = v.strip()
    seen_key = set()
    for t in themes:
        for s in t['sections']:
            for it in s['items']:
                k = ('%s|n%d' % (s['id'], it['n'])) if it.get('n') \
                    else ('%s|i%s' % (s['id'], it['id'].split('/', 1)[1]))
                if k in seen_key:
                    die('Schluessel doppelt: %s' % k)
                seen_key.add(k)
                # Der Schluessel muss die Umbenennung ueberleben, sonst kann ihn
                # danach niemand mehr ausrechnen: die Id ist dann nicht mehr die
                # abgeleitete.
                it['lockkey'] = k
                # Der Wortlaut vor dem Einspielen der Inhalte. content.py
                # ueberschreibt it['de'] und laeuft manchmal zweimal — ohne
                # diesen Wert kann es hinterher nicht mehr unterscheiden, ob ein
                # fuenftes Feld etwas bewirkt oder sich nur selbst wiederholt.
                it['de_src'] = it['de']
                if k in lock:
                    it['id'] = lock[k]
                elif lock:
                    newlock.append((k, it['id']))
    if lock:
        fehlt = sorted(set(lock) - seen_key)
        mig = os.path.join(ROOT, 'data/migrations.txt')
        migtxt = io.open(mig, encoding='utf-8').read() if os.path.exists(mig) else ''
        for k in fehlt:
            if lock[k] not in migtxt:
                die('Item aus ids.lock ist verschwunden, ohne Eintrag in '
                    'migrations.txt: %s (%s)' % (lock[k], k))
        if newlock:
            with io.open(lockp, 'a', encoding='utf-8') as fh:
                for k, v in newlock:
                    fh.write('%-58s | %s\n' % (k, v))
            print('    data/ids.lock: %d neue Items nachgetragen' % len(newlock))
        dup = [v for v, c in
               __import__('collections').Counter(
                   it['id'] for t in themes for s in t['sections']
                   for it in s['items']).items() if c > 1]
        if dup:
            die('Id nach dem Lock doppelt: %s' % ', '.join(dup[:5]))

    # ---- Einstiegsmodus aus data/einstieg.txt ----------------------------
    epath = os.path.join(ROOT, 'data/einstieg.txt')
    ewant, ekat, ekat_de, eorder = set(), [], {}, {}
    nosweep, nsw_cur = {}, None
    for lno, raw in enumerate(io.open(epath, encoding='utf-8'), 1):
        line = raw.strip()
        if not line or line.startswith('#!'):
            continue
        if line.upper().startswith('NUR-EINZELN'):
            k = [x.strip() for x in line.split('|')]
            if len(k) < 3 or not k[2]:
                die('einstieg.txt Zeile %d: NUR-EINZELN ohne Begruendung' % lno)
                continue
            nosweep[k[1]] = k[2]; nsw_cur = k[1]
            continue
        if nsw_cur and not line.startswith('KATEGORIE') and '|' not in line \
           and not line.startswith('#'):
            nosweep[nsw_cur] += ' ' + line
            continue
        nsw_cur = None
        if line.upper().startswith('KATEGORIE'):
            k = [x.strip() for x in line.split('|')]
            if len(k) < 3 or not k[2]:
                die('einstieg.txt Zeile %d: KATEGORIE ohne Beschreibung. Ein '
                    'Themenname allein sagt jemandem ohne Vorwissen nichts.' % lno)
                continue
            ekat.append(k[1]); ekat_de[k[1]] = k[2]
            continue
        if line in ewant:
            die('einstieg.txt Zeile %d: doppelt: %s' % (lno, line))
        eorder[line] = lno
        ewant.add(line)
    allids = {it['id'] for t in themes for s in t['sections'] for it in s['items']}
    for i in sorted(ewant - allids):
        die('einstieg.txt: Item gibt es nicht: %s (Zeile %d)' % (i, eorder[i]))
    tids = {t['id'] for t in themes}
    for k in ekat:
        if k not in tids:
            die('einstieg.txt: KATEGORIE kennt den Themenbereich nicht: %s' % k)
    allsec = {s['id'] for t in themes for s in t['sections']}
    for k in nosweep:
        if k not in allsec:
            die('einstieg.txt: NUR-EINZELN kennt die Sektion nicht: %s' % k)
    for t in themes:
        for s in t['sections']:
            if s['id'] in nosweep:
                for it in s['items']:
                    it['nosweep'] = True
            for it in s['items']:
                if it['id'] in ewant:
                    it['level'] = 'e'
                elif it['level'] == 'e':
                    it['level'] = 's'
    # Eine Kategoriezeile ist nur dort sinnvoll, wo der Bereich sonst leer bleibt.
    for t in themes:
        if t['id'] not in ekat:
            continue
        if any(it['level'] == 'e' for s in t['sections'] for it in s['items']):
            die('einstieg.txt: KATEGORIE %s, aber der Bereich hat eigene '
                'Einstiegs-Items — dann waere die Kategoriezeile doppelt.' % t['id'])

    # Vollstaendigkeitspruefung: jedes Quellitem muss zugeordnet sein
    for t in themes:
        for s in t['sections']:
            if s['source'].startswith('md:') or s['source'].startswith('old:'):
                used = {it['n'] for it in s['items'] if it['n']}
                used |= {d['n'] for d in s.get('dropped', [])}
                missing = sorted(set(range(1, s['n_src'] + 1)) - used)
                if missing:
                    die('Sektion %s: %d Items ohne Gruppe: %s'
                        % (s['id'], len(missing), missing[:12]))

    if ERR:
        print('FEHLER (%d):' % len(ERR))
        for e in ERR[:40]: print('  ' + e)
        sys.exit(1)

    os.makedirs(os.path.join(ROOT, 'data/items'), exist_ok=True)
    tree = {'themes': [], 'choices': choices}
    tot = {'e': 0, 's': 0, 'v': 0}
    for t in themes:
        tn = {'id': t['id'], 'title_de': t['title_de'], 'title_en': '',
              'order': t['order'], 'sections': [],
              'ekat': t['id'] in ekat,
              'ekat_de': ekat_de.get(t['id'], ''), 'ekat_en': ''}
        for s in t['sections']:
            tn['sections'].append({'id': s['id'], 'title_de': s['title_de'],
                'title_en': '', 'type': s['type'], 'note_de': s['note_de'],
                'note_en': '', 'groups': s['groups'], 'n': len(s['items']),
                'noinherit': s.get('noinherit')})
            io.open(os.path.join(ROOT, 'data/items', s['id'] + '.json'), 'w',
                    encoding='utf-8').write(json.dumps(
                        {'section': s['id'], 'type': s['type'], 'items': s['items'],
                     'dropped': s.get('dropped', [])},
                        ensure_ascii=False, indent=1))
            for it in s['items']: tot[it['level']] += 1
        tree['themes'].append(tn)
    io.open(os.path.join(ROOT, 'data/tree.json'), 'w', encoding='utf-8').write(
        json.dumps(tree, ensure_ascii=False, indent=1))

    n = sum(tot.values())
    print('OK  %d Themenbereiche, %d Sektionen, %d Items' % (
        len(themes), sum(len(t['sections']) for t in themes), n))
    print('    Einstieg %d (+%d Oberkategorien)  |  Standard(+E) %d  |  Vollstaendig %d'
          % (tot['e'], len(ekat), tot['e'] + tot['s'], n))
    ndrop = sum(len(s.get('dropped', [])) for t in themes for s in t['sections'])
    if ndrop: print('    bewusst ausgelassen: %d (siehe data/items/*.json)' % ndrop)
    withexpl = sum(1 for t in themes for s in t['sections'] for it in s['items'] if it['expl_de'])
    print('    Erklaerungen vorhanden: %d' % withexpl)

if __name__ == '__main__':
    main()
