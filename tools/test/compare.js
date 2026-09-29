const A=require('./harness.js');
let pass=0,fail=0;
const ok=(n,c,i)=>{c?pass++:fail++;console.log((c?'  ok  ':'  FAIL')+'  '+n+(c?'':'  → '+JSON.stringify(i)));};
const ST=A.ST();

/* Ids, die der Test braucht — laut versagen, wenn die Liste sich aendert */
const ID={
 flogger:'impact-play/flogger',
 rohr:'impact-play/rohrstock-cane',
 hand:'impact-play/handspanking',
 paddel:'impact-play/paddel',
 nadel:'nadeln-blut/play-piercing',
 safeword:'sicherheit-verhandlung/safeword-vereinbaren',
 leitmodell:'risikomodell/nach-welchem-modell-arbeitest-du',
 ausstieg2:'reale-machtverhaeltnisse/ausstiegsplan-schriftlich-festhalten',
 ausstieg:'reale-machtverhaeltnisse/ausstiegsplan-schriftlich-festhalten',
 d247:'grundorientierung/24-7-dynamik',
 wGut:'sprache-wortliste/belohnende-ansprache',
 wHerab:'sprache-wortliste/herabsetzende-ansprache',
 wNein:'sprache-wortliste/absolut-ausgeschlossene-worte',
 wSex:'sprache-wortliste/sexistische-herabsetzung',
 kuscheln:'aftercare/kuscheln',
 seil:'seil-shibari/einfache-seilfesselung',
 gerte:'impact-play/reitgerte'
};
console.log('== Voraussetzungen ==');
Object.keys(ID).forEach(k=>ok('Id vorhanden: '+k, !!A.IDX.byId[ID[k]], ID[k]));

function mkProfile(alias,f){
  Object.assign(ST,{w:{},p:{},x:{},f:{},star:{},ag:{},tx:{},multi:{},notes:{},
    nodeW:{},nodeP:{},nodeF:{},skip:{},rank:[],secRank:{},toys:[],meta:{alias:alias}});
  ST.mode='v'; f(ST);
  return JSON.parse(JSON.stringify(A.bundle()));
}
const PA=mkProfile('Anna',s=>{
  s.w[ID.nadel+'#p']='hard';
  s.w[ID.flogger+'#p']='must';
  s.w[ID.rohr+'#p']='soft';   s.p[ID.rohr+'#p']='echt';
  s.w[ID.hand+'#p']='neigung'; s.p[ID.hand+'#p']='reizvoll';
  s.w[ID.paddel+'#p']='soft';  s.p[ID.paddel+'#p']='echt';
  s.w[ID.gerte+'#p']='interessant'; s.x[ID.gerte+'#p']='keine';
  s.w[ID.seil+'#p']='must';
  s.w[ID.d247]='must';
  s.w[ID.kuscheln+'#p']='must';
  s.f[ID.flogger]=0;
  s.ag[ID.safeword]='verbindlich';
  s.ag[ID.leitmodell]='ssc';
   s.tx[ID.wGut]='Prinzessin, Gute';
  s.tx[ID.wHerab]='Schlampe, Hure, Spielzeug';
  s.tx[ID.wNein]='Fotze';
  s.ag[ID.wSex]='whitelist';
  s.notes[ID.flogger]={t:'nur privat',sh:true};
  s.notes[ID.seil]={t:'geheim',sh:false};
  s.star[ID.nadel+'#p']=0;
  s.star[ID.seil+'#p']=1; s.rank=[ID.seil+'#p'];
});
const PB=mkProfile('Ben',s=>{
  s.w[ID.flogger+'#a']='neigung';
  s.w[ID.rohr+'#a']='neigung'; s.p[ID.rohr+'#a']='echt';
  s.w[ID.hand+'#a']='neigung'; s.p[ID.hand+'#a']='echt';
  s.w[ID.paddel+'#a']='neigung';
  s.w[ID.gerte+'#a']='interessant'; s.x[ID.gerte+'#a']='keine';
  s.w[ID.seil+'#a']='hard';
  s.w[ID.kuscheln+'#a']='neigung';
  s.ag[ID.safeword]='ablehnend';
  s.ag[ID.leitmodell]='rack';
  s.tx[ID.wGut]='Gute, Schlampe';
  s.tx[ID.wHerab]='Hure, Spielzeug';
  s.tx[ID.wNein]='Spielzeug, Prinzessin';
  s.ag[ID.wSex]='nie';
});
const R=A.buildReport(PA,PB);
const sec=(id)=>R.sections.find(s=>s.id===id);
const rowsOf=(id)=>sec(id).rows.map(r=>r.t+' || '+(r.s||''));
const has=(id,re)=>rowsOf(id).some(t=>re.test(t));

console.log('\n== Reihenfolge des Dokuments (SPEC § 9) ==');
ok('Sicherheit steht vor den Treffern',
   R.sections.findIndex(s=>s.id==='nogo') < R.sections.findIndex(s=>s.id==='match'),
   R.sections.map(s=>s.id));
ok('Abdeckung ganz oben', R.sections[0].id==='abdeckung', R.sections[0].id);
ok('Reihenfolge wie spezifiziert',
   ['abdeckung','nogo','vereinbarungen','risikomodell','zuerst','sprache','strafe','prioritaeten']
     .every((x,i)=>R.sections[i].id===x), R.sections.map(s=>s.id).slice(0,8));

console.log('\n== 1 Absolute No-Gos ==');
ok('Hard Limit von Anna erscheint', has('nogo',/Play Piercing/),rowsOf('nogo').slice(0,3));
ok('Hard Limit von Ben erscheint', has('nogo',/Einfache Seilfesselung/),'x');
ok('ausgeschlossene Worte beider Seiten', has('nogo',/Fotze/)&&has('nogo',/Spielzeug/),
   rowsOf('nogo').filter(t=>/Wort/.test(t)));

console.log('\n== 2 Unvereinbare Vereinbarungen ==');
ok('verbindlich gegen echten Gegenwillen ist unvereinbar',
   has('vereinbarungen',/Safeword.*verbindlich.*will ich nicht/),rowsOf('vereinbarungen'));
ok('und wird als No-Go markiert',
   sec('vereinbarungen').rows.some(r=>/Safeword/.test(r.t)&&r.tone==='no'),
   sec('vereinbarungen').rows.map(r=>r.tone));
/* „brauche ich nicht" ist kein Gegenwille und darf nicht als Unvereinbarkeit gelten */
const PN=mkProfile('Nina',s2=>{s2.ag[ID.safeword]='verbindlich';});
const PO=mkProfile('Ole', s2=>{s2.ag[ID.safeword]='nicht-noetig';});
const RN=A.buildReport(PN,PO);
const vn=RN.sections.find(s2=>s2.id==='vereinbarungen');
ok('verbindlich gegen „brauche ich nicht" ist kein No-Go',
   vn.rows.some(r=>/Safeword/.test(r.t)&&r.tone==='warn'), vn.rows.map(r=>r.t+':'+r.tone));
ok('und wird als besprechbar beschrieben',
   vn.rows.some(r=>/kein Widerspruch in der Sache/.test(r.s||'')), vn.rows.map(r=>r.s));

console.log('\n== 3 Risikomodell ==');
ok('SSC gegen RACK benannt', has('risikomodell',/SSC.*RACK/),rowsOf('risikomodell'));
ok('als Haltungsunterschied markiert', sec('risikomodell').rows[0].tone==='warn',
   sec('risikomodell').rows[0].tone);

console.log('\n== 4 Zuerst zu besprechen (§ 9.3) ==');
ok('Machtabgabe ohne Absicherung wird benannt',
   has('zuerst',/Anna.*ohne gesicherte Absicherung/),rowsOf('zuerst'));
ok('nennt das Must-have', has('zuerst',/24\/7/),'x');
ok('nennt die offenen Absicherungen', has('zuerst',/Ausstiegsplan/),'x');
ok('Abschnitt ist personenbezogen, nicht beziehungsbezogen',
   !/voneinander|Wohnabh|gemeinsame Finanzen/i.test(rowsOf('zuerst').join(' ')),rowsOf('zuerst'));
ok('sachlich, ohne Urteil ueber die Person',
   !/gefährlich|Missbrauch|falsch|solltest du nicht/i.test(rowsOf('zuerst').join(' ')),
   rowsOf('zuerst'));
ok('nur bei Anna, nicht bei Ben', sec('zuerst').rows.length===1, sec('zuerst').rows.length);

console.log('\n== 4b Gesundheitskontrolle ohne Grenzen ==');
const PG=mkProfile('Greta',s=>{
  s.w['ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden#p']='must';
  s.w['ernaehrung-sport-koerperdaten/blutzucker-melden#p']='must';
});
const PH=mkProfile('Hans',s=>{ s.w['ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden#a']='neigung'; });
const RG=A.buildReport(PG,PH);
const zg=RG.sections.find(s=>s.id==='zuerst').rows.map(r=>r.t+' || '+r.s);
ok('Querverweis feuert bei Gesundheitskontrolle',
   zg.some(t=>/Gesundheitsbezogene Kontrolle/.test(t)), zg);
ok('nennt, wer was will', zg.some(t=>/Greta.*Blutzucker|Greta.*Gewicht/.test(t)), zg);
ok('listet die offenen Grenzen', zg.some(t=>/Behandlung in ärztlicher Hand/.test(t)), zg);
ok('sachlich, ohne Urteil',
   !/gefährlich|krank|Missbrauch|solltest/i.test(zg.join(' ')), zg);
const PI=mkProfile('Ida',s=>{
  s.w['ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden#p']='must';
  ['gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand','gesundheit-selbstbestimmung/eigene-entscheidung-ueber-medikamente','gesundheit-selbstbestimmung/aerztlich-festgelegte-untergrenzen','gesundheit-selbstbestimmung/ernaehrung-und-gewicht-ausserhalb-der-dynamik','gesundheit-selbstbestimmung/straffreiheit-fuer-messwerte','gesundheit-selbstbestimmung/konsequenzen-nur-fuer-verhalten','gesundheit-selbstbestimmung/ueberwachung-jederzeit-abschaltbar','gesundheit-selbstbestimmung/loeschfrist-fuer-nachweise-und-aufzeichnungen'].forEach(id=> s.ag[id]='verbindlich');
});
const PJ=mkProfile('Jan',s=>{
  s.w['ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden#a']='neigung';
  ['gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand','gesundheit-selbstbestimmung/eigene-entscheidung-ueber-medikamente','gesundheit-selbstbestimmung/aerztlich-festgelegte-untergrenzen','gesundheit-selbstbestimmung/ernaehrung-und-gewicht-ausserhalb-der-dynamik','gesundheit-selbstbestimmung/straffreiheit-fuer-messwerte','gesundheit-selbstbestimmung/konsequenzen-nur-fuer-verhalten','gesundheit-selbstbestimmung/ueberwachung-jederzeit-abschaltbar','gesundheit-selbstbestimmung/loeschfrist-fuer-nachweise-und-aufzeichnungen'].forEach(id=> s.ag[id]='verbindlich');
});
const RH=A.buildReport(PI,PJ);
ok('feuert NICHT, wenn alle Grenzen beantwortet sind',
   !RH.sections.find(s=>s.id==='zuerst').rows.some(r=>/Gesundheitsbezogene/.test(r.t)),
   RH.sections.find(s=>s.id==='zuerst').rows.map(r=>r.t));

console.log('\n== 5 Nutzbare Sprache (§ 9.4) ==');
ok('belohnende Schnittmenge getrennt ausgewiesen',
   rowsOf('sprache').some(t=>/^Belohnend, nutzbar: Gute \|\|/.test(t)), rowsOf('sprache').slice(0,6));
ok('herabsetzende Schnittmenge getrennt ausgewiesen',
   rowsOf('sprache').some(t=>/^Herabsetzend, nutzbar: Hure \|\|/.test(t)), rowsOf('sprache').slice(0,6));
ok('Bedeutungskonflikt erkannt: bei Anna Beschimpfung, bei Ben Lob',
   has('sprache',/Bedeutungskonflikt: „Schlampe"/), rowsOf('sprache'));
ok('Konflikt nennt beide Seiten und die Richtung',
   has('sprache',/Ben hat es als Lob freigegeben, Anna als Beschimpfung/), rowsOf('sprache'));
ok('Konflikt ist rot, nicht nur ein Hinweis',
   sec('sprache').rows.some(r=>/Bedeutungskonflikt/.test(r.t)&&r.tone==='no'),
   sec('sprache').rows.map(r=>r.tone));
ok('„Spielzeug" faellt raus, weil von Ben verboten',
   !rowsOf('sprache').some(t=>/nutzbar:.*Spielzeug/i.test(t)),'x');
ok('von der Gegenseite verbotenes Wort erscheint nicht als „nur nicht freigegeben"',
   !rowsOf('sprache').some(t=>/^Nur Anna: Prinzessin$/.test(t.split(' ||')[0])),
   rowsOf('sprache').filter(t=>/^Nur /.test(t)));
ok('es steht stattdessen unter den No-Gos', has('nogo',/Prinzessin/),'x');
ok('restriktivere Kategorie gewinnt (nie schlaegt whitelist)',
   has('sprache',/Sexistische Herabsetzung: nie/),rowsOf('sprache').filter(t=>/Sexist/.test(t)));

console.log('\n== 6 Strafe (§ 8.2) ==');
ok('echt + echt = wirksame Konsequenz',
   has('strafe',/Rohrstock.*wirksame Konsequenz/),rowsOf('strafe'));
ok('reizvoll gegen echt = Strafe wirkt nicht',
   has('strafe',/Handspanking.*wirkt nicht abschreckend/),rowsOf('strafe'));
ok('echt ohne Bereitschaft = steht nicht zur Verfuegung',
   has('strafe',/Paddel.*keine Bereitschaft/),rowsOf('strafe'));
ok('Hard Limit taucht NICHT in der Strafe-Liste auf',
   !has('strafe',/Play Piercing/),'x');

console.log('\n== 7 Prioritaeten (§ 9.5) ==');
ok('Kernwunsch trifft No-Go', has('prioritaeten',/Seilfesselung.*Hard Limit/),
   rowsOf('prioritaeten'));
ok('keine Passungskennzahl im Bericht',
   !/\d+\s*%|Score|Punktzahl|Kompatibilit/i.test(JSON.stringify(R.sections)),'x');

console.log('\n== 8-11 Wunsch-Matching ==');
ok('Treffer ueber Kreuz mit Richtung', has('match',/Flogger.*Ben → Anna|Flogger.*Anna → Ben/),
   rowsOf('match'));
ok('geteilte Notiz erscheint', has('match',/nur privat/),rowsOf('match'));
ok('private Notiz erscheint NICHT', !JSON.stringify(R.sections).includes('geheim'),'x');
ok('gemeinsam entdecken bei beidseitigem Interesse', has('entdecken',/Reitgerte/),rowsOf('entdecken'));
ok('markiert, dass beide ohne Erfahrung sind', has('entdecken',/beide ohne Erfahrung/),'x');
ok('einseitiger Kernwunsch erkannt', has('einseitig',/24\/7|Seilfesselung/),rowsOf('einseitig'));
ok('nicht bewertet wird als offen benannt, nicht als Nein',
   has('einseitig',/offen, nicht abgelehnt/),rowsOf('einseitig'));
ok('Verhandeln bei soft gegen neigung', has('verhandeln',/Rohrstock|Paddel/),rowsOf('verhandeln'));
ok('Hard-Limit-Paare tauchen nicht unter Treffern auf', !has('match',/Play Piercing/),'x');

console.log('\n== 12 Aftercare ==');
ok('Aftercare abgeglichen', has('aftercare',/Kuscheln/),rowsOf('aftercare'));

console.log('\n== Abdeckung ==');
ok('beide Namen genannt', has('abdeckung',/Anna/)&&has('abdeckung',/Ben/),rowsOf('abdeckung'));
ok('offen-nicht-abgelehnt im Hinweis', /offen, nicht abgelehnt/.test(sec('abdeckung').note),'x');

console.log('\n== Geerbte Werte ==');
const PC=mkProfile('Cara',s=>{ s.mode='v'; s.nodeW['S:impact-play']='neigung'; });
const R2=A.buildReport(PC,PB);
const m2=R2.sections.find(s=>s.id==='match').rows.map(r=>r.s).join(' ');
ok('geerbte Bewertung als abgeleitet gekennzeichnet', /abgeleitet/.test(m2), m2.slice(0,200));

console.log('\n== Markdown-Export des Vergleichs ==');
A.CMP.a=PA; A.CMP.b=PB;
A.exportCmpMD();
const md=global.__downloads[global.__downloads.length-1].text;
ok('Vergleichsdokument erzeugt', md.length>1500, md.length);
ok('Vorspann Gespraechsanlass', /Gesprächsanlass, keine Erlaubnis/.test(md),'x');
ok('Vorspann keine Kennzahl', /keine Passungskennzahl/.test(md),'x');
ok('No-Gos vor Treffern', md.indexOf('Absolute No-Gos')<md.indexOf('## 8. Treffer'),
   [md.indexOf('Absolute No-Gos'),md.indexOf('## 8. Treffer')]);
ok('private Notiz nicht im Vergleichsdokument', md.indexOf('geheim')<0,'x');

console.log('\n== Profil aus Markdown laden ==');
Object.assign(ST,JSON.parse(JSON.stringify(PA.state)));
A.exportMD();
const own=global.__downloads[global.__downloads.length-1].text;
const p=A.parseProfile(own);
ok('Markdown-Profil parsebar', !!p&&!!p.answers, p?Object.keys(p).slice(0,6):null);
ok('Alias erhalten', p&&p.meta&&p.meta.alias==='Anna', p&&p.meta);
const R3=A.buildReport(p,PB);
ok('Vergleich aus Markdown identisch zu JSON',
   JSON.stringify(R3.sections.find(s=>s.id==='nogo').rows)===
   JSON.stringify(R.sections.find(s=>s.id==='nogo').rows),'x');

console.log('\n== Einstiegsprofil gegen Vollprofil ==');
/* Der eigentliche Test des neuen Einstiegs: jemand hat nur Oberkategorien
   bewertet. Das Profil muss trotzdem auf Itemebene vergleichbar sein. */
const PE=mkProfile('Einsteigerin',s=>{
  s.mode='e';
  s.nodeW['T:fetische#p']='neigung';
  s.w[ID.hand+'#p']='interessant';
  s.ag[ID.safeword]='verbindlich';
});
const PV=mkProfile('Erfahrene',s=>{
  s.w['kleidung-material/latex#a']='must';
  s.w['kleidung-material/leder#a']='neigung';
  s.w[ID.hand+'#a']='neigung';
  s.ag[ID.safeword]='verbindlich';
});
const RE=A.buildReport(PE,PV);
ok('Einstiegsprofil erzeugt einen Bericht', !!RE&&!!RE.sections, 'x');
const alleRows=RE.sections.reduce((n,s2)=>n+(s2.rows?s2.rows.length:0),0);
ok('Bericht ist nicht leer', alleRows>0, alleRows);
const txt=JSON.stringify(RE);
ok('Latex taucht im Vergleich auf, obwohl nur die Kategorie bewertet wurde',
   txt.indexOf('kleidung-material/latex')>=0, 'fehlt');
ok('Handspanking als beidseitiges Thema erkannt',
   txt.indexOf(ID.hand)>=0, 'fehlt');
/* Eine geerbte Kategorieantwort darf nicht wie eine ausdrueckliche gelten. */
const roles=PE.answers['kleidung-material/latex'].roles;
ok('Kategorieantwort ist als geerbt markiert',
   Object.keys(roles).every(k=>roles[k].rating_src==='inh'),
   JSON.stringify(roles));
ok('ausdrueckliche Antwort bleibt ausdruecklich',
   PE.answers[ID.hand].roles.p.rating_src==='set',
   PE.answers[ID.hand].roles.p.rating_src);

console.log('\n== Fremde Datei ==');
ok('unbrauchbare Datei wird abgelehnt', A.parseProfile('kein json')===null,'x');
ok('JSON ohne answers wird abgelehnt', A.parseProfile('{"foo":1}')===null,'x');

console.log('\n'+(fail?'FEHLER: '+fail+' von '+(pass+fail):'alle '+pass+' Vergleichs-Prüfungen bestanden'));
process.exit(fail?1:0);
