#!/usr/bin/env python3
"""Liest die beiden Quelldateien und legt Rohdaten in build/ ab.
Reine Extraktion, keine Kuratierung."""
import io, json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD   = os.path.join(ROOT, 'Umfassende BDSM- und Kink-Checkliste für einwilligende Erwachsene.md')
HTML = os.path.join(ROOT, 'Neigungs- und Grenzenliste (2).html')
OUT  = os.path.join(ROOT, 'build')

UML = {'ä':'ae','ö':'oe','ü':'ue','Ä':'ae','Ö':'oe','Ü':'ue','ß':'ss'}

def slug(s, maxlen=60):
    s = ''.join(UML.get(c, c) for c in s)
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = s.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:maxlen].rstrip('-')

def parse_md():
    """44 Sektionen, Items, Sektionshinweise, Quellen."""
    text = io.open(MD, encoding='utf-8').read()
    lines = text.split('\n')
    secs, refs, cur = [], [], None
    in_refs = False
    for ln in lines:
        t = ln.rstrip()
        if t.startswith('## '):
            title = t[3:].strip()
            if title == 'References':
                in_refs = True; cur = None; continue
            in_refs = False
            cur = {'title_de': title, 'id': slug(title), 'note_de': '', 'items': []}
            secs.append(cur); continue
        if in_refs:
            m = re.match(r'^(\d+)\.\s+\[(.+?)\]\((.+?)\)\s*-\s*(.*)$', t)
            if m:
                refs.append({'n': int(m.group(1)), 'title': m.group(2),
                             'url': m.group(3), 'snippet': m.group(4)})
            continue
        if cur is None:
            continue
        m = re.match(r'^- \[ \] (.+)$', t)
        if m:
            cur['items'].append(m.group(1).strip()); continue
        if t and not t.startswith('#') and not t.startswith('---'):
            cur['note_de'] = (cur['note_de'] + ' ' + t).strip()
    return secs, refs

def parse_html():
    """rawdata-Block des Vorgaengertools: Sektionstyp, Label, Erklaerung, AP-Flag."""
    text = io.open(HTML, encoding='utf-8').read()
    m = re.search(r'<script id="rawdata"[^>]*>(.*?)</script>', text, re.S)
    raw = m.group(1)
    secs, cur = [], None
    for ln in raw.split('\n'):
        t = ln.strip()
        if not t:
            continue
        if t.startswith('##SEC|'):
            p = t.split('|')
            cur = {'type': p[1], 'title_de': p[2], 'id': slug(p[2]),
                   'note_de': p[3] if len(p) > 3 else '', 'items': []}
            secs.append(cur); continue
        if cur is None:
            continue
        p = t.split('|')
        cur['items'].append({'de': p[0].strip(),
                             'expl_de': (p[1].strip() if len(p) > 1 else ''),
                             'ap': (len(p) > 2 and p[2].strip() == 'AP')})
    return secs

def main():
    os.makedirs(OUT, exist_ok=True)
    md_secs, refs = parse_md()
    old_secs = parse_html()

    # Nachschlagewerk: Label -> {expl, ap} aus dem Vorgaengertool
    lookup = {}
    for s in old_secs:
        for it in s['items']:
            k = slug(it['de'])
            if k not in lookup:
                lookup[k] = {'expl_de': it['expl_de'], 'ap': it['ap'],
                             'src_de': it['de'], 'src_sec': s['title_de']}

    for name, obj in [('md.json', {'sections': md_secs, 'references': refs}),
                      ('old.json', {'sections': old_secs}),
                      ('lookup.json', lookup)]:
        io.open(os.path.join(OUT, name), 'w', encoding='utf-8').write(
            json.dumps(obj, ensure_ascii=False, indent=1))

    print('md      : %d Sektionen, %d Items, %d Hinweise, %d Quellen' % (
        len(md_secs), sum(len(s['items']) for s in md_secs),
        sum(1 for s in md_secs if s['note_de']), len(refs)))
    print('old     : %d Sektionen, %d Items, %d mit Erklaerung, %d AP' % (
        len(old_secs), sum(len(s['items']) for s in old_secs),
        sum(1 for s in old_secs for i in s['items'] if i['expl_de']),
        sum(1 for s in old_secs for i in s['items'] if i['ap'])))
    # Treffer md-Item <-> altes Item ueber Slug
    hit = sum(1 for s in md_secs for lab in s['items'] if slug(lab) in lookup)
    print('Treffer : %d md-Items finden eine alte Erklaerung' % hit)

if __name__ == '__main__':
    main()
