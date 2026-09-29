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
    ?'A first rough map — about fifty questions, nothing extreme. Rate what you '+
     'recognise, leave the rest open: <b>not asked is not the same as refused</b>. '+
     'Areas you only see as a heading are rated as a whole; that is enough to compare '+
     'with someone else\'s profile. Switch to <b>Standard</b> whenever you want detail.'
    :'Eine erste grobe Karte — rund fünfzig Fragen, nichts Drastisches. Bewerte, was '+
     'du wiedererkennst, und lass den Rest offen: <b>nicht gefragt heißt nicht '+
     'abgelehnt</b>. Bereiche, die du nur als Überschrift siehst, bewertest du im '+
     'Ganzen — das genügt, um dein Profil mit einem anderen zu vergleichen. '+
     'In den <b>Standard</b>modus kannst du jederzeit wechseln.';
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
  part(en?'Punishment axis — receiving':'Strafe-Achse — empfangend', strafeOpts('#p'),
    en?'Separate from the desire scale, because a punishment that arouses is not a punishment. A hard limit rules out real punishment.'
      :'Getrennt von der Wunsch-Skala, weil eine Strafe, die erregt, keine Strafe ist. Hard Limit schließt „echte Strafe" aus.');
  part(en?'Punishment axis — doing':'Strafe-Achse — ausführend', strafeOpts('#a'),
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
function stepList(){
  /* Ein Schritt, der nichts zeigt, ist im gefuehrten Ablauf reine Irritation. */
  const steps=THEMES.filter(themeShown).map(t=>({t:t}));
  steps.push({prio:true});
  return steps;
}
function renderGuide(){
  const v=document.getElementById('vGuide'); v.innerHTML='';
  const steps=stepList();
  if(ST.step>=steps.length) ST.step=steps.length-1;
  if(ST.step<0) ST.step=0;
  const sw=switchBlock(); if(sw) v.appendChild(sw);

  const nav=el('div','card');
  nav.appendChild(el('h3',null,(ST.lang==='en'?'Step ':'Schritt ')+(ST.step+1)+
    (ST.lang==='en'?' of ':' von ')+steps.length));
  const ul=el('ul','steps');
  steps.forEach((s,i)=>{
    const li=el('li',i===ST.step?'cur':'');
    li.appendChild(el('span','sn',String(i+1)));
    const d=el('div','sd');
    if(s.prio){ d.appendChild(el('div',null,ST.lang==='en'
        ?'Priorities — what matters most?':'Prioritäten — was ist dir am wichtigsten?')); }
    else{
      d.appendChild(el('div',null,LB({de:s.t.title_de,en:s.t.title_en})));
      if(isEkat(s.t)){
        d.appendChild(el('div','ss',ST.nodeW['T:'+s.t.id]||ST.nodeW['T:'+s.t.id+'#a']
          ||ST.nodeW['T:'+s.t.id+'#p']?'1/1 '+L(T.setCount):'0/1 '+L(T.setCount)));
      }else{
        const c=countUnits(visOfTheme(s.t));
        d.appendChild(el('div','ss',c.set+'/'+c.tot+' '+L(T.setCount)+
          (c.clar>c.set?' · '+c.clar+' '+L(T.clarCount):'')));
      }
    }
    li.appendChild(d);
    li.onclick=()=>{ST.step=i; save(); rerender();};
    ul.appendChild(li);
  });
  nav.appendChild(ul); v.appendChild(nav);

  const cur=steps[ST.step];
  if(cur.prio) v.appendChild(prioBlock());
  else{
    const t=cur.t;
    const box=el('div');
    if(isEkat(t)){
      const n=el('div','node open');
      /* Ohne Kopf liest man „Wie sehr interessiert dich dieser Bereich?" und
         erfaehrt nirgends, welcher gemeint ist — die Schrittliste steht weit oben. */
      const h=el('div','nhead');
      const ti=el('div','ntitle');
      ti.appendChild(el('h4',null,t.order+'. '+LB({de:t.title_de,en:t.title_en})));
      h.appendChild(ti); n.appendChild(h);
      const b=el('div','nbody');
      const was=LB({de:t.ekat_de,en:t.ekat_en});
      if(was){const d=el('div','ekatwas'); d.textContent=was; b.appendChild(d);}
      b.appendChild(noteEl(L(T.ekatWhy)));
      const nc=nodeControls('T:'+t.id,allItems(t),null,L(T.ekatShort));
      if(nc) b.appendChild(nc);
      n.appendChild(b); box.appendChild(n); v.appendChild(box);
    }else{
      const zeig=ST.mode==='e'?t.sections.filter(s=>visItems(s).length):t.sections;
      zeig.forEach(s=>{
        const n=el('div','node'+(s.exempt?' exempt':'')+' open');
        const h=el('div','nhead');
        const ti=el('div','ntitle');
        ti.appendChild(el('h4',null,LB({de:s.title_de,en:s.title_en})));
        h.appendChild(ti); n.appendChild(h);
        n.appendChild(secBody(s));
        box.appendChild(n);
      });
      const weg=t.sections.length-zeig.length;
      if(weg>0) box.appendChild(el('div','secnote',
        weg+' '+L(weg===1?T.moreSec1:T.moreSecs)));
      v.appendChild(box);
    }
  }
  const gn=el('div','gnav');
  const b1=el('button','btn',ST.lang==='en'?'‹ Back':'‹ Zurück');
  b1.onclick=()=>{ST.step=Math.max(0,ST.step-1); save(); rerender();
    window.scrollTo(0,0);};
  const b2=el('button','btn pri',ST.lang==='en'?'Next ›':'Weiter ›');
  b2.onclick=()=>{ST.step=Math.min(steps.length-1,ST.step+1); save(); rerender();
    window.scrollTo(0,0);};
  gn.appendChild(b1); gn.appendChild(b2); v.appendChild(gn);
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
