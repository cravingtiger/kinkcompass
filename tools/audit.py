#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft die Item-Formulierungen gegen gaengige Regeln der Fragebogenkonstruktion."""
import io, json, glob, re, collections, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
items=[]
for f in glob.glob(os.path.join(ROOT,'data/items/*.json')):
    d=json.load(io.open(f,encoding='utf-8'))
    for it in d['items']:
        it['_type']=d['type']; items.append(it)
scale=[i for i in items if i['_type'] in ('scale','vereinbarung')]

QUAL=re.compile(r'\b(nur|ausschließlich|ausdrücklich|vorher|vorab|sofern|innerhalb|'
                r'im Rahmen|nach genauer|bei gesonderter|ohne reale|mit sicher|'
                r'in sicher|klar begrenzt|zeitlich begrenzt|kontrolliert|einvernehmlich|'
                r'vereinbart|zulässig|geprüft|freigegeben|gesichert)\b', re.I)
NEG=re.compile(r'^(Keine?n?|Nicht)\b|\bkein\b|ausgeschlossen|vermeiden', re.I)
DOPPEL=re.compile(r'\b\w+\s+(und|oder)\s+\w+')
LEIT=re.compile(r'\b(einvernehmlich|sicher(?![nt])|kontrolliert|harmlos|zulässig|legitim|'
                r'unproblematisch|vertrauenswürdig|qualifiziert)\w*\b', re.I)

EX={}
exf=os.path.join(ROOT,'data/audit-exempt.txt')
if os.path.exists(exf):
    for lno,raw in enumerate(io.open(exf,encoding='utf-8'),1):
        t=raw.strip()
        if not t or t.startswith('#!'): continue
        if '|' not in t:
            print('audit-exempt.txt:%d Eintrag ohne Begruendung'%lno); sys.exit(1)
        k,_,why=t.partition('|')
        EX[k.strip()]=why.strip()

FAIL=[]
def rep(name, hits, total, beispiele=3):
    hits=[h for h in hits if h['id'] not in EX]
    FAIL.extend((name,h['de']) for h in hits)
    print('%-46s %4d von %d  (%4.1f %%)'%(name,len(hits),total,100.0*len(hits)/total))
    for h in hits[:beispiele]:
        print('      %s'%h['de'][:96])

n=len(scale)
print('Bewertbare Items (scale + vereinbarung): %d\n'%n)
rep('Verneinung im Label', [i for i in scale if NEG.search(i['de'])], n)
rep('Eingebauter Vorbehalt („nur …", „vorher …")',
    [i for i in scale if QUAL.search(i['de'])], n)
rep('Wertende Wortwahl im Label', [i for i in scale if LEIT.search(i['de'])], n)
rep('Zwei Dinge in einem Item („X und Y")',
    [i for i in scale if DOPPEL.search(i['de'])], n)
lang=[i for i in scale if len(i['de'])>60]
rep('Label länger als 60 Zeichen', lang, n)
sehr=[i for i in scale if len(i['de'])>85]
rep('Label länger als 85 Zeichen', sehr, n)

# Vereinbarungs-Items: die Skala liefert die Modalitaet. Ein Modalverb im Label
# legt eine zweite darueber („Ziele duerfen gesenkt werden" + „verbindlich").
MODAL=re.compile(r'\b(darf|dürfen|soll|sollen|muss|müssen|kann|können|wird|werden|'
                 r'bleibt|bleiben|entfällt|entfallen|gilt|gelten|ist|sind|hat|haben)\b', re.I)
ver=[i for i in items if i['_type']=='vereinbarung'
     and not (i.get('scale') and i['scale']!='vereinbarung')]
def satzform(lab):
    # Infinitivphrase: das Verb steht am Ende („Safeword vereinbaren").
    # Satz: ein finites Verb mitten im Label („Ziele duerfen gesenkt werden").
    w = re.findall(r'[\wÄÖÜäöüß-]+', lab)
    for k, tok in enumerate(w):
        if MODAL.match(tok) and k < len(w) - 1:
            return True
    return False
rep('Satzform statt Infinitiv im Vereinbarungs-Label',
    [i for i in ver if satzform(i['de'])], max(len(ver), 1))

# Wo das Label die Richtung schon nennt („… werden", „… lassen"), ist
# „ausfuehrend" widersinnig. Solche Items duerfen nicht rollengetrennt sein.
RICHT=re.compile(r'\b(werden|lassen|bekommen|empfangen)\b', re.I)
rep('Richtung im Label, trotzdem rollengetrennt',
    [i for i in scale if i.get('ap') and RICHT.search(i['de'])], max(len(scale),1))

L=[len(i['de']) for i in scale]
L.sort()
print('\nLänge der Labels: Median %d, 90. Perzentil %d, Maximum %d Zeichen'
      %(L[len(L)//2], L[int(len(L)*0.9)], L[-1]))

print('\nGleiche Labels in mehreren Sektionen:')
c=collections.Counter(i['de'] for i in items)
d=[(k,v) for k,v in c.items() if v>1]
print('  %d Labels, %d Items betroffen'%(len(d), sum(v for _,v in d)))

print('\nSehr ähnliche Labels innerhalb einer Sektion:')
def norm(s):
    s=s.lower()
    for a,b in [('ä','ae'),('ö','oe'),('ü','ue'),('ß','ss')]: s=s.replace(a,b)
    return set(re.findall(r'[a-z]{4,}',s))
bysec=collections.defaultdict(list)
for i in scale: bysec[i['id'].split('/',1)[0]].append(i)
paare=0
for sid,g in bysec.items():
    for a in range(len(g)):
        for b in range(a+1,len(g)):
            x,y=norm(g[a]['de']),norm(g[b]['de'])
            if not x or not y: continue
            j=len(x&y)/float(len(x|y))
            if j>=0.6:
                paare+=1
                if paare<=6: print('      %-44s ~ %s'%(g[a]['de'][:44],g[b]['de'][:44]))
print('  %d Paare mit hoher Wortüberschneidung'%paare)

print('\nAntwortformate: %s'%dict(collections.Counter(i['_type'] for i in items)))

unused=[k for k in EX if k not in {i['id'] for i in items}]
if unused:
    print('\nAusnahmen ohne passendes Item (%d): %s'%(len(unused),', '.join(unused[:5])))
    FAIL.append(('veraltete Ausnahme',unused[0]))
print('\nAusnahmen mit Begruendung: %d'%len(EX))

# ---------------------------------------------------------------------------
# Einstiegsmodus: keine Risikoflaggen, und Schutz folgt dem Risiko.
# ---------------------------------------------------------------------------
print('\n== Einstiegsmodus ==')
ein=[i for i in items if i['level']=='e']
print('Items im Einstieg: %d'%len(ein))
riskig=[i for i in ein if i['risk']]
if riskig:
    FAIL.append(('Einstieg: Item mit Risikoflagge',
                 ', '.join(i['id'] for i in riskig[:6])))
    print('  FEHLER: %d Items mit Risikoflagge'%len(riskig))
    for i in riskig[:6]: print('      [%s] %s'%(i['risk'],i['de'][:70]))
else:
    print('  kein Item mit Risikoflagge')

tree=json.load(io.open(os.path.join(ROOT,'data/tree.json'),encoding='utf-8'))
kat=[t for t in tree['themes'] if t.get('ekat')]
# Teilfragen (Sektion/Gruppe) pruefen wir mit denselben Regeln
for t in tree['themes']:
    for n in t.get('ekat_nodes',[]):
        kat.append({'id':n['ref'],'ekat_de':n['de'],'ekat_en':n['en'],
                    'title_en':n['title_en']})
ohne=[t['id'] for t in kat if not t.get('ekat_de') or not t.get('ekat_en')
      or ('title_en' in t and not t['title_en'])]
if ohne:
    FAIL.append(('Oberkategorie ohne Beschreibung', ', '.join(ohne)))
    print('  FEHLER: Oberkategorie ohne Beschreibung: %s'%', '.join(ohne))
else:
    print('  %d Oberkategorien, alle mit Beschreibung in beiden Sprachen'%len(kat))
nsw=sorted({i['id'].split('/')[0] for i in items if i.get('nosweep')})
print('  vom Bereichshaken ausgenommen: %d Items mit Risikohinweis, '
      'dazu die Sektionen %s'%(len([i for i in items if i['risk']]),
      ', '.join(nsw) or '(keine)'))
kurz=[t['id'] for t in kat if len(t.get('ekat_de',''))<60]
if kurz:
    FAIL.append(('Beschreibung zu knapp fuer Beispiele', ', '.join(kurz)))
    print('  FEHLER: Beschreibung nennt kaum Beispiele: %s'%', '.join(kurz))

def refmatch(ref, it):
    """sektion | sektion.gruppe | sektion/item-slug"""
    if '/' in ref: return it['id']==ref
    if '.' in ref:
        sid,_,gid=ref.partition('.')
        return it['id'].split('/')[0]==sid and it['group']==gid
    return it['id'].split('/')[0]==ref

kpath=os.path.join(ROOT,'data/einstieg-kopplung.txt')
recs, cur = [], None
for lno,raw in enumerate(io.open(kpath,encoding='utf-8'),1):
    t=raw.strip()
    if not t or t.startswith('#!'):
        if cur: recs.append(cur); cur=None
        continue
    if t.upper().startswith('SCHUTZ'):
        if cur: recs.append(cur)
        cur={'text':t,'lno':lno}
    elif cur:
        cur['text']+=' '+t
    else:
        print('einstieg-kopplung.txt:%d Zeile ohne SCHUTZ davor'%lno); sys.exit(1)
if cur: recs.append(cur)

verletzt=0
for r in recs:
    p_=[x.strip() for x in r['text'].split('|')]
    if len(p_)!=5 or p_[2].upper()!='WENN':
        print('einstieg-kopplung.txt:%d Formfehler'%r['lno']); sys.exit(1)
    if not p_[4]:
        print('einstieg-kopplung.txt:%d ohne Begruendung'%r['lno']); sys.exit(1)
    ziel=[x.strip() for x in p_[1].split(',') if x.strip()]
    aus =[x.strip() for x in p_[3].split(',') if x.strip()]
    for ref in ziel+aus:
        if not any(refmatch(ref,i) for i in items):
            print('einstieg-kopplung.txt:%d unbekannte Referenz: %s'%(r['lno'],ref))
            sys.exit(1)
    scharf=[i for i in ein if any(refmatch(x,i) for x in aus)]
    if not scharf: continue
    fehlt=[i for i in items
           if any(refmatch(x,i) for x in ziel) and i['level']!='e']
    if fehlt:
        verletzt+=1
        FAIL.append(('Einstieg: Schutz fehlt zum Risiko',
                     '%s ausgeloest durch %s'%(p_[1], scharf[0]['id'])))
        print('  FEHLER: %s steht nicht im Einstieg, obwohl %s dort steht'
              %(p_[1], scharf[0]['id']))
        for i in fehlt[:4]: print('      fehlt: %s'%i['id'])
print('  %d Kopplungsregeln geprueft, %d verletzt'%(len(recs),verletzt))
if FAIL:
    print('\nNICHT ABGEDECKT (%d):'%len(FAIL))
    for n,d in FAIL[:20]: print('  %-42s %s'%(n,d))
    sys.exit(1)
print('\nKeine unbegruendeten Formulierungsmaengel.')
