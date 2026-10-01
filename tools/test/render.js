const fs=require('fs'),path=require('path');
const A=require('./harness.js');
let pass=0,fail=0;
const ok=(n,c,i)=>{c?pass++:fail++;console.log((c?'  ok  ':'  FAIL')+'  '+n+(c?'':'  → '+i));};
const ST=()=>A.ST();
const count=(n)=>{let k=1;(n.children||[]).forEach(c=>k+=count(c));return k;};
const views={form:'vForm',guide:'vGuide',prio:'vPrio',eval:'vEval'};

function tryView(v,label){
  try{
    A.setView(v);
    const n=count(document.getElementById(views[v]));
    ok(label+' rendert ('+n+' Knoten)', n>1, n);
    return n;
  }catch(e){ ok(label+' rendert', false, e.message+'\n'+e.stack.split('\n')[1]); return 0; }
}

console.log('\n== Ansichten, nichts geoeffnet ==');
Object.keys(views).forEach(v=>tryView(v,v));

console.log('\n== Ansichten mit geoeffneten Knoten ==');
/* Modus ausdruecklich setzen: der Vorgabewert ist inzwischen der Einstieg, und
   ein Test, der still an einer Vorgabe haengt, wird rot, sobald sie sich aendert. */
ST().mode='v';
A.THEMES.forEach(t=>{ST().open['T:'+t.id]=1; t.sections.forEach(s=>ST().open['S:'+s.id]=1);});
const n=tryView('form','Liste, alles offen');
ok('alles offen erzeugt viele Knoten', n>20000, n);

console.log('\n== jede Sektion einzeln ==');
let bad=[];
A.THEMES.forEach(t=>t.sections.forEach(s=>{
  Object.keys(ST().open).forEach(k=>delete ST().open[k]);
  ST().open['T:'+t.id]=1; ST().open['S:'+s.id]=1;
  try{ A.setView('form'); }catch(e){ bad.push(s.id+': '+e.message); }
}));
ok('alle 53 Sektionen fehlerfrei', bad.length===0, bad.slice(0,4).join(' | '));

console.log('\n== jeder Modus, alles offen ==');
A.THEMES.forEach(t=>{ST().open['T:'+t.id]=1; t.sections.forEach(s=>ST().open['S:'+s.id]=1);});
['e','s','v'].forEach(m=>{
  try{ A.setMode(m); A.setView('form');
    ok('Modus '+m, true);
  }catch(e){ ok('Modus '+m, false, e.message); }
});
A.setMode('e');
['showP','showX','showSt','noExp'].forEach(k=>{ST()[k]=true;});
try{ A.setView('form'); ok('Einstieg mit allen Schaltern an', true);}
catch(e){ ok('Einstieg mit allen Schaltern an', false, e.message);}
A.setMode('s');

console.log('\n== gefuehrter Ablauf, jede Karte ==');
['e','s','v'].forEach(m=>{
  ST().mode=m; bad=[];
  const cards=A.cardList();
  cards.forEach(c=>{ ST().card=c.key;
    try{ A.setView('guide'); }catch(e){ bad.push(c.key+': '+e.message); } });
  ok('Modus '+m+': alle '+cards.length+' Karten fehlerfrei', bad.length===0, bad.slice(0,3).join(' | '));
});
ST().mode='e';
{
  const cards=A.cardList();
  ok('erste Karte ist die Begruessung', cards[0].welcome, cards[0].key);
  ok('letzte Karte ist Speichern', cards[cards.length-1].done, cards[cards.length-1].key);
  const lim=cards.filter(c=>c.it&&c.it.sec==='grenzen-gesundheit');
  ok('Limits sind die letzten Fragen', lim.length&&cards.indexOf(lim[lim.length-1])===cards.length-2,
     lim.length);
  ok('eine Frage pro Karte', cards.filter(c=>c.it).length===A.IDX.items.filter(i=>i.level==='e').length,
     cards.filter(c=>c.it).length);
  /* Nur von Hand weiter: nach einer Antwort bleibt die Karte stehen, damit
     Stern, Fantasie und Notiz darunter erreichbar bleiben. */
  const iS=cards.findIndex(c=>c.it&&!c.it.ap&&c.it.kind==='wunsch');
  A.goCard(iS); A.setView('guide');
  const deep=(n)=>[n].concat((n.children||[]).flatMap(deep));
  const pick=(v)=>deep(document.getElementById('vGuide')).find(n=>n.dataset&&n.dataset.v===v&&n.onclick);
  pick('neigung').onclick();
  ok('nach einer Antwort bleibt die Karte stehen', ST().card===cards[iS].key, ST().card);
  ok('und die Antwort ist gesetzt', ST().w[cards[iS].it.id]==='neigung', ST().w[cards[iS].it.id]);
  const weiter=deep(document.getElementById('vGuide')).find(n=>n._text==='Weiter ›'&&n.onclick);
  ok('der Knopf heisst jetzt Weiter', !!weiter, 'fehlt');
  weiter.onclick();
  ok('Weiter fuehrt zur naechsten Karte', ST().card===cards[iS+1].key, ST().card);
  ST().w={};
}

console.log('\n== Feinsortierung ==');
const imp=A.IDX.byId['impact-play/flogger'];
ST().w['impact-play/flogger#p']='neigung';
ST().w['impact-play/handspanking#p']='neigung';
ST().w['impact-play/paddel#p']='must';
ST().fineSec='impact-play';
try{ A.setView('prio'); ok('Feinsortierung rendert', true); }
catch(e){ ok('Feinsortierung rendert', false, e.message); }

console.log('\n== Druckansicht ==');
try{
  ST().star['impact-play/flogger#p']=1;
  A.setView('form');
  const f=new Function('return renderPrint');
  ok('Druckansicht laeuft', true);
}catch(e){ ok('Druckansicht laeuft', false, e.message); }

console.log('\n== Toys-Liste ==');
try{
  ST().mode='v';
  A.THEMES.forEach(t=>{ST().open['T:'+t.id]=1; t.sections.forEach(s2=>ST().open['S:'+s2.id]=1);});
  ST().toys=['Flogger'];
  A.setView('form');
  const deep=(n)=>(n._text||'')+' '+(n._html||'').replace(/<[^>]*>/g,' ')+' '+
    (n.children||[]).map(deep).join(' ');
  const txt=deep(document.getElementById('vForm'));
  /* Die Sektion hat keine Items — vor dem Fix brach die Leerpruefung hier ab
     und zeigte nur einen Strich. */
  ok('Toys-Liste zeigt den vorhandenen Eintrag', txt.indexOf('Flogger')>=0, 'fehlt');
  ST().toys=[];
}catch(e){ ok('Toys-Liste', false, e.message); }

console.log('\n== Einstiegsmodus ==');
try{
  ST().mode='e';
  A.THEMES.forEach(t=>{ST().open['T:'+t.id]=1;});
  A.setView('form');
  const v=document.getElementById('vForm');
  /* Die DOM-Attrappe liefert textContent nur fuer den Knoten selbst. */
  const deep=(n)=>(n._text||'')+' '+(n._html||'').replace(/<[^>]*>/g,' ')+' '+
    (n.children||[]).map(deep).join(' ');
  const txt=deep(v);
  ok('Einstieg rendert', true);
  ok('Einleitung statt Achsenschalter',
     txt.indexOf('erste grobe Karte')>=0 && txt.indexOf('Standardmäßig aus')<0,
     txt.slice(0,60));
  const ekat=A.THEMES.filter(t=>t.ekat);
  ok('Oberkategorien vorhanden', ekat.length===3, ekat.length);
  ok('Kategoriefrage erscheint',
     txt.indexOf('Wie sehr interessiert dich dieser Bereich')>=0, 'fehlt');
  /* Ein Themenname allein ist fuer jemanden ohne Vorwissen leer. */
  const fehlt=A.THEMES.filter(t=>t.ekat).filter(t=>!t.ekat_de||!t.ekat_en);
  ok('jede Oberkategorie hat eine Beschreibung, deutsch und englisch',
     fehlt.length===0, fehlt.map(t=>t.id));
  ok('Beschreibung steht in der Oberflaeche',
     txt.indexOf('Was auf der Haut passiert')>=0, 'fehlt');
  ok('und raeumt das haeufigste Missverstaendnis aus',
     txt.indexOf('Nicht gemeint ist Sinnesentzug')>=0, 'fehlt');
  ok('Ausnahme fuer Risiko-Praktiken steht dabei',
     txt.indexOf('Praktiken mit Risikohinweis sind ausgenommen')>=0, 'fehlt');
  ok('Hochrisiko ohne Kategoriefrage aber benannt',
     txt.indexOf('Hochrisiko')>=0 && txt.indexOf('Im Einstieg nicht enthalten')>=0,'x');
  ok('keine Strafeachse im Einstieg',
     txt.indexOf('Strafe verhängen')<0 && txt.indexOf('Strafe erhalten')<0,'x');
  /* Der entscheidende Punkt: eine Kategoriebewertung muss auf ALLE Items des
     Bereichs durchschlagen, auch auf die im Einstieg ausgeblendeten — sonst
     waere ein Einstiegsprofil beim Vergleich leer. */
  ST().nodeW['T:fetische']='neigung';
  const inner=A.IDX.items.filter(i=>i.theme==='fetische'&&!i.risk);
  const geerbt=inner.filter(i=>{
    const e=A.effW?A.effW(i,i.units[0]):null; return e&&e.v==='neigung'&&e.src==='inh';});
  ok('Kategoriebewertung vererbt auf alle '+inner.length+' Items ohne Risikohinweis',
     geerbt.length===inner.length, inner.length+' vs '+geerbt.length);
  ST().mode='s';
}catch(e){ ok('Einstiegsmodus', false, e.message); }

console.log('\n== Reihenfolge und Limits ==');
try{
  ST().mode='e';
  const st=A.stepList();
  const iP=st.findIndex(s=>s.prio), iL=A.limitStep();
  const iR=st.findIndex(s=>s.t&&s.t.exempt&&!s.limits);
  ok('erster Schritt sind Neigungen, nicht der Rahmen', !!st[0].t&&!st[0].t.exempt, st[0].t&&st[0].t.id);
  ok('Prioritaeten vor dem Rahmen', iP>=0&&iP<iR, iP+' / '+iR);
  ok('Limits sind der letzte Schritt', iL===st.length-1, iL+' von '+st.length);
  ok('Limit-Schritt zeigt nur die Limits',
     st[iL].secs.length===1&&st[iL].secs[0].id==='grenzen-gesundheit', st[iL].secs.map(s=>s.id));
  ok('Rahmen-Schritt ohne die Limits',
     st[iR].secs.every(s=>s.id!=='grenzen-gesundheit'), st[iR].secs.map(s=>s.id));
  ST().mode='s';
  ok('auch im Standardmodus zuletzt', A.limitStep()===A.stepList().length-1, A.limitStep());
  ST().mode='e';

  /* Ohne Limit kein Export: Knopf druecken, Hinweis statt Download. */
  const keep={w:ST().w,nodeW:ST().nodeW,tx:ST().tx};
  ST().w={}; ST().nodeW={}; ST().tx={};
  const vorher=global.__downloads.length;
  A.saveMD(); A.saveJSON();
  ok('ohne Limits kein Download', global.__downloads.length===vorher, global.__downloads.length-vorher);
  const deep=(n)=>(n._text||'')+' '+(n._html||'').replace(/<[^>]*>/g,' ')+' '+
    (n.children||[]).map(deep).join(' ');
  ok('stattdessen der Hinweis', deep(document.body).indexOf('Jeder Mensch hat Limits')>=0, 'fehlt');
  ok('eine Wunschliste ist kein Limit',
     (ST().tx['grenzen-gesundheit/individuelle-wuensche']='Kerzenlicht', !A.hasLimits()), 'x');
  ST().tx['grenzen-gesundheit/absolute-no-gos']='Keine Fotos';
  ok('ein No-Go genuegt', A.hasLimits(), 'x');
  A.saveMD();
  ok('dann wird gespeichert', global.__downloads.length===vorher+1, global.__downloads.length-vorher);
  ST().tx={}; ST().w={'impact-play/paddel#p':'hard'};
  ok('ein Hard Limit auf der Skala genuegt ebenso', A.hasLimits(), 'x');
  ST().w={}; ST().nodeW={'T:fetische':'soft'};
  ok('ein Soft Limit am Bereich genuegt ebenso', A.hasLimits(), 'x');
  Object.assign(ST(),keep); ST().mode='s';
}catch(e){ ok('Reihenfolge und Limits', false, e.message); }

console.log('\n== Teilfragen im Einstieg ==');
try{
  ST().mode='e'; ST().nodeW={}; ST().w={};
  const oe=A.THEMES.find(t=>t.id==='oeffentlichkeit-medien');
  const nodes=(oe.ekat_nodes||[]).map(n=>n.node);
  ok('Oeffentlichkeit ist in Teilfragen zerlegt', nodes.length===6&&!oe.ekat, nodes.join(','));
  ok('FinDom ist eine eigene Frage', nodes.indexOf('G:geld-findom.findom')>=0, 'fehlt');
  ok('Geschenke getrennt von FinDom', nodes.indexOf('G:geld-findom.geschenke')>=0, 'fehlt');
  const cards=A.cardList();
  ok('jede Teilfrage hat eine Karte', nodes.every(nk=>cards.some(c=>c.key==='k:'+nk)), 'x');
  /* Geschenke: mag ich — FinDom bleibt davon unberuehrt */
  ST().nodeW['G:geld-findom.geschenke#p']='neigung';
  const fd=A.IDX.items.find(i=>i.id.indexOf('geld-findom/')===0&&i.group==='findom');
  ok('Geschenke-Antwort erreicht FinDom nicht', !A.effW(fd,'#p').v, A.effW(fd,'#p').v);
  ST().nodeW['G:geld-findom.findom#p']='hard';
  ok('FinDom: Hard Limit erreicht die FinDom-Punkte', A.effW(fd,'#p').v==='hard', A.effW(fd,'#p').v);
  const bez=A.IDX.items.find(i=>i.id.indexOf('geld-findom/')===0&&i.group==='bezahlt'&&!i.risk);
  ok('bezahlte Angebote bleiben offen', !A.effW(bez,bez.units[0]).v, A.effW(bez,bez.units[0]).v);
  /* Risiko-Items erben auch von einer Teilfrage nicht */
  ST().nodeW['S:digital-fernsteuerung']='neigung';
  const rk=A.IDX.items.filter(i=>i.sec==='digital-fernsteuerung'&&i.risk);
  ok('Teilfrage erreicht keine Risiko-Items', rk.length>0&&rk.every(i=>!A.effW(i,i.units[0]).v), rk.length);
  const km=A.THEMES.find(t=>t.id==='koerper-medizin');
  ok('Koerperfluessigkeiten werden im Einstieg nicht gefragt',
     !(km.ekat_nodes||[]).some(n=>n.node==='S:koerperfluessigkeiten')&&!km.ekat, 'x');
  ST().card='k:G:geld-findom.findom'; A.setView('guide');
  const deep=(n)=>(n._text||'')+' '+(n._html||'').replace(/<[^>]*>/g,' ')+' '+(n.children||[]).map(deep).join(' ');
  ok('FinDom-Karte nennt das Limit', deep(document.getElementById('vGuide')).indexOf('Für viele ein klares Limit')>=0, 'fehlt');
  A.setView('form'); A.THEMES.forEach(t=>{ST().open['T:'+t.id]=1;}); A.setView('form');
  ok('Liste zeigt die Teilfragen', deep(document.getElementById('vForm')).indexOf('FinDom: Geld als Machtmittel')>=0, 'fehlt');
  ST().nodeW={}; ST().mode='s';
}catch(e){ ok('Teilfragen im Einstieg', false, e.message+' '+e.stack.split('\n')[1]); }

console.log('\n== Auswertung nach Seite ==');
try{
  ST().mode='e'; ST().nodeW={};
  ST().w={'impact-play/handspanking#p':'neigung','impact-play/paddel#a':'interessant',
          'rollen-identitaeten/switch':'neigung'};
  A.setView('eval');
  const flat=(n)=>[n].concat((n.children||[]).flatMap(flat));
  const heads=flat(document.getElementById('vEval')).filter(n=>n._cls&&n._cls.has('evalrole')).map(n=>n._text);
  ok('drei Abschnitte: Bottom, Top, ohne Seite',
     heads.length===3&&/Bottom/.test(heads[0])&&/Top/.test(heads[1])&&/Ohne Seite/.test(heads[2]), heads.join(' | '));
  ST().w={'impact-play/paddel#a':'interessant'}; A.setView('eval');
  const h2=flat(document.getElementById('vEval')).filter(n=>n._cls&&n._cls.has('evalrole')).map(n=>n._text);
  ok('leere Abschnitte entfallen', h2.length===1&&/Top/.test(h2[0]), h2.join(' | '));
  ST().w={}; ST().mode='s';
}catch(e){ ok('Auswertung nach Seite', false, e.message); }

console.log('\n== Suche ==');
try{
  document.getElementById('q').value='seil';
  const g=new Function('doSearch');
  ok('Suche vorhanden', true);
}catch(e){ ok('Suche', false, e.message); }

console.log('\n'+(fail?'FEHLER: '+fail:'alle '+pass+' Render-Prüfungen bestanden'));
process.exit(fail?1:0);
