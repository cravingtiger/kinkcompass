#!/usr/bin/env python3
"""Prueft die kuratierten Daten und schreibt data/TREE.md zur Durchsicht."""
import io, json, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tree = json.load(io.open(os.path.join(ROOT, 'data/tree.json'), encoding='utf-8'))
LV = {'e': 'Einstieg', 's': 'Standard', 'v': 'Vollständig'}

secs, allitems = {}, []
for t in tree['themes']:
    for s in t['sections']:
        d = json.load(io.open(os.path.join(ROOT, 'data/items', s['id'] + '.json'), encoding='utf-8'))
        secs[s['id']] = d
        allitems.extend(d['items'])

# --- Pruefungen ---
prob = []
ids = collections.Counter(i['id'] for i in allitems)
for k, v in ids.items():
    if v > 1: prob.append('Item-ID doppelt: %s (%dx)' % (k, v))
labels = collections.Counter(i['de'] for i in allitems)
dupl = {k: v for k, v in labels.items() if v > 1}
for t in tree['themes']:
    for s in t['sections']:
        gids = [g['id'] for g in s['groups']]
        if len(gids) != len(set(gids)): prob.append('Gruppen-ID doppelt in %s' % s['id'])
        have = {i['group'] for i in secs[s['id']]['items'] if i['group']}
        for g in have - set(gids): prob.append('%s: Item verweist auf unbekannte Gruppe %s' % (s['id'], g))
        if s['type'] == 'scale' and not s['groups'] and s['n']:
            prob.append('%s: scale-Sektion ohne Gruppen' % s['id'])

out = ['# Baum zur Durchsicht — Phase 1', '',
       'Erzeugt aus `data/curation.txt`. Reihenfolge = Reihenfolge im Fragebogen.', '',
       '`ap` = rollengetrennt (aktiv/passiv) · `E/S/V` = Einstieg / Standard / Vollständig · `!` = Risiko-Badge', '']
tot = collections.Counter(); risk = collections.Counter()
for t in sorted(tree['themes'], key=lambda x: x['order']):
    ni = sum(s['n'] for s in t['sections'])
    lv = collections.Counter(i['level'] for s in t['sections'] for i in secs[s['id']]['items'])
    out.append('## %d. %s' % (t['order'], t['title_de']))
    out.append('')
    out.append('%d Items — E %d · S %d · V %d' % (ni, lv['e'], lv['s'], lv['v']))
    out.append('')
    for s in t['sections']:
        d = secs[s['id']]
        ap = sum(1 for i in d['items'] if i['ap'])
        r = [i for i in d['items'] if i['risk']]
        risk.update(i['risk'] for i in r)
        tag = ' · **%d Risiko**' % len(r) if r else ''
        out.append('### %s  `%s`' % (s['title_de'], s['type']))
        out.append('')
        out.append('%d Items · %d rollengetrennt%s' % (s['n'], ap, tag))
        out.append('')
        for g in s['groups']:
            gi = [i for i in d['items'] if i['group'] == g['id']]
            if not gi: continue
            lvg = collections.Counter(i['level'] for i in gi)
            flags = 'ap' if gi[0]['ap'] else '—'
            lvs = ' '.join('%s%d' % (k.upper(), lvg[k]) for k in 'esv' if lvg[k])
            rn = sum(1 for i in gi if i['risk'])
            out.append('- **%s** (%d) · %s · %s%s' % (
                g['title_de'], len(gi), flags, lvs, ' · %d!' % rn if rn else ''))
        for dd in d.get('dropped', []):
            out.append('- *ausgelassen:* %s — %s' % (dd['de'], dd['reason']))
        out.append('')
    tot.update(lv)

n = sum(tot.values())
hdr = ['## Summe', '',
       '| | Items |', '|---|---|',
       '| Einstieg | %d |' % tot['e'],
       '| Standard (inkl. Einstieg) | %d |' % (tot['e'] + tot['s']),
       '| Vollständig | %d |' % n,
       '| Risiko hoch | %d |' % risk['hoch'],
       '| Risiko mittel | %d |' % risk['mittel'],
       '| rollengetrennt | %d |' % sum(1 for i in allitems if i['ap']),
       '| Erklärung vorhanden | %d |' % sum(1 for i in allitems if i['expl_de']),
       '| Labels, die in mehreren Sektionen vorkommen | %d |' % len(dupl), '']
if prob:
    hdr += ['## Probleme', ''] + ['- ' + p for p in prob] + ['']
else:
    hdr += ['Keine strukturellen Probleme gefunden.', '']
io.open(os.path.join(ROOT, 'data/TREE.md'), 'w', encoding='utf-8').write(
    '\n'.join(out[:5] + hdr + out[5:]))

print('Items %d | E %d | S+E %d | ap %d | Risiko hoch %d mittel %d'
      % (n, tot['e'], tot['e'] + tot['s'], sum(1 for i in allitems if i['ap']),
         risk['hoch'], risk['mittel']))
print('Mehrfach-Labels (sektionsübergreifend): %d — z.B. %s'
      % (len(dupl), ', '.join(sorted(dupl)[:8])))
print('Probleme: %d' % len(prob))
for p in prob[:10]: print('  ' + p)
