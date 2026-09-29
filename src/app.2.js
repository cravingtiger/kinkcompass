<script>
"use strict";
/* ==================== Rendering ==================== */
const el=(tag,cls,txt)=>{const n=document.createElement(tag);
  if(cls)n.className=cls; if(txt!=null)n.textContent=txt; return n;};
const esc=(s)=>String(s==null?'':s).replace(/[&<>"]/g,c=>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* Sektionshinweise der Quelle enthalten **fett** und Fussnoten [^n] */
function mdInline(t){
  return esc(t)
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')
    .replace(/(?:\[\^(\d+)\])+/g,(m)=>m.match(/\d+/g).map(n=>
      '<sup><a href="#ref-'+n+'" title="Quelle '+n+'">'+n+'</a></sup>').join(''));
}
function noteEl(txt){const d=el('div','secnote'); d.innerHTML=mdInline(txt); return d;}

function wunschOpts(){return ST.mode==='e'
  ? SC.wunsch.filter(o=>WUNSCH_E.indexOf(o.v)>=0) : SC.wunsch;}
const nodeIsAp=(items)=>items.length>0&&items.every(it=>it.ap&&it.kind==='wunsch');
const hasWunsch=(items)=>items.some(it=>it.kind==='wunsch');

/* ---------- Chip-Reihe ---------- */
function chipRow(opts,cur,onPick,roleLbl,inherited,blocked){
  const wrap=el('div','axrow');
  if(roleLbl!=null){const r=el('span','rlbl',roleLbl);wrap.appendChild(r);}
  opts.forEach(o=>{
    const c=el('button','chip',LB(o));
    c.type='button'; c.dataset.v=o.v;
    c.title=(o.dde||o.den)?LB({de:o.dde,en:o.den}):'';
    if(blocked&&blocked.indexOf(o.v)>=0){c.classList.add('blocked');
      c.title=L(T.hardBlocks); c.onclick=()=>{};}
    else c.onclick=()=>onPick(cur===o.v&&!inherited?null:o.v);
    if(cur===o.v){c.classList.add('sel'); if(inherited)c.classList.add('inh');}
    wrap.appendChild(c);
  });
  return wrap;
}
function styleSel(wrap,kind){
  wrap.querySelectorAll('.chip.sel').forEach(c=>{
    const v=c.dataset.v, m={must:'must',neigung:'neigung',sehnsucht:'sehnsucht',
      interessant:'interessant',neutral:'neutral',soft:'soft',hard:'hard',na:'na',
      reizvoll:'reizvoll',echt:'echt',verbindlich:'verbindlich',gewuenscht:'gewuenscht',
      verhandelbar:'verhandelbar','nicht-noetig':'nicht-noetig',ablehnend:'ablehnend',
      keine:'keine',einmal:'einmal',gelegentlich:'gelegentlich',viel:'viel'}[v];
    c.style.background=m?'var(--c-'+m+')':'var(--accent)';
    if(v==='must')c.style.color='#1a1a1a';
  });
}

/* ---------- Knotensteuerung (Vererbung) ---------- */
/* `items` sind die im Modus sichtbaren Punkte — sie entscheiden, ob die Zeile
   ueberhaupt erscheint. `reach` ist, was die Bewertung tatsaechlich erreicht:
   die Vererbung kennt keinen Modus und wirkt auch auf Punkte, die gerade
   ausgeblendet sind. Beides auseinanderzuhalten ist noetig, weil die Zahl in
   der Beschriftung sonst luegt — in „Hochrisiko" stand (17), gewirkt haette
   die Bewertung auf 44. */
function nodeControls(nk,items,noInherit,capText,reach){
  const box=el('div','ghead nodectl');
  if(!hasWunsch(items)) { return null; }
  if(noInherit){
    /* Wo die Punkte Alternativen sind, waere eine Bewertung fuer alle sinnlos.
       Das Ueberspringen bleibt trotzdem nuetzlich. */
    const cap=el('div','nodecap',L(T.noInherit));
    cap.title=noInherit; box.appendChild(cap);
    const sk=el('button','btn sm'+(ST.skip[nk]?' on':''),L(T.skip));
    sk.type='button';
    sk.onclick=(e)=>{e.stopPropagation();
      if(ST.skip[nk])delete ST.skip[nk]; else ST.skip[nk]=1; save(); rerender();};
    box.appendChild(sk);
    return box;
  }
  /* Ohne Beschriftung sieht diese Zeile aus wie ein Item ohne Namen. */
  const what=nk.indexOf('T:')===0?L(T.allTheme)
           :nk.indexOf('S:')===0?L(T.allSec):L(T.allGrp);
  const alle=reach||items;
  /* Auf Themenebene bleiben Risiko-Items und NUR-EINZELN-Sektionen aussen vor. */
  const gesperrt=nk.charAt(0)==='T'?alle.filter(it=>it.risk||it.nosweep):[];
  const trifft=alle.length-gesperrt.length;
  const cap=el('div','nodecap',capText||(what+' ('+trifft+')'));
  cap.title=capText?L(T.ekatWhy):L(T.inheritWhy);
  box.appendChild(cap);
  if(gesperrt.length){
    box.appendChild(el('div','nodewarn',L(T.katAus).replace('#',String(gesperrt.length))));
  }
  const ap=nodeIsAp(items);
  const mk=(role)=>{
    const cur=ST.nodeW[nk+role]||'';
    const row=chipRow(wunschOpts(),cur,(v)=>{
      if(v)ST.nodeW[nk+role]=v; else delete ST.nodeW[nk+role];
      save(); rerender();
    },ap?LB(ROLE[role.slice(1)||'a']):null,false,null);
    styleSel(row,'wunsch');
    return row;
  };
  const col=el('div','axes');
  if(ap){col.appendChild(mk('#a'));col.appendChild(mk('#p'));}
  else col.appendChild(mk(''));
  box.appendChild(col);
  const sk=el('button','btn sm'+(ST.skip[nk]?' on':''),L(T.skip));
  sk.type='button';
  sk.onclick=(e)=>{e.stopPropagation();
    if(ST.skip[nk])delete ST.skip[nk]; else ST.skip[nk]=1; save(); rerender();};
  box.appendChild(sk);
  return box;
}

/* ---------- Item ---------- */
function itemRow(it){
  const row=el('div','row'); row.dataset.id=it.id;
  const main=el('div','rowmain');
  const lbl=el('div','lbl');
  const expl=LB({de:it.expl_de,en:it.expl_en});
  if(expl){const i=el('div','i','i'); i.title=expl;
    i.onclick=()=>row.classList.toggle('showexpl'); lbl.appendChild(i);}
  const name=el('span',null,LB({de:it.de,en:it.en}));
  lbl.appendChild(name);
  if(it.risk){const b=el('span','badge '+it.risk,LB(it.risk==='hoch'
    ?{de:'Risiko hoch',en:'high risk'}:{de:'Risiko mittel',en:'moderate risk'}));
    b.style.marginLeft='6px'; lbl.appendChild(b);}
  if(isSkipped(it)){const b=el('span','badge skip',L(T.skip));
    b.style.marginLeft='6px'; lbl.appendChild(b);}
  main.appendChild(lbl);
  const axes=el('div','axes');

  if(it.kind==='wunsch'){
    it.units.forEach(u=>{
      const e=effW(it,u), ew=e.v;
      const r=chipRow(wunschOpts(),ew,(v)=>{
        if(v)ST.w[it.id+u]=v; else delete ST.w[it.id+u];
        if(v==='hard'&&ST.p[it.id+u]==='echt') delete ST.p[it.id+u];
        save(); rerender();
      },it.ap?LB(roleOf(it,u)):null,e.src==='inh',null);
      styleSel(r,'wunsch'); axes.appendChild(r);
      if(showAx('showP',it)){
        const ep=effP(it,u);
        const pr=chipRow(strafeOpts(u),ep.v,(v)=>{
          if(v)ST.p[it.id+u]=v; else delete ST.p[it.id+u];
          save(); rerender();
        },L(u==='#a'?T.strafeGeben:u==='#p'?T.strafeNehmen:T.strafeAx),
          ep.src==='inh',ew==='hard'?['echt']:null);
        styleSel(pr,'strafe'); axes.appendChild(pr);
      }
      if(showAx('showX',it)&&!ST.noExp){
        const xr=chipRow(SC.erfahrung,ST.x[it.id+u]||'',(v)=>{
          if(v)ST.x[it.id+u]=v; else delete ST.x[it.id+u]; save(); rerender();
        },L(T.expAx),false,null);
        styleSel(xr,'erfahrung'); axes.appendChild(xr);
      }
    });
    const tail=el('div','axrow');
    const ef=effF(it);
    const fb=el('button','chip'+(ef.v?' sel':'')+(ef.src==='inh'?' inh':''),L(T.fantasy));
    fb.type='button';
    fb.onclick=()=>{if(ST.f[it.id])delete ST.f[it.id]; else ST.f[it.id]=1; save(); rerender();};
    if(ef.v)fb.style.background='var(--c-sehnsucht)';
    tail.appendChild(fb);
    if(showAx('showSt',it)){
      it.units.forEach(u=>{
        const on=!!ST.star[it.id+u];
        const sb=el('button','chip star'+(on?' sel':''),
          '★'+(it.ap?' '+LB(roleOf(it,u)):''));
        sb.type='button'; sb.title=L(T.star);
        sb.onclick=()=>{if(on)delete ST.star[it.id+u];
          else{ST.star[it.id+u]=1; if(ST.rank.indexOf(it.id+u)<0)ST.rank.push(it.id+u);}
          save(); rerender();};
        tail.appendChild(sb);
      });
    }
    const nb=el('button','chip'+(ST.notes[it.id]&&ST.notes[it.id].t?' sel':''),L(T.note));
    nb.type='button'; nb.onclick=()=>row.classList.toggle('showcmt');
    tail.appendChild(nb);
    if(!(ST.showP&&ST.showX&&ST.showSt)){
      const mb=el('button','chip'+(ST.more[it.id]?' sel':''),ST.more[it.id]?'−':'＋');
      mb.type='button'; mb.title=L(T.moreAx);
      mb.onclick=()=>{if(ST.more[it.id])delete ST.more[it.id]; else ST.more[it.id]=1;
        save(); rerender();};
      tail.appendChild(mb);
    }
    axes.appendChild(tail);
  }
  else if(it.kind==='text'){
    const ta=el('textarea'); ta.value=ST.tx[it.id]||'';
    ta.oninput=()=>{ST.tx[it.id]=ta.value; save(); updateProgress();};
    const box=el('div','tfield'); box.style.flex='1'; box.style.minWidth='260px';
    box.appendChild(ta); main.appendChild(box);
  }
  else {
    const opts=optsOf(it.kind);
    it.units.forEach(u=>{
      const r=chipRow(opts,agOf(it,u),(v)=>{ agSet(it,u,v); save(); rerender(); },
        u?LB(roleOf(it,u)):null,false,null);
      styleSel(r,it.kind); axes.appendChild(r);
    });
    const tail=el('div','axrow');
    const nb=el('button','chip'+(ST.notes[it.id]&&ST.notes[it.id].t?' sel':''),L(T.note));
    nb.type='button'; nb.onclick=()=>row.classList.toggle('showcmt');
    tail.appendChild(nb); axes.appendChild(tail);
  }

  if(it.kind!=='text') main.appendChild(axes);
  row.appendChild(main);
  /* Nur eigene Antwortsätze erklären wir am Item. Die Standard-Skalen stehen
     in der Legende — sonst stünde dieselbe Liste unter jeder Zeile. */
  const opts2=(it.scale&&it.kind!=='text')?optsOf(it.kind):null;
  if(expl||(opts2&&hasDesc(opts2))){
    const e=el('div','expl');
    if(expl) e.appendChild(el('div',null,expl));
    if(opts2&&hasDesc(opts2)){
      const ul=el('ul'); ul.style.cssText='margin:5px 0 0;padding-left:16px';
      opts2.forEach(o=>{
        const d=LB({de:o.dde,en:o.den}); if(!d) return;
        const li=el('li'); li.style.margin='2px 0';
        const b=el('b',null,LB(o)); b.style.color='var(--txt)';
        li.appendChild(b); li.appendChild(el('span',null,' — '+d));
        ul.appendChild(li);
      });
      e.appendChild(ul);
    }
    row.appendChild(e);
  }
  if(it.kind!=='text'){
    const c=el('div','cmt');
    const ta=el('textarea'); ta.value=(ST.notes[it.id]||{}).t||'';
    ta.placeholder=L(T.note);
    ta.oninput=()=>{ST.notes[it.id]=ST.notes[it.id]||{};
      ST.notes[it.id].t=ta.value; save();};
    c.appendChild(ta);
    const bar=el('div','cmtbar');
    const cb=el('input'); cb.type='checkbox';
    cb.checked=!!(ST.notes[it.id]||{}).sh;
    cb.onchange=()=>{ST.notes[it.id]=ST.notes[it.id]||{};
      ST.notes[it.id].sh=cb.checked; save();};
    const lb=el('label'); lb.style.display='flex'; lb.style.gap='5px';
    lb.appendChild(cb); lb.appendChild(el('span',null,L(T.shared)));
    bar.appendChild(lb); c.appendChild(bar);
    row.appendChild(c);
  }
  return row;
}
/* Strafe und Erfahrung sind global aus und werden bewusst eingeblendet —
   entweder oben fuer alle, oder per ＋ nur fuer dieses eine Item. */
/* Im Einstieg bleiben Strafe und Erfahrung aus. Wer das Thema zum ersten Mal
   anschaut, soll eine Frage pro Zeile beantworten, nicht drei. Das ＋ am Item
   bleibt trotzdem erreichbar, falls jemand genauer hinsehen will. */
const showAx=(k,it)=>{
  if(ST.mode==='e'&&(k==='showP'||k==='showX')) return !!(it&&ST.more[it.id]);
  return !!ST[k]||!!(it&&ST.more[it.id]);
};

/* ---------- Multi / Toys ---------- */
function multiBlock(s,items){
  const g=el('div','multi');
  const sel=ST.multi[s.id]||(ST.multi[s.id]=[]);
  items.forEach(it=>{
    const w=el('label','mi');
    const cb=el('input'); cb.type='checkbox'; cb.checked=sel.indexOf(it.id)>=0;
    cb.onchange=()=>{const i=sel.indexOf(it.id);
      if(cb.checked){if(i<0)sel.push(it.id);} else if(i>=0)sel.splice(i,1);
      save();};
    w.appendChild(cb);
    const t=el('div','t',LB({de:it.de,en:it.en}));
    const ex=LB({de:it.expl_de,en:it.expl_en});
    if(ex){const e=el('div','expl',ex); e.style.display='block'; e.style.paddingLeft='0';
      e.style.marginTop='2px'; t.appendChild(e);}
    w.appendChild(t); g.appendChild(w);
  });
  return g;
}
function toysBlock(){
  const box=el('div','toys');
  const draw=()=>{
    box.innerHTML='';
    ST.toys.forEach((v,i)=>{
      const r=el('div','toy');
      const inp=el('input'); inp.type='text'; inp.value=v;
      inp.oninput=()=>{ST.toys[i]=inp.value; save();};
      const d=el('button','btn sm','×'); d.type='button';
      d.onclick=()=>{ST.toys.splice(i,1); save(); draw();};
      r.appendChild(inp); r.appendChild(d); box.appendChild(r);
    });
    const add=el('button','btn sm','+');
    add.type='button'; add.onclick=()=>{ST.toys.push(''); save(); draw();};
    box.appendChild(add);
  };
  draw(); return box;
}

/* ---------- Sektion ---------- */
function secBody(s){
  const body=el('div','nbody');
  const note=LB({de:s.note_de,en:s.note_en});
  if(note) body.appendChild(noteEl(note));
  const items=visItems(s);
  /* Die Toys-Liste hat bauartbedingt keine Items — sie ist eine freie Liste.
     Stand diese Abfrage hinter der Leerpruefung, brach sie dort ab und zeigte
     nur einen Strich: kein Eingabefeld, kein Plus, obwohl der Hinweis daneben
     „Mit Plus hinzufuegen" sagte. */
  if(s.type==='toys'){ body.appendChild(toysBlock()); return body; }
  if(!items.length){
    const m=el('div','secnote',ST.mode==='e'?L(T.notAsked):'—');
    m.style.borderLeftColor='var(--gold)'; body.appendChild(m); return body;
  }
  if(s.type==='multi'){ body.appendChild(multiBlock(s,items)); return body; }
  /* Im Einstieg bleibt die Vererbung auf der Themenebene. Sonst staenden ueber
     neun Fragen sieben Bedienzeilen — das ist keine Vereinfachung mehr. */
  const nc=ST.mode==='e'?null:nodeControls('S:'+s.id,items,s.noinherit,null,s.items);
  if(nc&&!s.exempt){nc.style.marginBottom='8px'; body.appendChild(nc);}
  s.groups.forEach(g=>{
    const gi=items.filter(it=>it.group===g.id);
    if(!gi.length) return;
    const blk=el('div','grp');
    const gh=el('div','ghead');
    gh.appendChild(el('h5',null,LB({de:g.title_de,en:g.title_en})+' ('+gi.length+')'));
    blk.appendChild(gh);
    if(!s.exempt&&ST.mode!=='e'){
      const nc2=nodeControls('G:'+s.id+'.'+g.id,gi,s.noinherit,null,
        s.items.filter(it=>it.group===g.id));
      if(nc2) blk.appendChild(nc2);
    }
    if(!nodeSkipped('G:'+s.id+'.'+g.id)||s.exempt)
      gi.forEach(it=>blk.appendChild(itemRow(it)));
    body.appendChild(blk);
  });
  const ung=items.filter(it=>!it.group);
  ung.forEach(it=>body.appendChild(itemRow(it)));
  s.dropped.forEach(d=>{
    const m=el('div','secnote',(ST.lang==='en'?'Omitted: ':'Ausgelassen: ')+d.de+' — '+d.reason);
    body.appendChild(m);
  });
  return body;
}
function secNode(s){
  const n=el('div','node'+(s.exempt?' exempt':'')); n.dataset.sec=s.id;
  const h=el('div','nhead');
  h.appendChild(el('div','tw','▶'));
  const t=el('div','ntitle');
  t.appendChild(el('h4',null,LB({de:s.title_de,en:s.title_en})));
  const vi=visItems(s);
  const cnt=countUnits(vi);
  const risk=vi.filter(it=>it.risk).length;
  const riskWord=ST.lang==='en'?'risk':'Risiko';
  t.appendChild(el('div','nmeta',vi.length+' '+(ST.lang==='en'?'items':'Items')+' · '+cnt.set+'/'+cnt.tot+
    (risk?' · '+risk+' '+riskWord:'')+(ST.skip['S:'+s.id]?' · '+L(T.skip):'')));
  h.appendChild(t);
  n.appendChild(h);
  const open=!!ST.open['S:'+s.id];
  if(open){n.classList.add('open'); n.appendChild(secBody(s));}
  h.onclick=()=>{ST.open['S:'+s.id]=!ST.open['S:'+s.id]; save(); rerender();};
  return n;
}
function themeNode(t){
  const n=el('div','node theme'+(t.exempt?' exempt':'')); n.dataset.theme=t.id;
  const h=el('div','nhead');
  h.appendChild(el('div','tw','▶'));
  const ti=el('div','ntitle');
  ti.appendChild(el('h3',null,t.order+'. '+LB({de:t.title_de,en:t.title_en})));
  const vi=visOfTheme(t);
  const ekat=isEkat(t);
  const cnt=countUnits(vi);
  ti.appendChild(el('div','nmeta',ekat
    ?L(T.ekatCap)
    /* „0 Sektionen · 0 Items · 0/0" ist eine tote Zeile mit sinnlosem Zaehler. */
    :(ST.mode==='e'&&!vi.length)?L(T.notAskedShort)
    :(ST.mode==='e'?t.sections.filter(x=>visItems(x).length).length:t.sections.length)+
     ' '+(ST.lang==='en'?'sections':'Sektionen')+' · '+vi.length+
     ' '+(ST.lang==='en'?'items':'Items')+' · '+cnt.set+'/'+cnt.tot+
     (ST.skip['T:'+t.id]?' · '+L(T.skip):'')));
  h.appendChild(ti);
  n.appendChild(h);
  if(ST.open['T:'+t.id]){
    n.classList.add('open');
    const body=el('div','nbody');
    if(ekat){
      const was=LB({de:t.ekat_de,en:t.ekat_en});
      if(was){const d=el('div','ekatwas'); d.textContent=was; body.appendChild(d);}
      body.appendChild(noteEl(L(T.ekatWhy)));
      const nc=nodeControls('T:'+t.id,allItems(t),null,L(T.ekatShort));
      if(nc) body.appendChild(nc);
      n.appendChild(body);
    }else if(ST.mode==='e'&&!vi.length){
      const m=el('div','secnote',L(T.notAskedTheme));
      m.style.borderLeftColor='var(--gold)'; body.appendChild(m);
      n.appendChild(body);
    }else{
      if(!t.exempt){
        const alleOhne=t.sections.every(x=>x.noinherit||x.type!=='scale');
        const nc=nodeControls('T:'+t.id,vi,
          alleOhne?t.sections.map(x=>x.noinherit).filter(Boolean)[0]:null,
          null,allItems(t));
        if(nc){nc.style.marginBottom='8px'; body.appendChild(nc);}
      }
      /* Eine Ueberschrift ohne Inhalt ist im Einstieg genau das, was ueberfrachtet.
         Verschwiegen wird trotzdem nichts — die Zahl steht darunter. */
      const zeig=ST.mode==='e'?t.sections.filter(s=>visItems(s).length):t.sections;
      zeig.forEach(s=>body.appendChild(secNode(s)));
      const weg=t.sections.length-zeig.length;
      if(weg>0) body.appendChild(el('div','secnote',
        weg+' '+L(weg===1?T.moreSec1:T.moreSecs)));
      n.appendChild(body);
    }
  }
  h.onclick=()=>{ST.open['T:'+t.id]=!ST.open['T:'+t.id]; save(); rerender();};
  return n;
}
function renderForm(){
  const v=document.getElementById('vForm'); v.innerHTML='';
  const sw=switchBlock(); if(sw) v.appendChild(sw);
  THEMES.forEach(t=>v.appendChild(themeNode(t)));
}
</script>
