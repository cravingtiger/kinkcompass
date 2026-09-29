#!/usr/bin/env python3
"""Listet Slugs und deutsche Labels einer Sektion, zum Verfassen der Inhalte."""
import io,json,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for sid in sys.argv[1:]:
    p=os.path.join(ROOT,'data/items',sid+'.json')
    d=json.load(io.open(p,encoding='utf-8'))
    print('### %s  (%d)'%(sid,len(d['items'])))
    for it in d['items']:
        slug=it['id'].split('/',1)[1]
        mark=''
        if it.get('expl_de'): mark=' [hat DE-Erkl]'
        print('%s | %s%s'%(slug,it['de'],mark))
    print()
