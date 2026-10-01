const A=require('./harness.js');
let pass=0,fail=0;
const ok=(name,cond,info)=>{cond?pass++:fail++;
  console.log((cond?'  ok  ':'  FAIL')+'  '+name+(cond?'':'   → '+info));};
const ST=()=>A.ST();
const item=(id)=>A.IDX.byId[id];

console.log('\n== Vererbung ==');
const impact=item('impact-play/flogger');
ok('Item vorhanden und rollengetrennt', impact&&impact.ap, impact);
ok('ohne Bewertung leer', A.effW(impact,'#a').v===null, A.effW(impact,'#a'));
ST().nodeW['T:schmerz-impact']='neigung';
ok('erbt vom Themenbereich', A.effW(impact,'#a').v==='neigung'&&A.effW(impact,'#a').src==='inh',
   JSON.stringify(A.effW(impact,'#a')));
ST().nodeW['S:impact-play']='interessant';
ok('Sektion schlaegt Thema', A.effW(impact,'#a').v==='interessant', A.effW(impact,'#a'));
ST().nodeW['G:impact-play.flogger-gerte']='must';
ok('Gruppe schlaegt Sektion', A.effW(impact,'#a').v==='must', A.effW(impact,'#a'));
ST().w[impact.id+'#a']='soft';
ok('Item schlaegt Gruppe', A.effW(impact,'#a').v==='soft'&&A.effW(impact,'#a').src==='set',
   A.effW(impact,'#a'));
ok('andere Rolle bleibt geerbt', A.effW(impact,'#p').v==='must'&&A.effW(impact,'#p').src==='inh',
   A.effW(impact,'#p'));
ST().nodeW['G:impact-play.flogger-gerte#p']='hard';
ok('rollenspezifischer Knoten schlaegt rollenlosen', A.effW(impact,'#p').v==='hard',
   A.effW(impact,'#p'));
ok('aktive Rolle unberuehrt', A.effW(impact,'#a').v==='soft', A.effW(impact,'#a'));

console.log('\n== Ausnahme Rahmen und Sicherheit ==');
const sw=item('sicherheit-verhandlung/safeword-vereinbaren');
ok('Safeword ist exempt', sw&&sw.exempt===true, sw);
ST().nodeW['T:rahmen-sicherheit']='must';
ST().nodeW['S:sicherheit-verhandlung']='must';
ok('erbt NICHT', A.effW(sw,'').v===null, A.effW(sw,''));
ST().skip['T:rahmen-sicherheit']=1;
ok('kann nicht uebersprungen werden', A.isSkipped(sw)===false, A.isSkipped(sw));
delete ST().skip['T:rahmen-sicherheit'];
ok('Sicherheitssektion ist Typ vereinbarung', A.IDX.sec['sicherheit-verhandlung'].type==='vereinbarung',
   A.IDX.sec['sicherheit-verhandlung'].type);

console.log('\n== Ueberspringen ==');
const nadel=item('nadeln-blut/play-piercing');
ST().skip['S:nadeln-blut']=1;
ok('Item gilt als uebersprungen', A.isSkipped(nadel)===true, A.isSkipped(nadel));
const cSkip=A.countUnits([nadel]);
ok('uebersprungen zaehlt als geklaert, nicht als bewertet',
   cSkip.set===0&&cSkip.clar===nadel.units.length, JSON.stringify(cSkip));
delete ST().skip['S:nadeln-blut'];

console.log('\n== Hard Limit sperrt echte Strafe ==');
const rohr=item('impact-play/rohrstock-cane');
ok('Rohrstock vorhanden', !!rohr, Object.keys(A.IDX.byId).filter(k=>k.indexOf('rohrstock')>=0));
if(rohr){
  ST().w[rohr.id+'#p']='soft'; ST().p[rohr.id+'#p']='echt';
  ok('soft + echte Strafe ist erlaubt', A.effP(rohr,'#p').v==='echt', A.effP(rohr,'#p'));
}

console.log('\n== Risiko und Level ==');
ok('Risiko-hoch-Items vorhanden und alle ausserhalb des Einstiegs',
   A.IDX.items.filter(i=>i.risk==='hoch').length>0 &&
   A.IDX.items.filter(i=>i.risk==='hoch'&&i.level==='e'&&!i.exempt).length===0,
   A.IDX.items.filter(i=>i.risk==='hoch'&&i.level==='e').map(i=>i.id));
ok('Hochrisiko-Thema ohne Einstiegs-Items',
   A.IDX.items.filter(i=>i.theme==='hochrisiko'&&i.level==='e').length===0,
   A.IDX.items.filter(i=>i.theme==='hochrisiko'&&i.level==='e').length);
ok('CNC ohne Einstiegs-Items',
   A.IDX.items.filter(i=>i.sec==='cnc'&&i.level==='e').length===0, 'cnc');
/* Frueher galt: der ganze Sicherheitsteil steht in jedem Modus. Das war gut
   gemeint und falsch — 99 Vereinbarungen am Anfang werden durchgeklickt, nicht
   gelesen. Jetzt gilt: ein kleiner Kern steht immer, der Rest folgt dem Risiko
   (data/einstieg-kopplung.txt, geprueft in tools/audit.py). */
/* Hard und Soft Limits „benennen" und der Abbruch bei eingeschraenkter
   Einwilligungsfaehigkeit stehen nicht mehr im Kern: die Limits selbst stehen
   als Freitext darin (eine Vereinbarung, sie zu benennen, war dieselbe Frage
   ein zweites Mal), der Abbruch steckt in Nuechternheit und Widerruf. Dazu
   kommt, was ein womoeglich fremdes Gegenueber vor dem ersten Treffen wissen
   muss. */
const KERN=['sicherheit-verhandlung/safeword-vereinbaren','sicherheit-verhandlung/nonverbales-abbruchsignal-vereinbaren',
  'sicherheit-verhandlung/vorbesprechung-fuehren',
  'sicherheit-verhandlung/nachbesprechung-fuehren',
  'sicherheit-verhandlung/widerruf-ohne-rechtfertigung',
  'sicherheit-verhandlung/sanktionsfreiheit-fuer-safeword-und-abbruch',
  'risikomodell/nuechternheit-der-fuehrenden-seite','risikomodell/nuechternheit-der-folgenden-seite',
  'grenzen-gesundheit/absolute-no-gos','grenzen-gesundheit/gesundheitsbezogene-grenzen',
  'grenzen-gesundheit/koerperliche-grenzen','grenzen-gesundheit/emotionale-grenzen',
  'sicherheit-verhandlung/identitaetspruefung-vor-dem-treffen',
  'sicherheit-verhandlung/erstes-treffen-in-der-oeffentlichkeit',
  'sicherheit-verhandlung/aufnahmen-ausschliessen',
  'sicherheit-verhandlung/sti-status-und-schutzbarrieren-besprechen'];
ok('Sicherheitskern im Einstieg',
   KERN.every(id=>item(id)&&item(id).level==='e'),
   KERN.filter(id=>!item(id)||item(id).level!=='e'));
ok('Nuechternheit im Einstieg, getrennt nach Seite',
   ['risikomodell/nuechternheit-der-fuehrenden-seite','risikomodell/nuechternheit-der-folgenden-seite']
     .every(id=>item(id).level==='e')
   &&!item('risikomodell/nuechternheit-der-fuehrenden-seite').ap,'x');
ok('Loesewerkzeug ist nicht nach Rolle getrennt',
   !item('sicherheit-verhandlung/loesewerkzeug-in-reichweite').ap,'ap');
ok('Wasser ist keine Neigung im Einstieg', item('aftercare/wasser').level!=='e', 'e');
ok('Sicherheitsteil bleibt von Vererbung ausgenommen',
   A.IDX.items.filter(i=>i.theme==='rahmen-sicherheit').every(i=>i.exempt),'exempt');
ok('Einstieg ist kurz (hoechstens 60 Items)',
   A.IDX.items.filter(i=>i.level==='e').length<=60,
   A.IDX.items.filter(i=>i.level==='e').length);
ok('kein Einstiegs-Item traegt eine Risikoflagge',
   A.IDX.items.filter(i=>i.level==='e'&&i.risk).length===0,
   A.IDX.items.filter(i=>i.level==='e'&&i.risk).map(i=>i.id));
ok('Ausstiegsplan und Wohnmoeglichkeit nicht im Einstieg',
   A.IDX.items.filter(i=>i.sec==='reale-machtverhaeltnisse'&&i.level==='e').length===0,'x');
ok('Oberkategorien nur fuer Bereiche ohne eigene Einstiegsitems',
   A.THEMES.filter(t=>t.ekat).every(t=>
     t.sections.every(s2=>s2.items.every(i=>i.level!=='e'))),
   A.THEMES.filter(t=>t.ekat).map(t=>t.id));
ok('Hochrisiko bekommt keine Oberkategorie',
   !A.THEMES.filter(t=>t.ekat).some(t=>t.id==='hochrisiko'),'x');

console.log('\n== Inhaltsabdeckung (Phase 4) ==');
const noEn=A.IDX.items.filter(i=>!i.en);
const noDeX=A.IDX.items.filter(i=>!i.expl_de);
const noEnX=A.IDX.items.filter(i=>!i.expl_en);
ok('alle Items haben ein englisches Label', noEn.length===0, noEn.slice(0,5).map(i=>i.id));
ok('alle Items haben eine deutsche Erklärung', noDeX.length===0, noDeX.slice(0,5).map(i=>i.id));
ok('alle Items haben eine englische Erklärung', noEnX.length===0, noEnX.slice(0,5).map(i=>i.id));
const badT=A.THEMES.filter(t=>!t.title_en);
const badS=[]; A.THEMES.forEach(t=>t.sections.forEach(s2=>{
  if(!s2.title_en) badS.push(s2.id);
  if(s2.note_de&&!s2.note_en) badS.push(s2.id+' (Hinweis)');
  s2.groups.forEach(g=>{if(!g.title_en) badS.push(s2.id+'/'+g.id);});
}));
ok('alle Themen mit englischem Titel', badT.length===0, badT.map(t=>t.id));
ok('alle Sektionen, Gruppen und Hinweise mit englischem Text', badS.length===0, badS.slice(0,6));
const badC=[]; Object.keys(A.DATAchoices||{}).forEach(k=>
  (A.DATAchoices[k]||[]).forEach(o=>{if(!o.label_en) badC.push(k+'/'+o.v);}));
ok('alle Antwortsätze übersetzt', badC.length===0, badC);
ok('Erklärungen sind keine Platzhalter',
   !A.IDX.items.some(i=>/^(TODO|TBD|xxx)/i.test(i.expl_de||'')), 'x');

console.log('\n== Neue Inhalte: Lifecoaching, Ueberwachung, Gesundheit ==');
['orgasmus-lustkontrolle/gooning-langer-trance-artiger-edging-zustand','orgasmus-lustkontrolle/verordnetes-masturbationspensum',
 'lifecoaching-accountability/dominante-begleitung-im-alltag-lifecoaching',
 'ueberwachung-nachweis/videoueberwachung-waehrend-vereinbarter-zeitfenster',
 'ernaehrung-sport-koerperdaten/blutzucker-melden',
 'ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden',
 'rollen-identitaeten/lifecoach-dominante-alltagsbegleitung',
 'gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand'].forEach(id=>
  ok('vorhanden: '+id, !!item(id), id));
ok('Gesundheitsgrenzen sind Vereinbarungen, nicht Vorlieben',
   item('gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand').kind==='vereinbarung',
   item('gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand').kind);
ok('Gesundheitsgrenzen von Vererbung ausgenommen',
   item('gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand').exempt===true,'x');
ok('Gesundheitsgrenzen vollstaendig im Standardmodus',
   A.IDX.sec['gesundheit-selbstbestimmung'].items.every(i=>i.level!=='v'&&i.exempt),
   A.IDX.sec['gesundheit-selbstbestimmung'].items.length);
/* Die Grenzen erscheinen zusammen mit dem, wogegen sie schuetzen — nicht davor. */
ok('Gesundheitsgrenzen und Koerperdaten im selben Modus',
   A.IDX.sec['gesundheit-selbstbestimmung'].items.every(i=>i.level==='s')
   ===A.IDX.sec['ernaehrung-sport-koerperdaten'].items.some(i=>i.level==='s'),'x');
ok('Blutzucker als Hochrisiko markiert',
   item('ernaehrung-sport-koerperdaten/blutzucker-melden').risk==='hoch',
   item('ernaehrung-sport-koerperdaten/blutzucker-melden').risk);
ok('Sicherheitshinweis an der Gesundheitssektion',
   /Essstörung/.test(A.IDX.sec['ernaehrung-sport-koerperdaten'].note_de||''),
   (A.IDX.sec['ernaehrung-sport-koerperdaten'].note_de||'').slice(0,60));
ok('neue Sektionen sind rollengetrennt',
   item('ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden').ap===true,'x');

console.log('\n== Modus ==');
A.setMode('e');
const NE=A.IDX.items.filter(i=>i.level==='e').length;
const NS=A.IDX.items.filter(i=>['e','s'].indexOf(i.level)>=0).length;
const NV=A.IDX.items.length;
ok('Einstieg < Standard < Vollstaendig', NE<NS && NS<NV, [NE,NS,NV]);
ok('Einstieg bleibt handhabbar (unter 400)', NE<400, NE);
ok('Hochrisiko-Sektion im Einstieg leer (wird benannt, nicht entfernt)',
   A.IDX.sec['nadeln-blut'].items.filter(i=>i.level==='e').length===0, 'ok');
A.setMode('v');
ok('Vollstaendig zeigt alle Items',
   A.IDX.items.filter(i=>['e','s','v'].indexOf(i.level)>=0).length===NV,'n');
A.setMode('s');

console.log('\n== Stern und Rangfolge ==');
ST().star[impact.id+'#p']=1;
ST().star['bondage-allgemein/haende-vor-dem-koerper-fesseln#p']=1;
const u=A.starredUnits();
ok('zwei gesternte Einheiten', u.length===2, u);
ok('Rang uebernimmt Reihenfolge', Array.isArray(ST().rank), ST().rank);

console.log('\n== Export Markdown ==');
ST().meta={alias:'Testfall',date:'2026-09-27',self:'Switch',version:'Fassung 1',note:'Zeile1\nZeile2'};
ST().tx['grenzen-gesundheit/absolute-no-gos']='Keine Atemkontrolle.';
ST().ag['risikomodell/nach-welchem-modell-arbeitest-du']='rack';
ST().ag['reale-machtverhaeltnisse/entfernt-vier']='ja';
ST().notes[impact.id]={t:'nur privat',sh:true};
ST().multi['orientierung-sexuell']=['orientierung-sexuell/queer'];
ST().toys=['Flogger','Seil 8m'];
A.exportMD();
const md=global.__downloads[global.__downloads.length-1].text;
ok('Markdown erzeugt', md.length>2000, md.length);
ok('Prioritaeten stehen vor den Sektionen',
   md.indexOf('## Prioritäten')>0 && md.indexOf('## Prioritäten')<md.indexOf('## 1.'),
   [md.indexOf('## Prioritäten'),md.indexOf('## 1.')]);
const prioBlock=md.split('## Prioritäten')[1].split('##')[0];
ok('Prioritaetenliste enthaelt echte Eintraege', /^1\. \S/m.test(prioBlock.trim()),
   JSON.stringify(prioBlock.slice(0,160)));
ok('Prioritaeteneintrag nennt die Rolle', /\*\((Top|Bottom)\)\*/.test(prioBlock),
   JSON.stringify(prioBlock.slice(0,160)));
ok('Umfangshinweis „offen, nicht abgelehnt"', md.indexOf('offen, nicht abgelehnt')>0,'x');
ok('Gesprächsanlass-Vorspann', md.indexOf('Gesprächsanlass, keine Erlaubnis')>0,'x');
ok('geerbt/gesetzt in der Tabelle', md.indexOf('| geerbt |')>0&&md.indexOf('| gesetzt |')>0,'x');
ok('Freitext exportiert', md.indexOf('Keine Atemkontrolle.')>0,'x');
ok('Leitmodell exportiert', md.indexOf('RACK')>0,'x');
ok('geteilte Notiz exportiert', md.indexOf('nur privat')>0,'x');
ok('Toys exportiert', md.indexOf('Seil 8m')>0,'x');
ok('JSON-Block vorhanden', md.indexOf('```kinkcompass')>0,'x');
const fence=md.match(/```kinkcompass\n([\s\S]*?)\n```/);
ok('JSON-Block parsebar', !!fence && (()=>{try{JSON.parse(fence[1]);return true;}catch(e){return false;}})(),
   fence?fence[1].slice(0,80):'kein Block');

ok('frischer Bogen startet im Einstieg', A.BLANK().mode==='e', A.BLANK().mode);

console.log('\n== Blackmail und Bloßstellung ==');
(function(){
  const sec=A.IDX.sec['blackmail-blossstellung'];
  ok('Sektion vorhanden', !!sec, 'fehlt');
  ok('deckt alle vier Fragen ab: Material, Drohung, Spielform, Reichweite',
     ['material','drohung','spielformen','reichweite'].every(g=>sec.groups.some(x=>x.id===g)),
     sec.groups.map(g=>g.id));
  const grenzen=sec.items.filter(i=>i.group==='grenzen-blackmail');
  ok('hat eigene Grenzen ('+grenzen.length+')', grenzen.length>=10, grenzen.length);
  /* Der Kern: eine Drohung greift die Möglichkeit an, das Spiel zu beenden.
     Deshalb muss das Safeword ausdrücklich darüberstehen. */
  ok('Safeword steht ausdrücklich über dem Spiel',
     grenzen.some(i=>/Safeword steht über dem Spiel/.test(i.de)), grenzen.map(i=>i.de));
  ok('Grenzen sind nicht rollengetrennt — sie gelten für beide',
     grenzen.every(i=>!i.ap), grenzen.filter(i=>i.ap).map(i=>i.id));
  ok('nichts davon im Einstieg', sec.items.every(i=>i.level!=='e'),
     sec.items.filter(i=>i.level==='e').map(i=>i.id));
  /* Ein Haken am Themennamen darf Erpressungsspiel nicht mitbewerten. */
  ST().nodeW['T:psyche-sprache']='neigung';
  const geerbt=sec.items.filter(i=>i.kind==='wunsch'&&i.units.some(u=>A.effW(i,u).src==='inh'));
  ok('kein Item erbt vom Bereichshaken', geerbt.length===0, geerbt.slice(0,3).map(i=>i.id));
  delete ST().nodeW['T:psyche-sprache'];
  ok('echtes Material und Geldforderung als Hochrisiko markiert',
     sec.items.filter(i=>/echtes-material-vereinbart|drohung-geldforderung/.test(i.id))
       .every(i=>i.risk==='hoch'),
     sec.items.filter(i=>/echtes-material|geldforderung/.test(i.id)).map(i=>i.id+':'+i.risk));
})();

console.log('\n== Einstieg: Oberkategorie im Export ==');
ST().mode='e';
ST().nodeW['T:fetische']='neigung';
A.exportMD();
const emd=global.__downloads[global.__downloads.length-1].text;
ok('Oberkategorie steht im Markdown', emd.indexOf('als Ganzes bewertet')>=0, 'fehlt');
ok('mit dem Bereichsnamen', emd.indexOf('Fetische')>=0, 'fehlt');
const esnap=A.snapshot?A.snapshot():null;
if(esnap){
  const inner=A.IDX.items.filter(i=>i.theme==='fetische');
  const ohne=inner.filter(i=>!i.risk), mitRisiko=inner.filter(i=>i.risk);
  ok('Datenblock enthaelt alle '+ohne.length+' Items ohne Risikohinweis',
     ohne.every(i=>esnap[i.id]), ohne.filter(i=>!esnap[i.id]).slice(0,3).map(i=>i.id));
  ok('und markiert sie als geerbt',
     ohne.every(i=>{const r=esnap[i.id].roles;
       return Object.keys(r).every(k=>r[k].rating_src==='inh');}),'x');
  /* Der Haken am Bereichsnamen ist die groebste Geste im Bogen. Er darf nicht
     stillschweigend Praktiken mitbewerten, die eine eigene Entscheidung
     verlangen — sonst stuende im Profil einer Anfaengerin „Ravishment-Fantasie:
     Neigung", weil sie „Rollenspiel" angeklickt hat. */
  ok('Risikomarkierte Items erbt der Bereichshaken NICHT',
     mitRisiko.length>0 && mitRisiko.every(i=>!esnap[i.id]),
     mitRisiko.map(i=>i.id));
}
ST().mode='s'; delete ST().nodeW['T:fetische'];

/* Dasselbe fuer die Bereiche, in denen es wirklich zaehlt. */
['rollenspiel','koerper-medizin','lifecoaching'].forEach(tid=>{
  ST().nodeW['T:'+tid]='neigung'; ST().nodeW['T:'+tid+'#a']='neigung';
  ST().nodeW['T:'+tid+'#p']='neigung';
  const riskig=A.IDX.items.filter(i=>i.theme===tid&&i.risk);
  const geerbt=riskig.filter(i=>i.units.some(u=>A.effW(i,u).src==='inh'));
  ok('Bereichshaken erreicht keines der '+riskig.length+' Risiko-Items in '+tid,
     geerbt.length===0, geerbt.slice(0,4).map(i=>i.id));
  const harmlos=A.IDX.items.filter(i=>i.theme===tid&&!i.risk&&!i.nosweep
    &&i.kind==='wunsch');
  ok('harmlose Items in '+tid+' erben weiterhin',
     harmlos.length>0&&harmlos.every(i=>i.units.some(u=>A.effW(i,u).src==='inh')),
     harmlos.filter(i=>!i.units.some(u=>A.effW(i,u).src==='inh')).slice(0,3).map(i=>i.id));
  delete ST().nodeW['T:'+tid]; delete ST().nodeW['T:'+tid+'#a'];
  delete ST().nodeW['T:'+tid+'#p'];
});
/* Consensual Non-Consent ist ganz ausgenommen, auch die Items ohne Flagge:
   die Zustimmung dort muss im Einzelnen gegeben worden sein. */
ST().nodeW['T:rollenspiel']='neigung';
(function(){
  const cnc=A.IDX.items.filter(i=>i.sec==='cnc');
  const geerbt=cnc.filter(i=>i.units.some(u=>A.effW(i,u).src==='inh'));
  ok('kein einziges der '+cnc.length+' CNC-Items erbt vom Bereichshaken',
     geerbt.length===0, geerbt.slice(0,4).map(i=>i.id));
  ok('CNC ist als NUR-EINZELN markiert', cnc.every(i=>i.nosweep===true),
     cnc.filter(i=>!i.nosweep).length);
})();
delete ST().nodeW['T:rollenspiel'];

/* Auf Gruppenebene bleibt es moeglich: dort sieht man, worauf man klickt. */
(function(){
  const it=A.IDX.items.filter(i=>i.risk&&!i.exempt&&i.kind==='wunsch')[0];
  ST().nodeW['G:'+it.sec+'.'+it.group]='soft';
  ok('Gruppenhaken erreicht Risiko-Items weiterhin',
     A.effW(it,it.units[0]).src==='inh', it.id+' '+A.effW(it,it.units[0]).src);
  delete ST().nodeW['G:'+it.sec+'.'+it.group];
})();

console.log('\n== Private Notiz bleibt privat ==');
ST().notes['impact-play/handspanking']={t:'geheim',sh:false};
A.exportMD();
const md2=global.__downloads[global.__downloads.length-1].text;
const f2=md2.match(/```kinkcompass\n([\s\S]*?)\n```/);
ok('private Notiz nicht in der Markdown-Tabelle', md2.split('```kinkcompass')[0].indexOf('geheim')<0,'x');
ok('private Notiz aber im Datenblock (eigenes Profil)', f2[1].indexOf('geheim')>0,'x');

console.log('\n== Re-Import ==');
const beforeO=A.bundle().answers;
const before=JSON.stringify(beforeO);
const rank0=ST().rank.slice();
A.importText(md2);
const afterO=A.bundle().answers;
const after=JSON.stringify(afterO);
const dk=[...new Set([...Object.keys(beforeO),...Object.keys(afterO)])]
  .filter(k=>JSON.stringify(beforeO[k])!==JSON.stringify(afterO[k]));
ok('Antworten nach Re-Import identisch', before===after,
   dk.slice(0,2).map(k=>k+'  VOR '+JSON.stringify(beforeO[k])+'  NACH '+JSON.stringify(afterO[k])));
ok('Rangfolge erhalten', JSON.stringify(ST().rank)===JSON.stringify(rank0), ST().rank);
ok('Meta erhalten', ST().meta.alias==='Testfall', ST().meta);
ok('keine Fehlermeldung', !(global.__alerts||[]).some(a=>/nicht lesbar|not read/.test(a)),
   global.__alerts);

console.log('\n== Snapshot ==');
const snap=A.snapshot();
ok('Snapshot enthaelt Quelle der Bewertung',
   snap[impact.id]&&snap[impact.id].roles.a.rating_src==='set', JSON.stringify(snap[impact.id]));
ok('geerbte Bewertung als geerbt markiert',
   snap[impact.id].roles.p.rating_src==='inh', JSON.stringify(snap[impact.id].roles.p));

console.log('\n== Backtick-Sicherheit ==');
ST().tx['grenzen-gesundheit/absolute-no-gos']='Test ``` mit Fence';
A.exportMD();
const md3=global.__downloads[global.__downloads.length-1].text;
const f3=md3.match(/```kinkcompass\n([\s\S]*?)\n```/);
ok('Fence bleibt intakt trotz Backticks im Text',
   !!f3&&(()=>{try{JSON.parse(f3[1]);return true;}catch(e){return false;}})(),'x');

console.log('\n'+(fail?'FEHLER: '+fail+' von '+(pass+fail):'alle '+pass+' Prüfungen bestanden'));
process.exit(fail?1:0);
