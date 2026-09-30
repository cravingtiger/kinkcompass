/* Rollentrennung im Vereinbarungsteil. */
const A=require('./harness.js');
let pass=0,fail=0;
const ok=(n,c,i)=>{c?pass++:fail++;console.log((c?'  ok  ':'  FAIL')+'  '+n+(c?'':'  → '+JSON.stringify(i)));};
const ST=()=>A.ST();
const it=(id)=>A.IDX.byId[id];
const ORT='sicherheit-verhandlung/orts-und-zeitgrenzen-festlegen';
const SAFEWORD='sicherheit-verhandlung/safeword-vereinbaren';

console.log('== Rollentrennung im Vereinbarungsteil ==');
ok('asymmetrischer Punkt ist rollengetrennt', it(ORT).ap===true, it(ORT));
ok('und hat zwei Einheiten', it(ORT).units.length===2, it(ORT).units);
ok('beidseitiger Punkt bleibt einfach', it(SAFEWORD).ap===false, it(SAFEWORD));
ok('und hat eine Einheit', it(SAFEWORD).units.length===1, it(SAFEWORD).units);
const n=A.IDX.items.filter(i=>i.exempt&&i.kind==='vereinbarung');
ok('etwa die Hälfte des Teils ist rollengetrennt',
   n.filter(i=>i.ap).length>=25 && n.filter(i=>i.ap).length<n.length,
   n.filter(i=>i.ap).length+' von '+n.length);

console.log('\n== Getrennte Antworten je Rolle ==');
Object.assign(ST(),A.BLANK(),{mode:'v',meta:{alias:'Test'}});
ST().ag[ORT+'#a']='verbindlich';
ST().ag[ORT+'#p']='nicht-noetig';
const snap=A.snapshot();
ok('beide Rollen im Snapshot', snap[ORT]&&snap[ORT].roles.a.value==='verbindlich'&&
   snap[ORT].roles.p.value==='nicht-noetig', JSON.stringify(snap[ORT]));

console.log('\n== Alte Antwort ohne Rolle bleibt gültig ==');
Object.assign(ST(),A.BLANK(),{mode:'v'});
ST().ag[ORT]='verbindlich';
const snap2=A.snapshot();
ok('rollenloser Wert gilt für beide Rollen',
   snap2[ORT].roles.a.value==='verbindlich'&&snap2[ORT].roles.p.value==='verbindlich',
   JSON.stringify(snap2[ORT]));

console.log('\n== Vergleich ueber Kreuz ==');
function mk(alias,f){Object.assign(ST(),A.BLANK(),{meta:{alias:alias},mode:'v'});f(ST());
  return JSON.parse(JSON.stringify(A.bundle()));}
const P1=mk('Eins',s=>{s.ag[ORT+'#p']='verbindlich';});
const P2=mk('Zwei',s=>{s.ag[ORT+'#a']='ablehnend';});
const R=A.buildReport(P1,P2);
const ve=R.sections.find(s=>s.id==='vereinbarungen').rows.map(r=>r.t+' || '+r.s);
ok('rollengetrennter Konflikt wird ueber Kreuz erkannt',
   ve.some(t=>/Orts- und Zeitgrenzen/.test(t)), ve);
ok('und nennt die Rollen', ve.some(t=>/Top|Bottom/.test(t)), ve);
ok('als No-Go markiert',
   R.sections.find(s=>s.id==='vereinbarungen').rows.some(r=>r.tone==='no'),
   R.sections.find(s=>s.id==='vereinbarungen').rows.map(r=>r.tone));

console.log('\n== Eigene Rollenbezeichnungen ==');
/* Top/Bottom sagt, wer handelt. Dom/Sub sagt, wer führt. Dass der Bogen beides
   trennt, haengt daran, dass die Rollenachse keine Machtwoerter benutzt. */
ok('Rollenachse benutzt keine Machtwörter',
   !/dom|sub|herr|sklav/i.test(A.roleOf(null,'#a').de+A.roleOf(null,'#p').de),
   [A.roleOf(null,'#a').de,A.roleOf(null,'#p').de]);
/* Top/Bottom ist die Vorgabe. Sie trägt weiter als „ausführend/empfangend",
   das bei „Knien" kippte: die kniende Person führt die Bewegung aus, ist aber
   der Bottom. Wo auch Top/Bottom nichts sagt — Leder, Wasser, Decke —, benennt
   das Item seine Seiten selbst (data/rollen.txt). */
const knien=A.IDX.byId['protokolle-rituale/knien'];
ok('Knien hat ein eigenes Rollenpaar', !!(knien&&knien.roles), knien&&knien.roles);
ok('und nennt beide Seiten konkret',
   A.roleOf(knien,'#a').de==='kniet selbst'&&A.roleOf(knien,'#p').de==='lässt knien',
   [A.roleOf(knien,'#a'),A.roleOf(knien,'#p')]);
const hand=A.IDX.byId['impact-play/handspanking'];
ok('transitive Punkte behalten die Vorgabe',
   A.roleOf(hand,'#a').de==='Top'&&A.roleOf(hand,'#p').de==='Bottom',
   A.roleOf(hand,'#a'));
ok('ohne Item gilt die Vorgabe (Knoten- und Bereichsebene)',
   A.roleOf(null,'#p').de==='Bottom', A.roleOf(null,'#p'));
const mitPaar=A.IDX.items.filter(i=>i.roles);
ok('nur rollengetrennte Punkte tragen ein Paar', mitPaar.every(i=>i.ap),
   mitPaar.filter(i=>!i.ap).slice(0,3).map(i=>i.id));
ok('beide Sprachen gefüllt',
   mitPaar.every(i=>i.roles.a.de&&i.roles.a.en&&i.roles.p.de&&i.roles.p.en),
   mitPaar.filter(i=>!(i.roles.a.en&&i.roles.p.en)).slice(0,3).map(i=>i.id));
/* Dieselbe Bezeichnung steht im Vergleich in „Anna <a> / Ben <p>". Eine
   Ich-Form ergäbe dort „Anna ich kniee". */
const ichForm=mitPaar.filter(i=>/^(ich|mein) /i.test(i.roles.a.de)||/^(ich|mein) /i.test(i.roles.p.de));
ok('keine Ich-Form (bricht die Vergleichsansicht)', ichForm.length===0,
   ichForm.slice(0,3).map(i=>i.id+': '+i.roles.a.de));

console.log('\n'+(fail?'FEHLER: '+fail+' von '+(pass+fail):'alle '+pass+' Prüfungen bestanden'));
process.exit(fail?1:0);
