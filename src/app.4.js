<script>
"use strict";
/* ==================== Export / Import ==================== */
function dl(name,text,mime){
  const b=new Blob([text],{type:mime+';charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(b); a.download=name;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},0);
}
function stamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes());}

/* Eine Bewertung, die nur auf dem Themenknoten liegt, kommt in keiner
   Item-Tabelle vor — sie wuerde im Export lautlos verschwinden. */
function ekatAnswers(t){
  if(!isEkat(t)) return [];
  const out=[];
  ['','#a','#p'].forEach(u=>{
    const v=ST.nodeW['T:'+t.id+u];
    if(v) out.push({role:u,v:v});
  });
  return out;
}

function snapshot(){
  /* aufgeloeste Antworten, maschinenlesbar */
  const out={};
  IDX.items.forEach(it=>{
    let o=null;
    if(it.kind==='wunsch'){
      const units={};
      it.units.forEach(u=>{
        const w=effW(it,u), p=effP(it,u);
        if(!w.v&&!p.v&&!ST.x[it.id+u]&&!ST.star[it.id+u]) return;
        units[u?u.slice(1):'-']={rating:w.v||null,rating_src:w.src||null,
          punishment:p.v||null,punishment_src:p.src||null,
          experience:ST.x[it.id+u]||null,star:!!ST.star[it.id+u],
          rank:ST.rank.indexOf(it.id+u)>=0?ST.rank.indexOf(it.id+u)+1:null};
      });
      const f=effF(it);
      if(Object.keys(units).length||f.v) o={roles:units,fantasy_only:!!f.v,
        fantasy_src:f.src||null,skipped:isSkipped(it)};
    } else if(it.kind==='text'){ if((ST.tx[it.id]||'').trim()) o={text:ST.tx[it.id]}; }
    else if(it.kind==='multi'){ if((ST.multi[it.sec]||[]).indexOf(it.id)>=0) o={selected:true}; }
    else {
      const roles={};
      it.units.forEach(u=>{const v=agOf(it,u); if(v) roles[u?u.slice(1):'-']={value:v};});
      if(Object.keys(roles).length) o={roles:roles,scale:it.kind};
    }
    if(o){
      const n=ST.notes[it.id];
      if(n&&n.t) o.note={text:n.t,shared:!!n.sh};
      o.level=it.level; o.section=it.sec; o.theme=it.theme;
      if(it.risk) o.risk=it.risk;
      out[it.id]=o;
    }
  });
  return out;
}
function bundle(){
  const vis=IDX.items.filter(lvOK);
  const c=countUnits(vis.filter(it=>!it.exempt)), cs=countUnits(vis.filter(it=>it.exempt));
  return {schema:'kinkcompass',schemaVersion:APP.schema,
    app:{name:APP.name,version:APP.version,scaleRevision:APP.scaleRev,listRevision:APP.listRev},
    exported:new Date().toISOString(),
    mode:ST.mode,lang:ST.lang,
    coverage:{mode:ST.mode,items_total:IDX.items.length,items_in_mode:vis.length,
      kink:{set:c.set,resolved:c.clar,total:c.tot},
      framework:{set:cs.set,resolved:cs.clar,total:cs.tot}},
    scales:{wunsch:SC.wunsch.map(s=>({value:s.v,label_de:s.de,label_en:s.en,desc_de:s.dde})),
      strafe:SC.strafe.map(s=>({value:s.v,label_de:s.de,label_en:s.en,desc_de:s.dde})),
      erfahrung:SC.erfahrung,vereinbarung:SC.vereinbarung,angabe:SC.angabe,
      choices:DATA.tree.choices},
    roles:{a:'ausfuehrend',p:'empfangend'},
    meta:ST.meta, priorities:ST.rank.slice(),
    orphans:ST.orphans&&Object.keys(ST.orphans).length?ST.orphans:undefined,
    answers:snapshot(), toys:ST.toys.filter(t=>t&&t.trim()),
    state:ST};
}
function exportJSON(){
  dl('kinkcompass_'+stamp()+'.json',JSON.stringify(bundle(),null,1),'application/json');
}
function exportMD(){
  const m=ST.meta,S=[];
  S.push('# KinkCompass — Neigungs- und Grenzenliste','');
  S.push('<!-- '+APP.name+' '+APP.version+' · Schema '+APP.schema+' · Skala '+APP.scaleRev+
    ' · Liste '+APP.listRev+' · exportiert '+new Date().toISOString()+' -->','');
  const head=[m.alias?'**'+m.alias+'**':'',m.date||'',m.self||'',m.version||''].filter(Boolean);
  if(head.length) S.push(head.join(' · '),'');
  if(m.note) S.push('> '+String(m.note).replace(/\n/g,'\n> '),'');
  const vis=IDX.items.filter(lvOK);
  const c=countUnits(vis.filter(it=>!it.exempt)), cs=countUnits(vis.filter(it=>it.exempt));
  S.push('Umfang: **'+LB(MODELBL[ST.mode])+'** — '+vis.length+' von '+IDX.items.length+
    ' Punkten abgefragt. Nicht abgefragte Punkte sind **offen, nicht abgelehnt**.','');
  S.push('Neigungen: '+c.set+' ausdrücklich bewertet, '+c.clar+' geklärt von '+c.tot+
    ' · Rahmen und Sicherheit: '+cs.set+' von '+cs.tot,'');
  S.push('Ein Treffer in einem Vergleich ist ein **Gesprächsanlass, keine Erlaubnis**.','');

  /* Prioritaeten zuerst */
  const units=starredUnits();
  if(units.length){
    S.push('## Prioritäten','');
    units.forEach((k,i)=>{
      const u=unitLabel(k); if(!u) return;
      const e=effW(u.it,u.role);
      S.push((i+1)+'. '+u.name+(u.roleName?' *('+u.roleName+')*':'')+
        ' — '+(e.v?scLbl('wunsch',e.v):'—')+' · '+u.sec);
    });
    S.push('');
  }
  /* Rahmen und Sicherheit */
  THEMES.forEach(t=>{
    const ek=ekatAnswers(t);
    if(ek.length){
      S.push('## '+t.order+'. '+LB({de:t.title_de,en:t.title_en}),'');
      S.push('*'+(ST.lang==='en'
        ?'Rated as a whole in getting-started mode — applies to every item in this area.'
        :'Im Einstieg als Ganzes bewertet — gilt für alle Punkte dieses Bereichs.')+'*','');
      ek.forEach(e=>S.push('- '+(e.role?LB(ROLE[e.role.slice(1)])+': ':'')+
        scLbl('wunsch',e.v)));
      S.push('');
      return;
    }
    const rows=[];
    t.sections.forEach(s=>{
      const items=visItems(s);
      if(s.type==='multi'){
        const sel=(ST.multi[s.id]||[]);
        if(!sel.length) return;
        rows.push({sec:s,multi:sel.map(id=>IDX.byId[id]).filter(Boolean)});
        return;
      }
      if(s.type==='toys') return;
      const rr=[];
      items.forEach(it=>{
        const n=ST.notes[it.id],note=(n&&n.t&&n.sh)?n.t.replace(/\n/g,' '):'';
        if(it.kind==='text'){ if((ST.tx[it.id]||'').trim())
            rr.push({it:it,text:ST.tx[it.id]}); return; }
        if(it.kind==='wunsch'){
          it.units.forEach(u=>{
            const e=effW(it,u); if(!e.v) return;
            rr.push({it:it,role:u,v:e.v,src:e.src,p:effP(it,u).v,f:effF(it).v,
              x:ST.x[it.id+u]||'',star:!!ST.star[it.id+u],
              rank:ST.rank.indexOf(it.id+u),note:note});
          });
        } else {
          it.units.forEach(u=>{const v=agOf(it,u);
            if(v) rr.push({it:it,role:u,ag:v,note:note});});
        }
      });
      if(rr.length) rows.push({sec:s,rows:rr});
    });
    if(!rows.length) return;
    S.push('## '+t.order+'. '+LB({de:t.title_de,en:t.title_en}),'');
    rows.forEach(b=>{
      S.push('### '+LB({de:b.sec.title_de,en:b.sec.title_en}),'');
      if(b.multi){ b.multi.forEach(it=>S.push('- '+LB({de:it.de,en:it.en}))); S.push(''); return; }
      const hasText=b.rows.some(r=>r.text!=null);
      const hasAg=b.rows.some(r=>r.ag);
      if(hasText){
        b.rows.forEach(r=>{ if(r.text!=null) S.push('**'+LB({de:r.it.de,en:r.it.en})+'**','',r.text,''); });
        return;
      }
      if(hasAg){
        S.push('| Punkt | Rolle | Angabe | Notiz |','|---|---|---|---|');
        b.rows.forEach(r=>S.push('| '+LB({de:r.it.de,en:r.it.en})+
          ' | '+(r.role?LB(roleOf(r.it,r.role)):'—')+' | '+
          scLbl(r.it.kind,r.ag)+' | '+(r.note||'')+' |'));
        S.push('');
        return;
      }
      S.push('| Punkt | Rolle | Bewertung | Quelle | Strafe | Erfahrung | Nur Fantasie | ★ | Rang | Notiz |',
             '|---|---|---|---|---|---|---|---|---|---|');
      b.rows.sort((x,y)=>{
        const rx=x.rank<0?9999:x.rank, ry=y.rank<0?9999:y.rank;
        if(rx!==ry) return rx-ry;
        const d=ORD.indexOf(x.v)-ORD.indexOf(y.v); if(d) return d;
        return x.it.de.localeCompare(y.it.de);});
      b.rows.forEach(r=>S.push('| '+LB({de:r.it.de,en:r.it.en})+
        ' | '+(r.role?LB(roleOf(r.it,r.role)):'—')+
        ' | '+scLbl('wunsch',r.v)+
        ' | '+(r.src==='inh'?'geerbt':'gesetzt')+
        ' | '+(r.p?scLbl('strafe',r.p):'—')+
        ' | '+(r.x?scLbl('erfahrung',r.x):'—')+
        ' | '+(r.f?'ja':'—')+
        ' | '+(r.star?'★':'—')+
        ' | '+(r.rank>=0?(r.rank+1):'—')+
        ' | '+(r.note||'')+' |'));
      S.push('');
    });
  });
  const toys=ST.toys.filter(x=>x&&x.trim());
  if(toys.length){S.push('## Toys und Ausrüstung','');toys.forEach(x=>S.push('- '+x));S.push('');}

  S.push('## Skala','');
  SC.wunsch.forEach(s=>S.push('- **'+s.de+'** — '+s.dde));
  S.push('');
  SC.strafe.forEach(s=>S.push('- **'+s.de+'** — '+s.dde));
  S.push('','Rollen: *ausführend* = die Handlung ausführen · *empfangend* = die Handlung erfahren. '+
    'Das sagt nichts über Macht — wer dient, führt aus und folgt zugleich.',
    '','*Geerbt* bedeutet: der Wert stammt aus einer Bewertung auf Themen-, Sektions- oder '+
    'Gruppenebene und ist keine ausdrückliche Einzelentscheidung.','');
  S.push('---','',
    'Die folgende Datenstruktur wird beim Import wieder eingelesen. Bitte nicht von Hand ändern.','',
    '```kinkcompass',
    JSON.stringify(bundle()).replace(/`/g,'\\u0060'),
    '```','');
  dl('kinkcompass_'+stamp()+'.md',S.join('\n'),'text/markdown');
}
function importFile(input){
  const f=input.files&&input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    let txt=String(r.result),obj=null;
    const m=txt.match(/```kinkcompass\s*\n?([\s\S]*?)```/);
    if(m){ try{obj=JSON.parse(m[1].trim());}catch(e){} }
    if(!obj){ try{obj=JSON.parse(txt);}catch(e){} }
    if(!obj){ alert(ST.lang==='en'
      ?'Could not read the file. Expected JSON, or Markdown with a ```kinkcompass block.'
      :'Datei nicht lesbar. Erwartet wird JSON oder Markdown mit einem ```kinkcompass-Block.'); return; }
    const st=obj.state||obj.raw||obj;
    if(!st||typeof st!=='object'){alert('Kein Zustand gefunden.');return;}
    ST=Object.assign(BLANK(),st);
    if(obj.meta&&!st.meta) ST.meta=obj.meta;
    const rep=migrateState(ST);
    ST.loadedFrom={listRev:(obj.app&&obj.app.listRevision)||null,
      schema:obj.schemaVersion||null, items:(obj.coverage&&obj.coverage.items_total)||null};
    save(); bindMeta(); versionNote(rep); rerender();
    const msg=migSummary(rep);
    alert((ST.lang==='en'?'Loaded.':'Geladen.')+(msg?'\n\n'+msg:''));
  };
  r.readAsText(f); input.value='';
}

/* ==================== Druckansicht ==================== */
function togglePrint(on){
  document.body.classList.toggle('printmode',!!on);
  if(on) renderPrint();
}
function renderPrint(){
  const only=document.getElementById('pOnlyRated').checked;
  const wExp=document.getElementById('pExpl').checked;
  const m=ST.meta,H=[];
  H.push('<h1>KinkCompass</h1>');
  const head=[m.alias?'<b>'+esc(m.alias)+'</b>':'',esc(m.date||''),esc(m.self||''),
    esc(m.version||'')].filter(Boolean);
  if(head.length)H.push('<div class="pnote">'+head.join(' &middot; ')+'</div>');
  const vis=IDX.items.filter(lvOK);
  H.push('<div class="pnote">Umfang '+esc(LB(MODELBL[ST.mode]))+' — '+vis.length+' von '+
    IDX.items.length+' Punkten abgefragt; nicht abgefragte Punkte sind offen, nicht abgelehnt.</div>');
  if(m.note)H.push('<p><i>'+esc(m.note)+'</i></p>');
  const units=starredUnits();
  if(units.length){
    H.push('<h2>Prioritäten</h2><table>');
    units.forEach((k,i)=>{const u=unitLabel(k); if(!u)return;
      const e=effW(u.it,u.role);
      H.push('<tr><td style="width:28px">'+(i+1)+'</td><td>'+esc(u.name)+
        (u.roleName?' <i>('+esc(u.roleName)+')</i>':'')+'</td><td>'+
        esc(e.v?scLbl('wunsch',e.v):'—')+'</td></tr>');});
    H.push('</table>');
  }
  THEMES.forEach(t=>{
    const ek=ekatAnswers(t);
    if(ek.length){
      H.push('<h2>'+t.order+'. '+esc(LB({de:t.title_de,en:t.title_en}))+'</h2>');
      H.push('<div class="pnote">'+(ST.lang==='en'
        ?'Rated as a whole in getting-started mode — applies to every item in this area.'
        :'Im Einstieg als Ganzes bewertet — gilt für alle Punkte dieses Bereichs.')+'</div>');
      H.push('<ul>'+ek.map(e=>'<li>'+(e.role?esc(LB(ROLE[e.role.slice(1)]))+': ':'')+
        esc(scLbl('wunsch',e.v))+'</li>').join('')+'</ul>');
      return;
    }
    const parts=[];
    t.sections.forEach(s=>{
      const items=visItems(s);
      if(s.type==='multi'){
        const sel=(ST.multi[s.id]||[]).map(id=>IDX.byId[id]).filter(Boolean);
        if(sel.length) parts.push('<h3>'+esc(LB({de:s.title_de,en:s.title_en}))+'</h3><ul>'+
          sel.map(it=>'<li>'+esc(LB({de:it.de,en:it.en}))+'</li>').join('')+'</ul>');
        return;
      }
      if(s.type==='toys') return;
      const rows=[];
      items.forEach(it=>{
        const n=ST.notes[it.id],note=(n&&n.t)?n.t:'';
        if(it.kind==='text'){ if((ST.tx[it.id]||'').trim())
          rows.push('<tr><td><b>'+esc(LB({de:it.de,en:it.en}))+'</b></td><td colspan="4">'+
            esc(ST.tx[it.id])+'</td></tr>'); return; }
        if(it.kind==='wunsch'){
          it.units.forEach(u=>{
            const e=effW(it,u);
            if(only&&!e.v) return;
            const p=effP(it,u).v;
            rows.push('<tr><td>'+(ST.star[it.id+u]?'★ ':'')+esc(LB({de:it.de,en:it.en}))+
              (wExp&&it.expl_de?'<div class="pnote">'+esc(it.expl_de)+'</div>':'')+
              '</td><td>'+(u?esc(LB(roleOf(it,u))):'—')+
              '</td><td>'+esc(e.v?scLbl('wunsch',e.v):'—')+
              (e.src==='inh'?' <i>(geerbt)</i>':'')+
              '</td><td>'+(p?esc(scLbl('strafe',p)):'—')+
              '</td><td>'+(note?'<span class="pnote">'+esc(note)+'</span>':'')+'</td></tr>');
          });
        } else {
          it.units.forEach(u=>{
            const v=agOf(it,u);
            if(only&&!v) return;
            rows.push('<tr><td>'+esc(LB({de:it.de,en:it.en}))+'</td><td>'+
              (u?esc(LB(roleOf(it,u))):'—')+'</td><td>'+
              esc(v?scLbl(it.kind,v):'—')+'</td><td>—</td><td>'+
              (note?'<span class="pnote">'+esc(note)+'</span>':'')+'</td></tr>');
          });
        }
      });
      if(rows.length) parts.push('<h3>'+esc(LB({de:s.title_de,en:s.title_en}))+
        '</h3><table><tr><th>Punkt</th><th>Rolle</th><th>Bewertung</th><th>Strafe</th><th>Notiz</th></tr>'+
        rows.join('')+'</table>');
    });
    if(parts.length) H.push('<h2>'+t.order+'. '+esc(LB({de:t.title_de,en:t.title_en}))+'</h2>'+parts.join(''));
  });
  document.getElementById('printview').innerHTML=H.join('');
}

/* ==================== Steuerung ==================== */
function setView(v){ document.body.dataset.view=v; rerender(); window.scrollTo(0,0); }
function setMode(m){ ST.mode=m; save(); rerender(); }
function setLang(l){ ST.lang=l; document.documentElement.lang=l; save(); bindLabels(); rerender(); }
function toggleAllExpl(){ document.body.classList.toggle('allexpl');
  document.getElementById('bExpl').classList.toggle('on',document.body.classList.contains('allexpl')); }
function resetAll(){
  if(!confirm(ST.lang==='en'?'Delete all entries in this browser?'
    :'Alle Eingaben in diesem Browser löschen?')) return;
  const lang=ST.lang; ST=BLANK(); ST.lang=lang;
  try{localStorage.removeItem(KEY);}catch(e){}
  bindMeta(); rerender();
}
function bindMeta(){
  document.querySelectorAll('[data-meta]').forEach(inp=>{
    inp.value=ST.meta[inp.dataset.meta]||'';
    inp.oninput=()=>{ST.meta[inp.dataset.meta]=inp.value; save();};
  });
}
function bindLabels(){
  const en=ST.lang==='en';
  document.getElementById('intro').innerHTML=L(T.intro);
  document.getElementById('lblMeta').textContent=en?'About you':'Angaben zur Person';
  document.getElementById('lblAlias').textContent=en?'Alias or name':'Pseudonym oder Name';
  document.getElementById('lblDate').textContent=en?'Date':'Datum';
  document.getElementById('lblSelf').textContent=en?'Role / self-description':'Rolle / Selbstbeschreibung';
  document.getElementById('lblVer').textContent=en?'Version / context':'Version / Kontext';
  document.getElementById('lblFree').textContent=en?'Free note':'Freie Notiz';
  document.getElementById('lblProgKink').textContent=en?'Preferences':'Neigungen';
  document.getElementById('lblProgSafe').textContent=en?'Framework and safety':'Rahmen und Sicherheit';
  document.getElementById('subline').textContent=en
    ?'runs entirely offline · stored only in this browser':'läuft vollständig lokal · Speicherung nur in diesem Browser';
  document.getElementById('bGuide').textContent=en?'Guided':'Geführt';
  document.getElementById('bCmp').textContent=en?'Compare':'Vergleich';
  const set=(id,de,en2)=>{const n=document.getElementById(id); if(n)n.textContent=en?en2:de;};
  set('bList','Liste','List'); set('bPrio','Prioritäten','Priorities');
  set('bEval','Auswertung','Overview'); set('bPrint','Druck','Print');
  set('bExpl','Erklärungen','Explanations'); set('bLoad','Laden','Load');
  set('bReset','Zurücksetzen','Reset'); set('bLegend','Skala','Scales');
  set('pL1','nur bewertete Punkte','rated items only');
  set('pL2','Erklärungen mitdrucken','include explanations');
  set('pB1','Drucken','Print'); set('pB2','Zurück','Back');
  document.getElementById('q').placeholder=en?'Search …':'Suchen …';
  const sel=document.getElementById('mode'); sel.innerHTML='';
  ['e','s','v'].forEach(k=>{
    const n=IDX.items.filter(it=>MODES[k].indexOf(it.level)>=0).length;
    const o=el('option',null,LB(MODELBL[k])+' ('+n+')'); o.value=k; sel.appendChild(o);
  });
  sel.value=ST.mode;
  document.getElementById('lang').value=ST.lang;
  const rb=document.getElementById('refs');
  if(rb) rb.innerHTML='<h3>'+(en?'Sources':'Quellen')+'</h3>'+
    '<div class="hint">'+(en
      ?'Referenced by the section notes. Legal citations are German law and are not legal advice.'
      :'Bezugspunkte der Sektionshinweise. Die Rechtsnormen sind deutsches Recht und keine Rechtsberatung.')+
    '</div><ol style="font-size:12.5px;color:var(--muted);padding-left:22px">'+
    DATA.refs.map(r=>'<li id="ref-'+r.n+'"><a href="'+esc(r.url)+
      '" target="_blank" rel="noreferrer noopener">'+esc(r.title)+'</a></li>').join('')+'</ol>';
  document.getElementById('foot').innerHTML=(en
    ?'No data leaves this device. Draft is kept in local browser storage; export writes a file.'
    :'Keine Daten verlassen dieses Gerät. Zwischenstand liegt im lokalen Browserspeicher, '+
     'Export erfolgt als Datei-Download.')+
    ' · '+APP.name+' '+APP.version+' · Schema '+APP.schema+' · '+IDX.items.length+' Punkte';
}
let rerenderT=null;
function rerender(){
  clearTimeout(rerenderT);
  rerenderT=setTimeout(()=>{
    const y=window.scrollY;
    const v=document.body.dataset.view;
    if(v==='form') renderForm();
    else if(v==='guide') renderGuide();
    else if(v==='prio') renderPrio();
    else if(v==='eval') renderEval();
    else if(v==='cmp') renderCmp();
    updateProgress();
    window.scrollTo(0,y);
  },0);
}
/* ---------- Start ---------- */
(function init(){
  document.documentElement.lang=ST.lang;
  bindLabels(); bindMeta(); storageWarn();
  migrateState(ST); versionNote(null);
  if(!ST.meta.date) { const d=new Date(),p=n=>String(n).padStart(2,'0');
    ST.meta.date=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); bindMeta(); }
  if(ST.mode==='e'&&!Object.keys(ST.w).length&&!Object.keys(ST.ag).length)
    document.body.dataset.view='guide';
  rerender();
})();
</script>
</body>
</html>
