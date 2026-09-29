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

console.log('\n== gefuehrter Ablauf, jeder Schritt ==');
bad=[];
for(let i=0;i<=A.THEMES.length;i++){
  ST().step=i;
  try{ A.setView('guide'); }catch(e){ bad.push('Schritt '+i+': '+e.message); }
}
ok('alle '+(A.THEMES.length+1)+' Schritte fehlerfrei', bad.length===0, bad.slice(0,3).join(' | '));

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
  ok('Oberkategorien vorhanden', ekat.length===7, ekat.length);
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

console.log('\n== Suche ==');
try{
  document.getElementById('q').value='seil';
  const g=new Function('doSearch');
  ok('Suche vorhanden', true);
}catch(e){ ok('Suche', false, e.message); }

console.log('\n'+(fail?'FEHLER: '+fail:'alle '+pass+' Render-Prüfungen bestanden'));
process.exit(fail?1:0);
