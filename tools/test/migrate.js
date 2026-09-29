/* Aeltere Exporte muessen lesbar, vergleichbar und verlustfrei bleiben. */
const A=require('./harness.js');
let pass=0,fail=0;
const ok=(n,c,i)=>{c?pass++:fail++;console.log((c?'  ok  ':'  FAIL')+'  '+n+(c?'':'  → '+JSON.stringify(i)));};
const ST=()=>A.ST();
/* Der Mechanismus wird mit eigenen Eintraegen geprueft, nicht mit dem, was
   gerade in data/migrations.txt steht. Die Datei beginnt mit dem ersten Release
   bei null; ein Test, der auf ihren Inhalt baut, waere am Tag des Release rot,
   ohne dass am Code etwas falsch waere. */
const WEG=['risikomodell/entfernt-eins','risikomodell/entfernt-zwei',
  'risikomodell/entfernt-drei','reale-machtverhaeltnisse/entfernt-vier',
  'reale-machtverhaeltnisse/entfernt-fuenf'];
const UMBENANNT='impact-play/hiess-frueher-anders';
const ZIEL='impact-play/flogger';
WEG.forEach(id=>{A.MIG[id]=null;});
A.MIG[UMBENANNT]=ZIEL;

console.log('== Voraussetzungen ==');
WEG.forEach(id=>ok('nicht mehr im Bestand: '+id, !A.IDX.byId[id], id));
ok('Migrationen sind eingebaut', Object.keys(A.MIG).length>=6, Object.keys(A.MIG).length);
WEG.forEach(id=>ok('Migration kennt '+id, Object.prototype.hasOwnProperty.call(A.MIG,id), id));
ok('Umbenennung ist eingetragen', A.MIG[UMBENANNT]===ZIEL, A.MIG[UMBENANNT]);
/* Die echte Datei muss trotzdem gueltig sein — leer ist gueltig. */
ok('data/migrations.txt zeigt auf nichts Unbekanntes',
   Object.keys(A.MIG).filter(k=>WEG.indexOf(k)<0&&k!==UMBENANNT)
     .every(k=>A.MIG[k]===null||!!A.IDX.byId[A.MIG[k]]), 'x');

console.log('\n== Alter Export wird geladen ==');
/* Zustand einer aelteren Fassung nachbauen */
Object.assign(ST(),A.BLANK(),{meta:{alias:'Altfall'},mode:'v'});
ST().ag['risikomodell/entfernt-eins']='verbindlich';
ST().ag['risikomodell/entfernt-zwei']='verbindlich';
ST().ag['reale-machtverhaeltnisse/entfernt-vier']='ja';
ST().ag['sicherheit-verhandlung/safeword-vereinbaren']='verbindlich';
ST().w['impact-play/flogger#p']='must';
ST().nodeW['G:impact-play.flogger-gerte#p']='neigung';
ST().nodeW['S:nicht-mehr-vorhanden']='must';
ST().star['impact-play/flogger#p']=1;
ST().rank=['impact-play/flogger#p','risikomodell/entfernt-eins'];
ST().multi['orientierung-sexuell']=['orientierung-sexuell/queer'];
const rep=A.migrateState(ST());
ok('drei entfernte Angaben erkannt', rep.removed===3, rep);
ok('unbekannter Knoten verworfen', rep.nodes===1, rep);
ok('gueltige Angaben bleiben', ST().ag['sicherheit-verhandlung/safeword-vereinbaren']==='verbindlich','x');
ok('rollenspezifische Gruppenbewertung ueberlebt',
   ST().nodeW['G:impact-play.flogger-gerte#p']==='neigung', ST().nodeW);
ok('Rangliste auf Vorhandenes gefiltert',
   ST().rank.length===1&&ST().rank[0]==='impact-play/flogger#p', ST().rank);
ok('entfernte Angaben NICHT geloescht, sondern als Waise gefuehrt',
   Object.keys(ST().orphans).length===3, ST().orphans);
ok('Waisen nennen ihre Herkunft',
   Object.keys(ST().orphans).some(k=>/entfernt-eins/.test(k)), Object.keys(ST().orphans));
ok('Meldung nennt Zahl und Verbleib',
   /3 Angaben geh/.test(A.migSummary(rep))&&/Gelöscht wurde nichts/.test(A.migSummary(rep)),
   A.migSummary(rep));
ok('Migration ist idempotent', (()=>{const r2=A.migrateState(ST());
   return r2.removed===0&&r2.unknown===0&&Object.keys(ST().orphans).length===3;})(),'x');

console.log('\n== Waisen ueberleben den Export ==');
A.exportMD();
const md=global.__downloads[global.__downloads.length-1].text;
const fence=JSON.parse(md.match(/```kinkcompass\n([\s\S]*?)\n```/)[1]);
ok('Waisen stehen im Datenblock', fence.orphans&&Object.keys(fence.orphans).length===3,
   fence.orphans);
A.importText(md);
ok('nach Re-Import immer noch da', Object.keys(ST().orphans).length===3, ST().orphans);
ok('gueltige Angabe unveraendert', ST().ag['sicherheit-verhandlung/safeword-vereinbaren']==='verbindlich','x');
ok('keine Fehlermeldung beim Laden',
   !(global.__alerts||[]).some(a=>/nicht lesbar|not read/.test(a)), global.__alerts);

console.log('\n== Vergleich mit altem Profil ==');
function mk(alias,f){Object.assign(ST(),A.BLANK(),{meta:{alias:alias},mode:'v'});f(ST());
  return JSON.parse(JSON.stringify(A.bundle()));}
const NEU=mk('Neu',s=>{s.w['impact-play/flogger#a']='neigung';});
const ALT=mk('Alt',s=>{s.w['impact-play/flogger#p']='must';});
ALT.app.listRevision='2026-08-01.x';
ALT.answers['risikomodell/entfernt-zwei']={value:'verbindlich',scale:'vereinbarung'};
let R=null;
try{ R=A.buildReport(ALT,NEU); ok('Vergleich laeuft ohne Fehler', true); }
catch(e){ ok('Vergleich laeuft ohne Fehler', false, e.message); }
if(R){
  const cov=R.sections.find(s=>s.id==='abdeckung').rows.map(r=>r.t+' || '+(r.s||''));
  ok('Fassungsunterschied wird benannt', cov.some(t=>/abweichende Fassung/.test(t)), cov);
  ok('nennt die alte Listenfassung', cov.some(t=>/2026-08-01\.x/.test(t)), cov);
  ok('nennt unbekannte Punkte', cov.some(t=>/nicht gibt/.test(t)), cov);
  ok('warnt, dass Luecken auch Fassungsluecken sein koennen',
     cov.some(t=>/in jener Fassung noch nicht gab/.test(t)), cov);
  ok('Treffer werden trotzdem gefunden',
     R.sections.find(s=>s.id==='match').rows.some(r=>/Flogger/.test(r.t)),
     R.sections.find(s=>s.id==='match').rows.map(r=>r.t));
}

console.log('\n== Gleiche Fassung erzeugt keinen Hinweis ==');
const R2=A.buildReport(NEU,mk('Zwei',s=>{s.w['impact-play/flogger#p']='must';}));
ok('kein Fassungshinweis bei gleicher Revision',
   !R2.sections.find(s=>s.id==='abdeckung').rows.some(r=>/abweichende Fassung/.test(r.t)),
   R2.sections.find(s=>s.id==='abdeckung').rows.map(r=>r.t));

console.log('\n'+(fail?'FEHLER: '+fail+' von '+(pass+fail):'alle '+pass+' Fassungs-Prüfungen bestanden'));
process.exit(fail?1:0);
