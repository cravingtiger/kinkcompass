<script>
"use strict";
/* ==================== Einstiegs-Schalter ==================== */
function switchBlock(){
  /* Vier Schalter ueber zusaetzliche Achsen sind im Einstieg genau das,
     was ueberfordert — dort erklaert stattdessen ein Satz, worum es geht. */
  if(ST.mode==='e') return einstiegBlock();
  const c=el('div','card');
  c.appendChild(el('h3',null,L(T.axBar)));
  c.appendChild(el('div','hint',ST.lang==='en'
    ?'Off by default so a row stays readable. With ＋ on a single item you can show them just there.'
    :'Standardmäßig aus, damit eine Zeile lesbar bleibt. Mit ＋ an einem einzelnen Punkt blendest du sie nur dort ein.'));
  const row=el('div','axrow');
  [['showP',T.showP],['showX',T.showX],['showSt',T.showSt],['noExp',T.noExp]].forEach(([k,lab])=>{
    const b=el('button','chip'+(ST[k]?' sel':''),L(lab)); b.type='button';
    if(ST[k])b.style.background='var(--accent)';
    b.onclick=()=>{ST[k]=!ST[k]; save(); rerender();};
    row.appendChild(b);
  });
  c.appendChild(row);
  return c;
}

function einstiegBlock(){
  const en=ST.lang==='en', c=el('div','card');
  c.appendChild(el('h3',null,en?'Getting started':'Einstieg'));
  const p=el('div','hint');
  p.innerHTML=en
    ?'A first rough map — about fifty questions, nothing extreme. The fun part comes first: '+
     'what appeals to you. Then how a first meeting should go, and last of all your limits. '+
     '<b>Don\'t know yet? Leave it blank</b> — open does not mean no. Areas you only see as a '+
     'heading are rated as a whole. Switch to <b>Standard</b> whenever you want detail.'
    :'Eine erste grobe Karte — rund fünfzig Fragen, nichts Drastisches. Zuerst das Spannende: '+
     'was dich reizt. Dann, wie ein erstes Treffen ablaufen soll, und zum Schluss deine Limits. '+
     '<b>Weißt du noch nicht? Lass es leer</b> — offen heißt nicht nein. Bereiche, die du nur '+
     'als Überschrift siehst, bewertest du im Ganzen. In den <b>Standard</b>modus kannst du '+
     'jederzeit wechseln.';
  c.appendChild(p);
  return c;
}

/* ==================== Skalen-Legende ==================== */
function legendBlock(){
  const en=ST.lang==='en', c=el('div','card');
  c.appendChild(el('h3',null,en?'What the scales mean':'Was die Skalen bedeuten'));
  const part=(title,opts,note)=>{
    c.appendChild(el('h5',null,title));
    if(note) c.appendChild(el('div','hint',note));
    const ul=el('ul'); ul.style.cssText='margin:4px 0 12px;padding-left:18px';
    opts.forEach(o=>{
      const li=el('li'); li.style.margin='3px 0';
      const b=el('b',null,LB(o));
      const col={must:'must',neigung:'neigung',sehnsucht:'sehnsucht',interessant:'interessant',
        neutral:'neutral',soft:'soft',hard:'hard',na:'na',reizvoll:'reizvoll',echt:'echt',
        verbindlich:'verbindlich',gewuenscht:'gewuenscht',verhandelbar:'verhandelbar',
        'nicht-noetig':'nicht-noetig',ablehnend:'ablehnend',
        keine:'keine',einmal:'einmal',gelegentlich:'gelegentlich',viel:'viel'}[o.v];
      if(col) b.style.color='var(--c-'+col+')';
      li.appendChild(b);
      const d=LB({de:o.dde,en:o.den});
      if(d) li.appendChild(el('span',null,' — '+d));
      ul.appendChild(li);
    });
    c.appendChild(ul);
  };
  part(en?'Desire scale':'Wunsch-Skala', wunschOpts(),
    en?'One step per item. In getting-started mode a subset of the same codes is shown.'
      :'Eine Stufe pro Punkt. Im Einstiegsmodus wird eine Teilmenge derselben Codes gezeigt.');
  part(en?'Punishment axis — bottom':'Strafe-Achse — Bottom', strafeOpts('#p'),
    en?'Separate from the desire scale, because a punishment that arouses is not a punishment. A hard limit rules out real punishment.'
      :'Getrennt von der Wunsch-Skala, weil eine Strafe, die erregt, keine Strafe ist. Hard Limit schließt „echte Strafe" aus.');
  part(en?'Punishment axis — top':'Strafe-Achse — Top', strafeOpts('#a'),
    en?'On this side the question is different: are you willing to impose it?'
      :'Auf dieser Seite lautet die Frage anders: bist du bereit, es zu verhängen?');
  part(en?'Experience':'Erfahrung', SC.erfahrung,
    en?'Independent of desire: “hard limit, but experienced” and “must-have, never tried” are both valid.'
      :'Unabhängig vom Wunsch: „Hard Limit, aber erlebt" und „Must-have, nie probiert" sind beide gültig.');
  part(en?'Agreement scale':'Vereinbarungs-Skala', SC.vereinbarung,
    en?'Used in Framework and safety. These are conditions, not preferences — never inherited.'
      :'Gilt in Rahmen und Sicherheit. Das sind Bedingungen, keine Vorlieben — nie vererbt.');
  const lm=optsOf('leitmodell');
  if(lm&&lm.length) part(en?'Risk models':'Risikomodelle', lm,
    en?'The frameworks the scene works by. They differ in how they treat risk — which is why the comparison flags a mismatch.'
      :'Die Modelle, nach denen in der Szene gearbeitet wird. Sie unterscheiden sich im Umgang mit Risiko — deshalb weist der Vergleich einen Unterschied aus.');
  return c;
}
function toggleLegend(){
  const v=document.getElementById('vLegend');
  const on=v.style.display!=='block';
  v.style.display=on?'block':'none';
  v.innerHTML=''; if(on) v.appendChild(legendBlock());
  document.getElementById('bLegend').classList.toggle('on',on);
}

/* ==================== Gefuehrter Ablauf ==================== */
/* Die Limits stehen als eigener, letzter Schritt — getrennt vom uebrigen
   Rahmen. Freitext, weil niemand seine Grenzen vorher in Kategorien kennt. */
const LIMSEC='grenzen-gesundheit';
function stepList(){
  /* Erst das, was Spass macht, dann der Rahmen, ganz zuletzt die Limits.
     Wer als Erstes liest, wogegen man sich absichern muss, hoert auf, bevor
     er weiss, was er eigentlich will. Die Prioritaeten stehen deshalb nicht
     mehr am Ende, sondern direkt nach den Neigungen, um die es dort geht.
     Ein Schritt, der nichts zeigt, ist im gefuehrten Ablauf reine Irritation. */
  const shown=THEMES.filter(themeShown);
  const steps=shown.filter(t=>!t.exempt).map(t=>({t:t}));
  steps.push({prio:true});
  shown.filter(t=>t.exempt).forEach(t=>{
    const rest=t.sections.filter(s=>s.id!==LIMSEC&&visItems(s).length);
    if(rest.length) steps.push({t:t,secs:rest});
    const lim=t.sections.filter(s=>s.id===LIMSEC&&visItems(s).length);
    if(lim.length) steps.push({t:t,secs:lim,limits:true});
  });
  return steps;
}
const stepItems=(s)=>s.secs?[].concat.apply([],s.secs.map(visItems)):visOfTheme(s.t);
const limitStep=()=>stepList().findIndex(s=>s.limits);
/* ---------- Karteikarten ----------
   Der gefuehrte Ablauf zeigt eine Frage pro Bildschirm. Eine Seite mit zwanzig
   Zeilen und einem Inhaltsverzeichnis darueber sieht fuer jemanden, der die
   Datei zum ersten Mal oeffnet, nach Formular aus; eine Karte nach einer
   Frage, die man beantworten kann. Die Schritte aus stepList bleiben das
   Inhaltsverzeichnis — am Rechner links daneben, auf dem Handy hinter einem
   Knopf, damit es nicht ueber der ersten Frage steht. */
const ADV_MS=450;
let advT=null;
function orderedItems(s){
  /* dieselbe Reihenfolge wie in der Liste: Gruppen, dann Ungruppiertes */
  const its=visItems(s), out=[];
  s.groups.forEach(g=>its.forEach(it=>{if(it.group===g.id)out.push(it);}));
  its.forEach(it=>{if(!it.group)out.push(it);});
  return out;
}
function cardList(){
  const steps=stepList(), cards=[{key:'w',welcome:true,step:-1}];
  steps.forEach((s,si)=>{
    if(s.prio){cards.push({key:'p',prio:true,step:si}); return;}
    const t=s.t;
    if(isEkat(t)){cards.push({key:'k:'+t.id,ekat:t,step:si}); return;}
    const secs=s.secs||t.sections;
    let first=true;
    secs.forEach(sec=>{
      const lead=first&&s.limits;
      if(sec.type==='toys'){ if(ST.mode!=='e') cards.push({key:'y:'+sec.id,toys:sec,step:si}); return; }
      const its=orderedItems(sec);
      if(!its.length) return;
      if(sec.type==='multi'){cards.push({key:'m:'+sec.id,multi:sec,step:si}); first=false; return;}
      its.forEach((it,i)=>cards.push({key:'i:'+it.id,it:it,step:si,lead:lead&&i===0}));
      first=false;
    });
  });
  cards.push({key:'d',done:true,step:steps.length});
  return cards;
}
function cardIndex(cards){
  const i=cards.findIndex(c=>c.key===ST.card);
  return i<0?0:i;
}
function goCard(i){
  clearTimeout(advT); advT=null;
  const cards=cardList();
  i=Math.max(0,Math.min(cards.length-1,i));
  ST.card=cards[i].key; save(); rerender(); window.scrollTo(0,0);
}
function goStep(si){
  const cards=cardList(), i=cards.findIndex(c=>c.step===si);
  if(i>=0) goCard(i);
}
const nextCard=()=>goCard(cardIndex(cardList())+1);
const prevCard=()=>goCard(cardIndex(cardList())-1);
/* Nach einer Antwort kurz stehen lassen, damit man sieht, was gewaehlt ist,
   dann weiter. Wer in der Pause selbst blaettert, hebt den Sprung auf. */
function advanceSoon(){
  clearTimeout(advT);
  const from=ST.card;
  advT=setTimeout(()=>{advT=null; if(ST.card===from&&document.body.dataset.view==='guide') nextCard();},ADV_MS);
}

/* Antwortknoepfe der Karte: gross, mit Beschreibung, eine Zeile pro Option
   auf dem Handy. Dieselben Codes und Farben wie in der Liste. */
function fcChips(opts,cur,onPick,inherited,compact){
  /* Zwei Fragen auf einer Karte (Top und Bottom) waeren mit Beschreibung zehn
     grosse Knoepfe untereinander. Dort kompakt: die Beschreibung steht als
     Tooltip und in der Legende. */
  const wrap=el('div','fcopts'+(compact?' two':''));
  opts.forEach(o=>{
    const c=el('button','chip fcopt'); c.type='button'; c.dataset.v=o.v;
    c.appendChild(el('span','fcl',LB(o)));
    const d=LB({de:o.dde,en:o.den});
    if(d){ if(compact) c.title=d; else c.appendChild(el('span','fcd',d)); }
    if(cur===o.v){c.classList.add('sel'); if(inherited)c.classList.add('inh');}
    c.onclick=()=>onPick(cur===o.v&&!inherited?null:o.v);
    wrap.appendChild(c);
  });
  styleSel(wrap,'');
  return wrap;
}
function roleHead(txt){ return el('div','fcrole',txt); }

function cardItem(c,box){
  const it=c.it, en=ST.lang==='en';
  if(c.lead) box.appendChild(limitsIntro());
  const h=el('h2','fq',LB({de:it.de,en:it.en}));
  if(it.risk){const b=el('span','badge '+it.risk,LB(it.risk==='hoch'
    ?{de:'Risiko hoch',en:'high risk'}:{de:'Risiko mittel',en:'moderate risk'}));
    b.style.marginLeft='8px'; h.appendChild(b);}
  box.appendChild(h);
  const expl=LB({de:it.expl_de,en:it.expl_en});
  if(expl) box.appendChild(el('p','fcexpl',expl));

  if(it.kind==='text'){
    const ta=el('textarea','fctext'); ta.value=ST.tx[it.id]||'';
    ta.placeholder=en?'Keywords are enough …':'Stichworte reichen …';
    ta.oninput=()=>{ST.tx[it.id]=ta.value; save(); updateProgress();};
    box.appendChild(ta);
    return;
  }
  /* Weitere Achsen (Strafe, Erfahrung) stehen nur auf der Karte, wenn sie
     eingeschaltet sind — dann springt die Karte nicht von selbst weiter,
     sonst waere sie weg, bevor die zweite Achse beantwortet ist. */
  const extra=it.kind==='wunsch'&&it.units.some(()=>showAx('showP',it)||(showAx('showX',it)&&!ST.noExp));
  const answered=()=>it.units.every(u=>it.kind==='wunsch'?effW(it,u).src==='set':!!agOf(it,u));
  const picked=(v)=>{save(); rerender(); if(v&&!extra&&answered()) advanceSoon();};
  it.units.forEach(u=>{
    if(u) box.appendChild(roleHead(LB(roleOf(it,u))));
    if(it.kind==='wunsch'){
      const e=effW(it,u);
      box.appendChild(fcChips(wunschOpts(),e.v,(v)=>{
        if(v)ST.w[it.id+u]=v; else delete ST.w[it.id+u];
        if(v==='hard'&&ST.p[it.id+u]==='echt') delete ST.p[it.id+u];
        picked(v);
      },e.src==='inh',it.units.length>1));
      if(showAx('showP',it)){
        const ep=effP(it,u);
        const pr=chipRow(strafeOpts(u),ep.v,(v)=>{
          if(v)ST.p[it.id+u]=v; else delete ST.p[it.id+u]; save(); rerender();
        },L(u==='#a'?T.strafeGeben:u==='#p'?T.strafeNehmen:T.strafeAx),
          ep.src==='inh',e.v==='hard'?['echt']:null);
        styleSel(pr,'strafe'); box.appendChild(pr);
      }
      if(showAx('showX',it)&&!ST.noExp){
        const xr=chipRow(SC.erfahrung,ST.x[it.id+u]||'',(v)=>{
          if(v)ST.x[it.id+u]=v; else delete ST.x[it.id+u]; save(); rerender();
        },L(T.expAx),false,null);
        styleSel(xr,'erfahrung'); box.appendChild(xr);
      }
    } else {
      box.appendChild(fcChips(optsOf(it.kind),agOf(it,u),(v)=>{agSet(it,u,v); picked(v);},false,it.units.length>1));
    }
  });

  /* Nebensachen klein darunter: Stern, Fantasie, Notiz */
  const tail=el('div','fctail');
  if(it.kind==='wunsch'){
    if(showAx('showSt',it)) it.units.forEach(u=>{
      const on=!!ST.star[it.id+u];
      const sb=el('button','chip star'+(on?' sel':''),'★ '+(en?'matters most':'besonders wichtig')+
        (it.ap?' · '+LB(roleOf(it,u)):''));
      sb.type='button';
      sb.onclick=()=>{if(on)delete ST.star[it.id+u];
        else{ST.star[it.id+u]=1; if(ST.rank.indexOf(it.id+u)<0)ST.rank.push(it.id+u);}
        save(); rerender();};
      tail.appendChild(sb);
    });
    const ef=effF(it);
    const fb=el('button','chip'+(ef.v?' sel':'')+(ef.src==='inh'?' inh':''),L(T.fantasy));
    fb.type='button'; if(ef.v)fb.style.background='var(--c-sehnsucht)';
    fb.onclick=()=>{if(ST.f[it.id])delete ST.f[it.id]; else ST.f[it.id]=1; save(); rerender();};
    tail.appendChild(fb);
  }
  const hasN=!!(ST.notes[it.id]&&ST.notes[it.id].t);
  const nb=el('button','chip'+(hasN?' sel':''),L(T.note)); nb.type='button';
  const cmt=el('div','fccmt'+(hasN?'':' hidden'));
  nb.onclick=()=>cmt.classList.toggle('hidden');
  tail.appendChild(nb); box.appendChild(tail);
  const ta=el('textarea'); ta.value=(ST.notes[it.id]||{}).t||''; ta.placeholder=L(T.note);
  ta.oninput=()=>{ST.notes[it.id]=ST.notes[it.id]||{}; ST.notes[it.id].t=ta.value; save();};
  cmt.appendChild(ta);
  const lb=el('label','cmtbar'); const cb=el('input'); cb.type='checkbox';
  cb.checked=!!(ST.notes[it.id]||{}).sh;
  cb.onchange=()=>{ST.notes[it.id]=ST.notes[it.id]||{}; ST.notes[it.id].sh=cb.checked; save();};
  lb.appendChild(cb); lb.appendChild(el('span',null,L(T.shared))); cmt.appendChild(lb);
  box.appendChild(cmt);
}
function cardEkat(t,box){
  box.appendChild(el('h2','fq',LB({de:t.title_de,en:t.title_en})));
  const was=LB({de:t.ekat_de,en:t.ekat_en});
  if(was) box.appendChild(el('p','fcexpl',was));
  box.appendChild(el('div','fcask',ST.lang==='en'?'How much does this area interest you?'
    :'Wie sehr interessiert dich dieser Bereich?'));
  const all=allItems(t), ap=nodeIsAp(all), roles=ap?['#a','#p']:[''];
  roles.forEach(r=>{
    if(r) box.appendChild(roleHead(LB(ROLE[r.slice(1)]))); 
    box.appendChild(fcChips(wunschOpts(),ST.nodeW['T:'+t.id+r]||'',(v)=>{
      if(v)ST.nodeW['T:'+t.id+r]=v; else delete ST.nodeW['T:'+t.id+r];
      save(); rerender();
      if(v&&roles.every(x=>ST.nodeW['T:'+t.id+x])) advanceSoon();
    },false,roles.length>1));
  });
  box.appendChild(noteEl(L(T.ekatWhy)));
}
function cardWelcome(box){
  const en=ST.lang==='en';
  box.appendChild(el('h2','fq',en?'Welcome':'Willkommen'));
  const p=el('div','fcexpl');
  p.innerHTML=(en
    ?'<p>One question at a time. Tap an answer and the next card follows by itself; '+
     '<b>‹ ›</b> or swiping takes you back and forth.</p>'+
     '<p>You can skip anything — <b>open does not mean no</b>. Everything you enter stays in '+
     'this browser on this device.</p>'+
     '<p>Some cards ask twice: <b>Top</b> means you do it, <b>Bottom</b> means it is done to you.</p>'
    :'<p>Eine Frage nach der anderen. Tipp eine Antwort an, dann kommt die nächste Karte von '+
     'selbst; mit <b>‹ ›</b> oder Wischen geht es vor und zurück.</p>'+
     '<p>Du kannst alles überspringen — <b>offen heißt nicht nein</b>. Was du eingibst, bleibt '+
     'in diesem Browser auf diesem Gerät.</p>'+
     '<p>Manche Karten fragen zweimal: <b>Top</b> heißt, du machst es, <b>Bottom</b> heißt, '+
     'es wird mit dir gemacht.</p>');
  box.appendChild(p);
  /* Im Einstieg sagt die Begruessung schon alles; einstiegBlock waere dieselbe
     Einleitung ein zweites Mal. In Standard und Vollstaendig stehen hier die
     Achsenschalter. */
  if(ST.mode!=='e'){const sw=switchBlock(); if(sw) box.appendChild(sw);}
  const f=el('div','f'); f.style.marginTop='12px';
  f.appendChild(el('label',null,en?'Pseudonym (optional, shows up in the export)'
    :'Pseudonym (freiwillig, steht im Export)'));
  const inp=el('input'); inp.type='text'; inp.value=ST.meta.alias||'';
  inp.oninput=()=>{ST.meta.alias=inp.value; save(); bindMeta();};
  f.appendChild(inp); box.appendChild(f);
}
function cardDone(box){
  const en=ST.lang==='en';
  box.appendChild(el('h2','fq',en?'Done!':'Geschafft!'));
  box.appendChild(el('p','fcexpl',en
    ?'Save your answers as a file. Markdown is easy to read and to send; JSON can be loaded back in later. '+
     'Nothing is uploaded anywhere.'
    :'Speichere deine Antworten als Datei. Markdown lässt sich gut lesen und verschicken, JSON später '+
     'wieder laden. Hochgeladen wird nichts.'));
  const row=el('div','fcdone');
  [[en?'Save as Markdown':'Als Markdown speichern','btn pri',()=>saveMD()],
   [en?'Save as JSON':'Als JSON speichern','btn',()=>saveJSON()],
   [en?'See summary':'Auswertung ansehen','btn',()=>setView('eval')],
   [en?'Compare with someone':'Mit jemandem vergleichen','btn',()=>setView('cmp')]]
   .forEach(([t,cls,fn])=>{const b=el('button',cls,t); b.type='button'; b.onclick=fn; row.appendChild(b);});
  box.appendChild(row);
}

/* Inhaltsverzeichnis: am Rechner als Seitenleiste, auf dem Handy als
   Einblendung. Ohne Zaehler „0/12 gesetzt" — das las sich wie eine
   Aufforderung. Ein Haken genuegt fuer das, was erledigt ist. */
function tocList(cur){
  const steps=stepList(), ul=el('ul','steps');
  const add=(label,si,done,onclick)=>{
    const li=el('li',si===cur?'cur':'');
    li.appendChild(el('span','sn',done?'✓':''));
    li.appendChild(el('span','sd',label));
    li.onclick=onclick; ul.appendChild(li);
  };
  add(ST.lang==='en'?'Welcome':'Willkommen',-1,false,()=>{closeToc(); goCard(0);});
  steps.forEach((s,si)=>{
    let label,done=false;
    if(s.prio) label=ST.lang==='en'?'Priorities':'Prioritäten';
    else if(s.limits) label=ST.lang==='en'?'Your limits':'Deine Limits';
    else label=LB({de:s.t.title_de,en:s.t.title_en});
    if(!s.prio){
      if(isEkat(s.t)) done=['','#a','#p'].some(r=>ST.nodeW['T:'+s.t.id+r]);
      else{const c=countUnits(stepItems(s)); done=c.tot>0&&c.clar>=c.tot;}
    }
    add(label,si,done,()=>{closeToc(); goStep(si);});
  });
  add(ST.lang==='en'?'Save':'Speichern',steps.length,false,()=>{closeToc(); goStep(steps.length);});
  return ul;
}
let tocBg=null;
function closeToc(){ if(tocBg){tocBg.remove(); tocBg=null;} }
function openToc(cur){
  closeToc();
  tocBg=el('div','modalbg'); const m=el('div','modal');
  m.appendChild(el('h3',null,ST.lang==='en'?'Overview':'Übersicht'));
  m.appendChild(tocList(cur));
  tocBg.appendChild(m); tocBg.onclick=(e)=>{if(e.target===tocBg) closeToc();};
  document.body.appendChild(tocBg);
}

function renderGuide(){
  const v=document.getElementById('vGuide'); v.innerHTML='';
  const cards=cardList(), i=cardIndex(cards), c=cards[i];
  ST.card=c.key;
  const en=ST.lang==='en', steps=stepList();
  const lay=el('div','guide');
  const side=el('nav','gside'); side.appendChild(tocList(c.step)); lay.appendChild(side);
  const main=el('div','gmain');
  const card=el('div','fcard');

  const top=el('div','fctop');
  const st=c.step>=0&&c.step<steps.length?steps[c.step]:null;
  top.appendChild(el('span','fcwhere',c.welcome?'KinkCompass':c.done?(en?'Save':'Speichern')
    :st.prio?(en?'Priorities':'Prioritäten'):st.limits?(en?'Your limits':'Deine Limits')
    :LB({de:st.t.title_de,en:st.t.title_en})));
  const right=el('span','fcpos');
  right.appendChild(el('span',null,(i+1)+' / '+cards.length));
  const tb=el('button','btn sm gtocbtn',en?'Overview':'Übersicht'); tb.type='button';
  tb.onclick=()=>openToc(c.step); right.appendChild(tb);
  top.appendChild(right); card.appendChild(top);
  const pb=el('div','fcbar'); const pi=el('i'); pi.style.width=(100*i/(cards.length-1))+'%';
  pb.appendChild(pi); card.appendChild(pb);

  const box=el('div','fcbody');
  if(c.welcome) cardWelcome(box);
  else if(c.done) cardDone(box);
  else if(c.prio) box.appendChild(prioBlock());
  else if(c.ekat) cardEkat(c.ekat,box);
  else if(c.multi){box.appendChild(el('h2','fq',LB({de:c.multi.title_de,en:c.multi.title_en})));
    box.appendChild(multiBlock(c.multi,orderedItems(c.multi)));}
  else if(c.toys){box.appendChild(el('h2','fq',LB({de:c.toys.title_de,en:c.toys.title_en})));
    const n=LB({de:c.toys.note_de,en:c.toys.note_en}); if(n) box.appendChild(noteEl(n));
    box.appendChild(toysBlock());}
  else cardItem(c,box);
  card.appendChild(box);

  const gn=el('div','gnav');
  const b1=el('button','btn',en?'‹ Back':'‹ Zurück'); b1.type='button';
  if(i===0) b1.disabled=true;
  b1.onclick=prevCard;
  const open=c.it&&(c.it.kind==='text'?!(ST.tx[c.it.id]||'').trim()
    :c.it.units.some(u=>c.it.kind==='wunsch'?!effW(c.it,u).v:!agOf(c.it,u)));
  const lbl2=c.welcome?(en?'Let’s go ›':'Los geht’s ›'):open?(en?'Skip ›':'Überspringen ›'):(en?'Next ›':'Weiter ›');
  if(!c.done){
    const b2=el('button','btn pri',lbl2); b2.type='button'; b2.onclick=nextCard;
    gn.appendChild(b1); gn.appendChild(b2);
  } else gn.appendChild(b1);
  card.appendChild(gn);

  /* Wischen: waagerecht und deutlich, sonst ist es Scrollen */
  let x0=null,y0=null;
  card.ontouchstart=(e)=>{const t=e.touches&&e.touches[0]; if(t){x0=t.clientX;y0=t.clientY;}};
  card.ontouchend=(e)=>{const t=e.changedTouches&&e.changedTouches[0]; if(!t||x0==null) return;
    const dx=t.clientX-x0, dy=t.clientY-y0; x0=null;
    if(/^(TEXTAREA|INPUT)$/.test((e.target&&e.target.tagName)||'')) return;
    if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)) (dx<0?nextCard:prevCard)();};

  main.appendChild(card); lay.appendChild(main); v.appendChild(lay);
}
document.addEventListener('keydown',(e)=>{
  if(document.body.dataset.view!=='guide'||e.altKey||e.ctrlKey||e.metaKey) return;
  if(/^(TEXTAREA|INPUT|SELECT)$/.test((e.target&&e.target.tagName)||'')) return;
  if(document.querySelector('.modalbg')) return;
  if(e.key==='ArrowRight'){e.preventDefault(); nextCard();}
  else if(e.key==='ArrowLeft'){e.preventDefault(); prevCard();}
});

function limitsIntro(){
  const en=ST.lang==='en', c=el('div','intro');
  c.innerHTML=en
    ?'<b>Almost done.</b> Now the part your counterpart has to know before you first meet: '+
     'what is off the table, and what your body and mind need taken into account. '+
     'Keywords are enough. At least one limit is required before you can save.'
    :'<b>Fast geschafft.</b> Jetzt das, was dein Gegenüber vor dem ersten Treffen wissen muss: '+
     'was nicht in Frage kommt und worauf Körper und Kopf Rücksicht brauchen. '+
     'Stichworte reichen. Ohne mindestens ein Limit lässt sich der Bogen nicht speichern.';
  return c;
}

/* ==================== Prioritaeten ==================== */
function unitLabel(key){
  /* lazy .*? wuerde die Rolle mitschlucken — deshalb ausdruecklich am Ende pruefen */
  const role=/#[ap]$/.test(key)?key.slice(-2):'';
  const id=role?key.slice(0,-2):key;
  const it=IDX.byId[id]; if(!it) return null;
  return {it:it,role:role,name:LB({de:it.de,en:it.en}),
    sec:LB({de:IDX.sec[it.sec].title_de,en:IDX.sec[it.sec].title_en}),
    roleName:role?LB(roleOf(it,role)):''};
}
function starredUnits(){
  const out=[];
  Object.keys(ST.star).forEach(k=>{if(ST.star[k]&&IDX.byId[k.replace(/#[ap]$/,'')])out.push(k);});
  const ranked=ST.rank.filter(k=>out.indexOf(k)>=0);
  const wOf=(k)=>{const u=unitLabel(k); return u?effW(u.it,u.role).v:null;};
  const rest=out.filter(k=>ranked.indexOf(k)<0)
    .sort((a,b)=>ORD.indexOf(wOf(a))-ORD.indexOf(wOf(b)));
  return ranked.concat(rest);
}
function move(arr,from,to){
  if(to<0||to>=arr.length) return arr;
  const x=arr.splice(from,1)[0]; arr.splice(to,0,x); return arr;
}
function prioBlock(){
  const c=el('div','card');
  c.appendChild(el('h3',null,ST.lang==='en'?'Priorities':'Prioritäten'));
  const units=starredUnits();
  if(!units.length){
    c.appendChild(el('div','hint',ST.lang==='en'
      ?'Nothing marked yet. Use the ★ button while rating — starred entries appear here and can be put in order.'
      :'Noch nichts markiert. Setze beim Bewerten den ★ — markierte Einträge erscheinen hier und lassen sich in eine Reihenfolge bringen.'));
    if(ST.mode==='e'&&!ST.showSt)
      c.appendChild(el('div','hint',ST.lang==='en'
        ?'The ★ button is hidden in getting-started mode — enable "Mark what matters most".'
        :'Der ★ ist im Einstiegsmodus ausgeblendet — aktiviere „Besonders wichtig markieren".'));
    return c;
  }
  c.appendChild(el('div','hint',ST.lang==='en'
    ?'Drag to reorder, or use the buttons. Order is optional; unordered stars count no less.'
    :'Zum Umsortieren ziehen oder die Tasten benutzen. Die Reihenfolge ist freiwillig; ungeordnete Sterne gelten nicht als unwichtiger.'));
  ST.rank=units.slice(); save();
  const ul=el('ul','ranklist');
  units.forEach((k,i)=>{
    const u=unitLabel(k); if(!u) return;
    const li=el('li','ranki'); li.draggable=true; li.dataset.k=k;
    li.appendChild(el('div','no',String(i+1)));
    const rt=el('div','rt');
    rt.appendChild(el('div',null,u.name+(u.roleName?' — '+u.roleName:'')));
    const e=effW(u.it,u.role);
    rt.appendChild(el('small',null,u.sec+' · '+(e.v?scLbl('wunsch',e.v):'—')+
      (e.src==='inh'?' ('+L(T.inherited)+')':'')));
    li.appendChild(rt);
    const mv=el('div','mv');
    [['⤒',0],['↑',i-1],['↓',i+1],['⤓',units.length-1]].forEach(([s,to])=>{
      const b=el('button','btn sm',s); b.type='button';
      b.onclick=()=>{move(ST.rank,i,to); save(); rerender();};
      mv.appendChild(b);
    });
    const rm=el('button','btn sm','★'); rm.type='button';
    rm.title=ST.lang==='en'?'remove star':'Stern entfernen';
    rm.onclick=()=>{delete ST.star[k];
      ST.rank=ST.rank.filter(x=>x!==k); save(); rerender();};
    mv.appendChild(rm);
    li.appendChild(mv);
    li.ondragstart=(ev)=>{ev.dataTransfer.setData('text/plain',k);li.classList.add('drag');};
    li.ondragend=()=>li.classList.remove('drag');
    li.ondragover=(ev)=>{ev.preventDefault();li.classList.add('over');};
    li.ondragleave=()=>li.classList.remove('over');
    li.ondrop=(ev)=>{ev.preventDefault();li.classList.remove('over');
      const src=ev.dataTransfer.getData('text/plain');
      const from=ST.rank.indexOf(src), to=ST.rank.indexOf(k);
      if(from>=0&&to>=0){move(ST.rank,from,to); save(); rerender();}};
    ul.appendChild(li);
  });
  c.appendChild(ul);
  return c;
}
function renderPrio(){
  const v=document.getElementById('vPrio'); v.innerHTML='';
  v.appendChild(prioBlock());
  /* Feinsortierung je Sektion */
  const c=el('div','card');
  c.appendChild(el('h3',null,ST.lang==='en'?'Fine ordering within a section':'Feinsortierung innerhalb einer Sektion'));
  const sel=el('select');
  sel.appendChild(el('option',null,'—'));
  THEMES.forEach(t=>t.sections.forEach(s=>{
    if(s.type!=='scale') return;
    const o=el('option',null,LB({de:s.title_de,en:s.title_en}));
    o.value=s.id; sel.appendChild(o);
  }));
  sel.value=ST.fineSec||'';
  const out=el('div');
  sel.onchange=()=>{ST.fineSec=sel.value; save(); rerender();};
  c.appendChild(sel); c.appendChild(out);
  if(ST.fineSec&&IDX.sec[ST.fineSec]){
    const s=IDX.sec[ST.fineSec];
    const buckets={};
    visItems(s).forEach(it=>it.units.forEach(u=>{
      const e=effW(it,u); if(!e.v||['neutral','na','hard','soft'].indexOf(e.v)>=0) return;
      (buckets[e.v]=buckets[e.v]||[]).push(it.id+u);
    }));
    ORD.forEach(b=>{
      if(!buckets[b]||buckets[b].length<2) return;
      const key=s.id+'|'+b;
      const cur=(ST.secRank[key]||[]).filter(k=>buckets[b].indexOf(k)>=0);
      const list=cur.concat(buckets[b].filter(k=>cur.indexOf(k)<0));
      ST.secRank[key]=list;
      out.appendChild(el('h5',null,scLbl('wunsch',b)));
      const ul=el('ul','ranklist');
      list.forEach((k,i)=>{
        const u=unitLabel(k); if(!u) return;
        const li=el('li','ranki');
        li.appendChild(el('div','no',String(i+1)));
        const rt=el('div','rt'); rt.appendChild(el('div',null,
          u.name+(u.roleName?' — '+u.roleName:''))); li.appendChild(rt);
        const mv=el('div','mv');
        [['↑',i-1],['↓',i+1]].forEach(([t2,to])=>{
          const b2=el('button','btn sm',t2); b2.type='button';
          b2.onclick=()=>{move(ST.secRank[key],i,to); save(); rerender();};
          mv.appendChild(b2);});
        li.appendChild(mv); ul.appendChild(li);
      });
      out.appendChild(ul);
    });
    if(!out.childNodes.length) out.appendChild(el('div','hint',ST.lang==='en'
      ?'Nothing to order here yet — at least two positive ratings in the same bucket are needed.'
      :'Hier gibt es noch nichts zu ordnen — es braucht mindestens zwei positive Bewertungen in derselben Stufe.'));
  }
  v.appendChild(c);
}

/* ==================== Auswertung ==================== */
function ratedUnits(){
  const out=[];
  IDX.items.forEach(it=>{
    if(it.kind!=='wunsch') return;
    it.units.forEach(u=>{
      const e=effW(it,u); if(!e.v) return;
      out.push({k:it.id+u,it:it,role:u,v:e.v,src:e.src,from:e.from,
        p:effP(it,u).v,f:effF(it).v,star:!!ST.star[it.id+u],
        rank:ST.rank.indexOf(it.id+u),x:ST.x[it.id+u]||''});
    });
  });
  return out;
}
function renderEval(){
  const v=document.getElementById('vEval'); v.innerHTML='';
  /* Im Einstieg ist die Bereichsantwort die vorgesehene Antwort, nicht eine
     Abkuerzung. Sie hier in 141 Einzelzeilen aufzufalten wuerde den Bogen
     genau dort wieder ueberfrachten, wo er kurz sein soll — und der Hinweis
     auf den „Anker" laese sich wie ein Vorwurf. Beides wird zusammengefasst. */
  const alle=ratedUnits();
  const ausKat=(r)=>r.src==='inh'&&r.from&&r.from.charAt(0)==='T'
    &&isEkat(IDX.theme[r.it.theme]);
  const R=ST.mode==='e'?alle.filter(r=>!ausKat(r)):alle;
  const kat=[];
  if(ST.mode==='e'){
    THEMES.filter(isEkat).forEach(t=>{
      ['','#a','#p'].forEach(u=>{
        const val=ST.nodeW['T:'+t.id+u];
        if(!val) return;
        kat.push({t:t,role:u,v:val,
          n:alle.filter(r=>r.it.theme===t.id&&r.role===(u||r.role)&&ausKat(r)).length});
      });
    });
  }
  const c=el('div','card');
  c.appendChild(el('h3',null,ST.lang==='en'?'Overview':'Auswertung'));
  const set=R.filter(r=>r.src==='set').length, inh=R.length-set;
  const pct=R.length?Math.round(100*set/R.length):0;
  c.appendChild(el('div','hint',R.length+(ST.lang==='en'?' rated entries: ':' bewertete Einträge: ')+
    set+(ST.lang==='en'?' set explicitly, ':' ausdrücklich gesetzt, ')+inh+
    (ST.lang==='en'?' inherited from a group or section.':' von einer Gruppe oder Sektion geerbt.')));
  /* Eine Gruppenbewertung, die nach unten durchschlaegt, ist ein Anker. Deshalb
     zeigen wir das Verhaeltnis, statt es zu verschweigen. */
  if(kat.length){
    const kc=el('div','egroup');
    kc.appendChild(el('h4',null,L(T.evalKat)+' ('+kat.length+')'));
    const kl=el('ul');
    kat.forEach(k=>{
      const li=el('li');
      li.appendChild(el('span',null,LB({de:k.t.title_de,en:k.t.title_en})+
        (k.role?' — '+LB(ROLE[k.role.slice(1)]):'')+' — '+scLbl('wunsch',k.v)));
      li.appendChild(el('small',null,' — '+L(T.evalKatGilt)+' '+k.n+' '+L(T.evalPunkte)));
      kl.appendChild(li);
    });
    kc.appendChild(kl); c.appendChild(kc);
    c.appendChild(el('div','hint',L(T.evalEinstieg)));
  }
  if(R.length&&ST.mode!=='e'){
    const bar=el('div','pbar'); bar.style.cssText='height:7px;max-width:420px;margin:7px 0 3px';
    const i1=el('i','set'); i1.style.width=pct+'%'; i1.style.position='relative';
    bar.appendChild(i1); c.appendChild(bar);
    c.appendChild(el('div','hint',pct+(ST.lang==='en'
      ?'\u2009% of your profile is your own explicit decision. A group rating carries downwards and is a strong anchor \u2014 the lower this share, the more of the profile comes from a handful of decisions.'
      :'\u2009% deines Profils sind eigene, ausdrückliche Entscheidungen. Eine Gruppenbewertung wirkt nach unten und ist ein starker Anker — je niedriger dieser Anteil, desto mehr des Profils stammt aus wenigen Klicks.')));
  }
  v.appendChild(c);
  ORD.forEach(b=>{
    const rows=R.filter(r=>r.v===b);
    if(!rows.length) return;
    rows.sort((a,b2)=>{
      const ra=a.rank<0?9999:a.rank, rb=b2.rank<0?9999:b2.rank;
      if(ra!==rb) return ra-rb;
      if(a.star!==b2.star) return a.star?-1:1;
      return a.it.de.localeCompare(b2.it.de);
    });
    const g=el('div','egroup');
    const h=el('h4',null,scLbl('wunsch',b)+' ('+rows.length+')');
    h.style.background='var(--c-'+b+')';
    if(b==='must')h.style.color='#1a1a1a';
    g.appendChild(h);
    const ul=el('ul');
    rows.forEach(r=>{
      const li=el('li');
      li.appendChild(el('span',null,(r.star?'★ ':'')+LB({de:r.it.de,en:r.it.en})+
        (r.role?' — '+LB(roleOf(r.it,r.role)):'')));
      const bits=[LB({de:IDX.sec[r.it.sec].title_de,en:IDX.sec[r.it.sec].title_en})];
      /* Die Vererbung kennt keinen Modus, die Liste schon: sonst stuende hier
         eine Bewertung, die man nirgends findet und nicht aendern kann. */
      if(!lvOK(r.it)) bits.push(L(T.ausserhalbModus));
      if(r.src==='inh') bits.push(L(T.inherited));
      if(r.p) bits.push(L(T.strafeAx)+': '+scLbl('strafe',r.p));
      if(r.f) bits.push(L(T.fantasy));
      if(r.x) bits.push(L(T.expAx)+': '+scLbl('erfahrung',r.x));
      if(r.it.risk) bits.push(ST.lang==='en'
        ?(r.it.risk==='hoch'?'high risk':'moderate risk'):'Risiko '+r.it.risk);
      li.appendChild(el('small',null,' — '+bits.join(' · ')));
      ul.appendChild(li);
    });
    g.appendChild(ul); v.appendChild(g);
  });
  /* Vereinbarungen */
  const ag=IDX.items.filter(it=>it.exempt&&it.units.some(u=>agOf(it,u)));
  if(ag.length){
    const g=el('div','egroup');
    g.appendChild(el('h4',null,ST.lang==='en'?'Framework and safety':'Rahmen und Sicherheit'));
    const ul=el('ul');
    ag.forEach(it=>{
      const li=el('li');
      li.appendChild(el('span',null,LB({de:it.de,en:it.en})));
      li.appendChild(el('small',null,' — '+it.units.map(u=>{const v=agOf(it,u);
        return v?((u?LB(roleOf(it,u))+': ':'')+scLbl(it.kind,v)):null;})
        .filter(Boolean).join(' · ')));
      ul.appendChild(li);
    });
    g.appendChild(ul); v.appendChild(g);
  }
}

/* ==================== Suche ==================== */
function doSearch(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  if(!q){ if(document.body.dataset.view==='search') setView(ST.prevView||'form'); return; }
  if(document.body.dataset.view!=='search'){ST.prevView=document.body.dataset.view; setView('search');}
  const v=document.getElementById('vSearch'); v.innerHTML='';
  const hits=IDX.items.filter(it=>lvOK(it)&&(
    (it.de||'').toLowerCase().indexOf(q)>=0||
    (it.en||'').toLowerCase().indexOf(q)>=0||
    (it.expl_de||'').toLowerCase().indexOf(q)>=0)).slice(0,300);
  const c=el('div','card');
  c.appendChild(el('h3',null,(ST.lang==='en'?'Search: ':'Suche: ')+hits.length+
    (hits.length>=300?'+':'')));
  v.appendChild(c);
  let lastSec=null, box=null;
  hits.forEach(it=>{
    if(it.sec!==lastSec){
      lastSec=it.sec; box=el('div','card');
      box.appendChild(el('h3',null,LB({de:IDX.sec[it.sec].title_de,en:IDX.sec[it.sec].title_en})));
      v.appendChild(box);
    }
    if(it.kind==='multi'||it.kind==='toys'){
      box.appendChild(el('div','hint',LB({de:it.de,en:it.en})));
    } else box.appendChild(itemRow(it));
  });
}
</script>
