<script>
"use strict";
/* ====================================================================
   KinkCompass — laeuft vollstaendig lokal. DATA wird beim Build eingefuegt.
   ==================================================================== */
const APP={name:'KinkCompass',version:'2.1.0',schema:3,
  scaleRev:'2026-09-27.a',listRev:'2026-09-27.b'};

/* ---------- Skalen ---------- */
const SC={
 wunsch:[
  {v:'must',       de:'Must-have',          en:'Must-have',
   dde:'Brauche ich, damit es für mich stimmt.', den:'I need this for it to work for me.'},
  {v:'neigung',    de:'Neigung / Belohnung', en:'Preference / reward',
   dde:'Mag ich, wirkt belohnend, gern regelmäßig.', den:'I like it, it feels rewarding.'},
  {v:'sehnsucht',  de:'Sehnsucht',          en:'Longing',
   dde:'Starkes Verlangen.', den:'Strong desire.'},
  {v:'interessant',de:'Interessant',        en:'Curious',
   dde:'Neugier vorhanden.', den:'Curious about it.'},
  {v:'neutral',    de:'Neutral / egal',     en:'Neutral',
   dde:'Weder Wunsch noch Ablehnung.', den:'Neither wanted nor refused.'},
  {v:'soft',       de:'Soft Limit',         en:'Soft limit',
   dde:'Nur unter Bedingungen, mit Vorsicht oder in Andeutung.', den:'Only under conditions.'},
  {v:'hard',       de:'Hard Limit',         en:'Hard limit',
   dde:'Absolute Grenze, kommt nicht in Frage.', den:'Absolute limit.'},
  {v:'na',         de:'Keine Angabe',       en:'No answer',
   dde:'Möchte ich nicht beantworten.', den:'Prefer not to answer.'}],
 strafe:[
  {v:'reizvoll',de:'als Strafe reizvoll',en:'appealing as punishment',
   dde:'Unangenehm, aber erregend — wirkt NICHT abschreckend.',
   den:'Unpleasant but arousing — does NOT deter.'},
  {v:'echt',    de:'echte Strafe',       en:'real punishment',
   dde:'Wirklich unangenehm, keine Erregung, ausdrücklich erlaubt.',
   den:'Genuinely unpleasant, not arousing, explicitly permitted.'}],
 erfahrung:[
  {v:'keine',de:'keine',en:'none'},{v:'einmal',de:'einmal',en:'once'},
  {v:'gelegentlich',de:'gelegentlich',en:'occasionally'},{v:'viel',de:'viel',en:'a lot'}],
 vereinbarung:[
  {v:'verbindlich', de:'verbindlich', en:'binding',
   dde:'Bedingung, ohne die nichts stattfindet.', den:'A condition; nothing happens without it.'},
  {v:'gewuenscht',  de:'gewünscht',   en:'wanted',
   dde:'Möchte ich, aber nicht als Bedingung.', den:'I want it, but not as a condition.'},
  {v:'verhandelbar',de:'verhandelbar',en:'negotiable',
   dde:'Offen, je nach Gegenüber und Situation.', den:'Open, depending on situation.'},
  {v:'nicht-noetig',de:'brauche ich nicht', en:'not needed',
   dde:'Für mich keine Bedingung — stört mich aber auch nicht.',
   den:'Not a condition for me, but it does not bother me either.'},
  {v:'ablehnend',   de:'will ich nicht', en:'I want the opposite',
   dde:'Ich will ausdrücklich das Gegenteil. Das ist eine eigene Aussage, kein bloßes „brauche ich nicht".',
   den:'I expressly want the opposite. That is a statement in itself, not merely “not needed”.'}],
 angabe:[
  {v:'ja',de:'ja',en:'yes'},{v:'teilweise',de:'teilweise',en:'partly'},
  {v:'nein',de:'nein',en:'no'},{v:'na',de:'keine Angabe',en:'no answer'}]
};
/* Teilmenge fuer den Einstieg — dieselben Codes, keine eigene Skala */
const WUNSCH_E=['neigung','interessant','neutral','soft','hard'];
/* Die Strafe-Achse bedeutet je nach Rolle Verschiedenes: die empfangende Seite
   beschreibt, wie es wirkt; die ausfuehrende, wozu sie bereit ist. */
function strafeOpts(u){
  const geb=(u==='#a');
  return [
   {v:'reizvoll',de:'als Strafe reizvoll',en:'appealing as punishment',
    dde:geb?'Ich setze es als „Strafe" ein, die beide genießen — es wirkt nicht abschreckend.'
           :'Unangenehm, aber erregend — es wirkt bei mir nicht abschreckend.',
    den:geb?'I use it as a punishment both enjoy — it does not deter.'
           :'Unpleasant but arousing — it does not deter me.'},
   {v:'echt',de:'echte Strafe',en:'real punishment',
    dde:geb?'Ich bin bereit, es als echte Konsequenz zu verhängen.'
           :'Wirklich unangenehm, keine Erregung — ich erlaube es als Konsequenz.',
    den:geb?'I am willing to impose it as a real consequence.'
           :'Genuinely unpleasant, not arousing — I permit it as a consequence.'}];
}
/* Reihenfolge fuer Sortierung und Auswertung */
const ORD=['must','neigung','sehnsucht','interessant','neutral','soft','hard','na'];
const MODES={e:['e'],s:['e','s'],v:['e','s','v']};
const MODELBL={e:{de:'Einstieg',en:'Getting started'},s:{de:'Standard',en:'Standard'},
               v:{de:'Vollständig',en:'Complete'}};
/* Top und Bottom statt „ausfuehrend/empfangend": das ist die in der Szene
   uebliche Bezeichnung fuer genau diese Achse, und sie liest sich auch dort
   richtig, wo die alte Wendung kippte. Bei „Knien" ist die kniende Person der
   Bottom — „ausfuehrend" stand dort fuer dieselbe Person und las sich verkehrt
   herum, weil sie die Bewegung ja ausfuehrt.
   Nicht zu verwechseln mit Dom/Sub: das ist eine andere Achse (wer fuehrt).
   Dass beide unabhaengig sind, zeigt der Service Top — er fuehrt aus und dient. */
const ROLE={a:{de:'Top',en:'top'},p:{de:'Bottom',en:'bottom'}};
/* „ausführend/empfangend" ist präzise, solange ein Punkt eine Handlung von A an
   B ist. Bei einer Haltung wie „Knien" führt die kniende Person aus — das liest
   sich verkehrt herum. Deshalb darf ein Item seine beiden Seiten selbst benennen
   (data/rollen.txt); ohne Eintrag gilt die Vorgabe. Auf Knoten- und Bereichsebene
   gibt es kein einzelnes Item, dort bleibt es bei der Vorgabe. */
const roleOf=(it,u)=>{
  const k=(u||'').slice(1)||'a';
  return (it&&it.roles&&it.roles[k])?it.roles[k]:ROLE[k];
};

/* ---------- Textbausteine ---------- */
const T={
 intro:{de:'Teilnahme freiwillig. Jeder Punkt kann übersprungen werden, und jede Bewertung darf sich '+
  'jederzeit ändern. Alle real umgesetzten Praktiken setzen freiwillige, informierte und jederzeit '+
  'widerrufbare Zustimmung aller Beteiligten voraus, sowie klare Stoppsignale.<br>'+
  '<b>Top</b> = du führst die Handlung aus · <b>Bottom</b> = die Handlung richtet sich an dich. '+
  'Das ist nicht dasselbe wie Dom und Sub: ein <i>Service Top</i> führt aus und dient zugleich.'+
  '<br>Bewertungen auf '+
  'Themen-, Sektions- oder Gruppenebene gelten als Vorgabe nach unten und werden <i>gestrichelt</i> '+
  'dargestellt. <b>Rahmen und Sicherheit</b> erbt nie — dort zählt nur, was du selbst '+
  'gesetzt hast. Im Einstieg steht davon ein Kern; die übrigen Vereinbarungen kommen '+
  'dazu, sobald der Bereich vorkommt, gegen den sie schützen.',
  en:'Participation is voluntary. Any point may be skipped and any rating may change at any time. '+
  'Every practice actually carried out requires the voluntary, informed and revocable consent of '+
  'everyone involved, plus clear stop signals.<br><b>doing</b> = you carry out the action · '+
  '<b>receiving</b> = the action is directed at you. This says nothing about power: someone who '+
  'serves both carries it out and follows.<br>Ratings on a theme, section or group '+
  'apply downwards as a default and are shown <i>dashed</i>. <b>Framework and safety</b> is exempt '+
  'never inherits — only what you set yourself counts there. Getting-started mode shows a '+
  'core of it; the remaining agreements appear once the area they protect is in play.'},
 notAsked:{de:'Wird im Einstiegsmodus nicht abgefragt.',en:'Not asked in getting-started mode.'},
 ekatCap:{de:'Wie sehr interessiert dich dieser Bereich?',
  en:'How much does this area interest you?'},
 ekatWhy:{de:'Im Einstieg bewertest du diesen Bereich im Ganzen. Deine Antwort gilt '+
  'als Voreinstellung für alles darin und bleibt beim Vergleich mit einem ausführlichen '+
  'Profil auswertbar. **Praktiken mit Risikohinweis sind ausgenommen** — die bekommt '+
  'man nicht mit einem Haken am Bereichsnamen. Im Standardmodus gehst du ins Einzelne.',
  en:'In getting-started mode you rate this area as a whole. Your answer applies as a '+
  'default to everything inside it and stays comparable with a detailed profile. '+
  '**Practices marked as risky are excluded** — a tick on the area name does not '+
  'cover them. Switch to standard mode to go into detail.'},
 moreSec1:{de:'weitere Sektion erscheint im Standardmodus',
  en:'more section appears in standard mode'},
 moreSecs:{de:'weitere Sektionen erscheinen im Standardmodus',
  en:'more sections appear in standard mode'},
 ekatShort:{de:'dein Eindruck vom ganzen Bereich',en:'your impression of the whole area'},
 ausserhalbModus:{de:'in diesem Modus nicht sichtbar',en:'not shown in this mode'},
 /* Ausgenommen sind Risiko-Items UND die NUR-EINZELN-Sektionen (CNC). „mit
    Risikohinweis" waere fuer die zweite Gruppe schlicht falsch. */
 katAus:{de:'davon verlangen # eine eigene Entscheidung und bleiben offen',
  en:'# of them need a decision of their own and stay open'},
 evalKat:{de:'Im Ganzen bewertete Bereiche',en:'Areas rated as a whole'},
 evalKatGilt:{de:'gilt für',en:'applies to'},
 evalPunkte:{de:'Punkte',en:'items'},
 evalEinstieg:{de:'So ist der Einstieg gedacht: grobe Bereiche statt Einzelfragen. '+
  'Die Einzelpunkte darin sind hier nicht aufgeführt — im Standardmodus kannst du '+
  'jeden davon ansehen und überschreiben.',
  en:'This is how getting-started mode works: broad areas instead of single questions. '+
  'The individual items inside are not listed here — switch to standard mode to see '+
  'and override each of them.'},
 notAskedShort:{de:'im Einstieg nicht enthalten',en:'not part of getting-started mode'},
 notAskedTheme:{de:'Im Einstieg nicht enthalten. Wechsle in den Standardmodus, wenn du '+
  'diesen Bereich ansehen möchtest.',
  en:'Not part of getting-started mode. Switch to standard mode to see this area.'},
 skip:{de:'nicht relevant',en:'not relevant'},
 inherited:{de:'geerbt',en:'inherited'},
 strafeAx:{de:'Strafe',en:'Punishment'},
 strafeGeben:{de:'Strafe verhängen',en:'Imposing punishment'},
 strafeNehmen:{de:'Strafe erhalten',en:'Receiving punishment'},
 expAx:{de:'Erfahrung',en:'Experience'},
 fantasy:{de:'nur Fantasie',en:'fantasy only'},
 star:{de:'besonders wichtig',en:'especially important'},
 note:{de:'Notiz',en:'Note'},
 shared:{de:'teilen',en:'share'},
 noExp:{de:'Ich habe noch keine Erfahrung',en:'I have no experience yet'},
 showP:{de:'Strafen sind für mich ein Thema',en:'Punishment is relevant for me'},
 showX:{de:'Erfahrung angeben',en:'Record experience'},
 showSt:{de:'Besonders wichtig markieren',en:'Mark what matters most'},
 setCount:{de:'ausdrücklich bewertet',en:'explicitly rated'},
 clarCount:{de:'geklärt',en:'resolved'},
 hardBlocks:{de:'Hard Limit schließt „echte Strafe" aus.',en:'A hard limit rules out real punishment.'},
 noInherit:{de:'Einzeln bewerten — hier sind die Punkte Alternativen',
   en:'Rate individually — these items are alternatives'},
 allTheme:{de:'Ganzer Bereich auf einmal',en:'Whole theme at once'},
 allSec:{de:'Ganze Sektion auf einmal',en:'Whole section at once'},
 allGrp:{de:'Ganze Gruppe auf einmal',en:'Whole group at once'},
 inheritWhy:{de:'Eine Bewertung hier gilt als Vorgabe für alles darunter. Einzelne Punkte kannst du danach abweichend bewerten; geerbte Werte erscheinen gestrichelt.',
   en:'A rating here applies as a default to everything below. You can still rate single items differently; inherited values appear dashed.'},
 moreAx:{de:'Strafe und Erfahrung für diesen Punkt einblenden',en:'Show punishment and experience for this item'},
 axBar:{de:'Achsen einblenden',en:'Show axes'}
};
const L=(o)=>ST.lang==='en'?(o.en||o.de):o.de;
const LB=(x)=>ST.lang==='en'?(x.en||x.de):x.de;   /* fuer Items/Sektionen */
const scLbl=(kind,v)=>{const s=(SC[kind]||DATA.tree.choices[kind]||[]).find(o=>o.v===v);
  return s?(ST.lang==='en'?(s.en||s.label_en||s.de||s.label_de):(s.de||s.label_de)):v;};
const optsOf=(kind)=>SC[kind]||(DATA.tree.choices[kind]||[]).map(o=>
  ({v:o.v,de:o.label_de,en:o.label_en,dde:o.desc_de,den:o.desc_en}));
const hasDesc=(opts)=>opts.some(o=>o.dde||o.den);

/* ---------- Index ---------- */
const IDX={items:[],byId:{},sec:{},theme:{},secOf:{}};
DATA.tree.themes.sort((a,b)=>a.order-b.order).forEach(t=>{
  IDX.theme[t.id]=t;
  t.sections.forEach(s=>{
    s.theme=t.id; s.exempt=!!t.exempt; IDX.sec[s.id]=s;
    s.items=(DATA.items[s.id]||{items:[]}).items;
    s.dropped=(DATA.items[s.id]||{}).dropped||[];
    s.items.forEach(it=>{
      it.sec=s.id; it.theme=t.id; it.exempt=s.exempt;
      it.kind=s.type==='scale'?'wunsch':s.type==='vereinbarung'?(it.scale||'vereinbarung'):s.type;
      /* Rollentrennung gilt jetzt auch im Vereinbarungsteil: dort entscheidet die
         Rolle ueber die Bedeutung („fuer mich brauche ich das nicht" ist etwas
         anderes als „ich gebe es dir nicht"). */
      const rollig=(s.type==='scale')||(it.kind==='vereinbarung');
      it.units=(rollig&&it.ap)?['#a','#p']:[''];
      IDX.items.push(it); IDX.byId[it.id]=it;
    });
  });
});
const THEMES=DATA.tree.themes;

/* ---------- Zustand ---------- */
const KEY='kinkcompass_v2';
/* Ein frischer Bogen startet im Einstieg. Wer die Datei zum ersten Mal oeffnet,
   hat sich nicht entschieden — und die beiden Fehlerfaelle sind ungleich: eine
   Anfaengerin, die in 891 Items landet, hoert auf; eine erfahrene Person
   schaltet oben in einem Klick um. Ein gespeicherter Bogen behaelt seinen Modus. */
const BLANK=()=>({v:APP.schema,lang:'de',mode:'e',meta:{},
  w:{},p:{},x:{},f:{},star:{},ag:{},tx:{},multi:{},notes:{},
  nodeW:{},nodeP:{},nodeF:{},skip:{},
  rank:[],secRank:{},toys:[],
  noExp:false,showP:false,showX:false,showSt:true,more:{},open:{},step:0});
let ST=BLANK();
try{const raw=localStorage.getItem(KEY); if(raw){const o=JSON.parse(raw);
  if(o&&typeof o==='object') ST=Object.assign(BLANK(),o);}}catch(e){}
/* Auf file:// koennen manche Browser localStorage sperren. Ein stiller Verlust
   eines ausgefuellten Bogens waere der schlimmste Fehlerfall — deshalb pruefen
   wir aktiv und sagen es, statt es zu verschlucken. */
let STORAGE_OK=true;
try{localStorage.setItem(KEY+'_probe','1'); localStorage.removeItem(KEY+'_probe');}
catch(e){STORAGE_OK=false;}
let saveT=null,saveFailed=false;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{
  try{localStorage.setItem(KEY,JSON.stringify(ST)); if(saveFailed){saveFailed=false;storageWarn();}}
  catch(e){ if(!saveFailed){saveFailed=true; STORAGE_OK=false; storageWarn(); } }},250);}
/* Hinweisband zu Fassungsunterschieden */
function versionNote(rep){
  const b=document.getElementById('versionwarn'); if(!b) return;
  const en=ST.lang==='en', parts=[];
  const msg=rep?migSummary(rep):'';
  if(msg) parts.push(msg);
  const lf=ST.loadedFrom;
  if(lf&&lf.listRev&&lf.listRev!==APP.listRev)
    parts.push((en?'The file was filled in against list revision '
      :'Die Datei wurde mit Listenfassung ')+lf.listRev+
      (en?', this version is ':' ausgefüllt, aktuell ist ')+APP.listRev+
      (en?'. Items added since then simply appear unanswered.'
        :'. Seither ergänzte Punkte erscheinen schlicht als unbeantwortet.'));
  if(lf&&lf.schema&&lf.schema>APP.schema)
    parts.push(en?'The file comes from a newer version of the tool. Some entries may not have been read.'
      :'Die Datei stammt aus einer neueren Fassung des Werkzeugs. Einzelne Angaben wurden möglicherweise nicht gelesen.');
  const orph=ST.orphans?Object.keys(ST.orphans).length:0;
  if(orph&&!msg) parts.push(orph+(en?' entries from older versions travel along unchanged.'
    :' Angaben aus älteren Fassungen werden unverändert mitgeführt.'));
  if(!parts.length){ b.style.display='none'; return; }
  b.style.display='block'; b.textContent=parts.join(' ');
}
function storageWarn(){
  const b=document.getElementById('storagewarn'); if(!b) return;
  if(STORAGE_OK){b.style.display='none'; return;}
  b.style.display='block';
  b.innerHTML=(ST.lang==='en'
    ?'<b>Autosave is not working in this browser.</b> Your entries are kept in memory only and '+
     'will be lost when you close the tab. Export as JSON or Markdown regularly — that always works.'
    :'<b>Die automatische Speicherung funktioniert in diesem Browser nicht.</b> Deine Eingaben '+
     'liegen nur im Arbeitsspeicher und gehen beim Schließen des Tabs verloren. Exportiere '+
     'regelmäßig als JSON oder Markdown — das funktioniert immer.');
}

/* ---------- Fassungswechsel ----------
   Aeltere Exporte muessen lesbar bleiben. Ids, die umbenannt wurden, werden
   umgeschrieben; Ids, die es nicht mehr gibt, werden NICHT weggeworfen, sondern
   als Waise mitgefuehrt und beim Export wieder mitgeschrieben. Stiller
   Datenverlust ist der schlimmere Fehler. */
const MIG=DATA.migrations||{}, MIGWHY=DATA.migrationReasons||{};
const hasMig=(id)=>Object.prototype.hasOwnProperty.call(MIG,id);
const migId=(id)=>hasMig(id)?MIG[id]:id;
function splitUnit(k){
  const role=/#[ap]$/.test(k)?k.slice(-2):'';
  return [role?k.slice(0,-2):k, role];
}
const ITEMSTORES=['w','p','x','f','star','ag','tx','notes','more'];
const NODESTORES=['nodeW','nodeP','nodeF','skip','open'];
function migrateState(st){
  const rep={renamed:0,removed:0,unknown:0,nodes:0,labels:[]};
  st.orphans=st.orphans||{};
  ITEMSTORES.forEach(name=>{
    const src=st[name]||{}, out={};
    Object.keys(src).forEach(k=>{
      const u=splitUnit(k), id=u[0], role=u[1];
      const n=migId(id);
      if(n===null){ rep.removed++; rep.labels.push(id);
        st.orphans[name+'|'+k]=src[k]; return; }
      if(n!==id) rep.renamed++;
      if(!IDX.byId[n]){ rep.unknown++; rep.labels.push(n);
        st.orphans[name+'|'+k]=src[k]; return; }
      out[n+role]=src[k];
    });
    st[name]=out;
  });
  NODESTORES.forEach(name=>{
    const src=st[name]||{}, out={};
    Object.keys(src).forEach(k=>{
      /* Knoten koennen ein Rollen-Suffix tragen: 'G:sek.gruppe#p' */
      const u=splitUnit(k), base=u[0], role=u[1];
      const n=migId(base);
      if(n===null||!nodeExists(n)){ rep.nodes++; return; }
      out[n+role]=src[k];
    });
    st[name]=out;
  });
  st.rank=(st.rank||[]).map(k=>{
    const u=splitUnit(k), n=migId(u[0]);
    return (n&&IDX.byId[n])?n+u[1]:null;}).filter(Boolean);
  const sr={};
  Object.keys(st.secRank||{}).forEach(k=>{
    const parts=k.split('|'), sid=parts[0];
    if(!IDX.sec[sid]) return;
    sr[k]=(st.secRank[k]||[]).map(x=>{
      const u=splitUnit(x), n=migId(u[0]);
      return (n&&IDX.byId[n])?n+u[1]:null;}).filter(Boolean);
  });
  st.secRank=sr;
  const mu={};
  Object.keys(st.multi||{}).forEach(sid=>{
    if(!IDX.sec[sid]) return;
    mu[sid]=(st.multi[sid]||[]).map(id=>{
      const n=migId(id); return (n&&IDX.byId[n])?n:null;}).filter(Boolean);
  });
  st.multi=mu;
  return rep;
}
function nodeExists(k){
  if(k.indexOf('T:')===0) return !!IDX.theme[k.slice(2)];
  if(k.indexOf('S:')===0) return !!IDX.sec[k.slice(2)];
  if(k.indexOf('G:')===0){
    const rest=k.slice(2), i=rest.indexOf('.'), sid=rest.slice(0,i), gid=rest.slice(i+1);
    return !!(IDX.sec[sid]&&IDX.sec[sid].groups.some(g=>g.id===gid));
  }
  return false;
}
function migSummary(rep){
  const en=ST.lang==='en', b=[];
  if(rep.renamed) b.push(rep.renamed+(en?' entries moved to their new item'
    :' Angaben auf ihren neuen Punkt umgezogen'));
  if(rep.removed) b.push(rep.removed+(en?' entries belong to items that no longer exist'
    :' Angaben gehören zu Punkten, die es nicht mehr gibt'));
  if(rep.unknown) b.push(rep.unknown+(en?' entries are unknown here — a newer version?'
    :' Angaben sind hier unbekannt — neuere Fassung?'));
  if(rep.nodes) b.push(rep.nodes+(en?' group ratings dropped'
    :' Bewertungen auf Gruppenebene entfallen'));
  if(!b.length) return '';
  return (en?'Loaded from an older version. ':'Aus einer älteren Fassung geladen. ')+
    b.join(' · ')+(rep.removed||rep.unknown
      ? (en?'. Nothing was deleted — they travel along and are written back on export.'
          :'. Gelöscht wurde nichts — sie werden mitgeführt und beim Export wieder mitgeschrieben.')
      : '.');
}

/* Vereinbarungen: rollenspezifischer Wert, sonst der rollenlose als Rueckfall.
   Damit bleiben Antworten aus Fassungen ohne Rollentrennung gueltig. */
function agOf(it,u){ return ST.ag[it.id+(u||'')]||ST.ag[it.id]||''; }
function agSet(it,u,v){
  const k=it.id+(u||'');
  if(v) ST.ag[k]=v; else delete ST.ag[k];
  if(u&&ST.ag[it.id]&&!ST.ag[it.id+'#a']&&!ST.ag[it.id+'#p']) return;
  if(u&&ST.ag[it.id]) delete ST.ag[it.id];
}
/* ---------- Vererbung ---------- */
const chainOf=(it)=>['G:'+it.sec+'.'+it.group,'S:'+it.sec,'T:'+it.theme];
function effOf(store,nodeStore,it,role){
  const k=it.id+(role||'');
  if(store[k]) return {v:store[k],src:'set'};
  if(it.exempt) return {v:null,src:null};
  for(const nk of chainOf(it)){
    /* Ein Haken am Themennamen ist die groebste Geste im ganzen Bogen. Im
       Einstieg ist sie sogar die einzige. Sie darf nicht stillschweigend
       „Ravishment-Fantasie" oder „Blut" mitbewerten: Praktiken mit Risiko-
       hinweis erbt man nicht von der Themenebene, die muessen benannt werden.
       Gruppen- und Sektionsebene bleiben moeglich — dort sieht man, worauf
       man den Haken setzt. */
    if((it.risk||it.nosweep)&&nk.charAt(0)==='T') continue;
    if(role&&nodeStore[nk+role]) return {v:nodeStore[nk+role],src:'inh',from:nk};
    if(nodeStore[nk]) return {v:nodeStore[nk],src:'inh',from:nk};
  }
  return {v:null,src:null};
}
const effW=(it,role)=>effOf(ST.w,ST.nodeW,it,role);
const effP=(it,role)=>effOf(ST.p,ST.nodeP,it,role);
const effF=(it)=>effOf(ST.f,ST.nodeF,it,'');
function isSkipped(it){
  if(it.exempt) return false;
  return chainOf(it).some(nk=>ST.skip[nk]);
}
const nodeSkipped=(nk)=>{
  if(ST.skip[nk]) return true;
  if(nk.startsWith('G:')){const s=nk.slice(2).split('.')[0];
    return !!(ST.skip['S:'+s]||ST.skip['T:'+IDX.sec[s].theme]);}
  if(nk.startsWith('S:')) return !!ST.skip['T:'+IDX.sec[nk.slice(2)].theme];
  return false;
};

/* ---------- Sichtbarkeit nach Modus ---------- */
const lvOK=(it)=>MODES[ST.mode].indexOf(it.level)>=0;
const visItems=(s)=>s.items.filter(lvOK);
const allItems=(t)=>[].concat.apply([],t.sections.map(s=>s.items));
const visOfTheme=(t)=>[].concat.apply([],t.sections.map(visItems));
/* Im Einstieg wird ein Bereich ohne eigene Einstiegsitems nur als Ganzes bewertet.
   Die Bewertung vererbt sich trotzdem auf alle Items — ein Einstiegsprofil bleibt
   deshalb mit einem ausfuehrlich ausgefuellten vergleichbar. */
const isEkat=(t)=>ST.mode==='e'&&!!t.ekat;
const themeShown=(t)=>visOfTheme(t).length>0||isEkat(t);
const inProgress=(it)=>['wunsch','vereinbarung','angabe','text'].indexOf(it.kind)>=0
  ||!!DATA.tree.choices[it.kind];

/* ---------- Fortschritt ---------- */
function countUnits(items){
  let set=0,clar=0,tot=0;
  items.forEach(it=>{
    if(!inProgress(it)) return;
    if(it.kind==='text'){tot++; if((ST.tx[it.id]||'').trim()){set++;clar++;} return;}
    if(it.kind==='wunsch'){
      it.units.forEach(u=>{tot++;const e=effW(it,u);
        if(e.src==='set'){set++;clar++;} else if(e.src==='inh'||isSkipped(it)) clar++;});
      return;
    }
    it.units.forEach(u=>{tot++; if(agOf(it,u)){set++;clar++;}});
  });
  return {set:set,clar:clar,tot:tot};
}
function updateProgress(){
  const vis=IDX.items.filter(it=>lvOK(it));
  const k=countUnits(vis.filter(it=>!it.exempt));
  const s=countUnits(vis.filter(it=>it.exempt));
  const put=(pre,o)=>{
    document.getElementById('pb'+pre+'S').style.width=(o.tot?100*o.set/o.tot:0)+'%';
    document.getElementById('pb'+pre+'C').style.width=(o.tot?100*o.clar/o.tot:0)+'%';
    document.getElementById('pi'+pre).textContent=
      o.set+' '+L(T.setCount)+' · '+o.clar+' '+L(T.clarCount)+' / '+o.tot;
  };
  put('Kink',k); put('Safe',s);
}
</script>
