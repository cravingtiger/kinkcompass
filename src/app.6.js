<script>
"use strict";
/* ==================== Vergleich: Laden, Anzeige, Export ==================== */
function parseProfile(txt){
  let obj=null;
  const m=String(txt).match(/```kinkcompass\s*\n?([\s\S]*?)```/);
  if(m){ try{obj=JSON.parse(m[1].trim());}catch(e){} }
  if(!obj){ try{obj=JSON.parse(txt);}catch(e){} }
  if(!obj) return null;
  if(!obj.answers&&obj.state){ obj.answers={}; }
  return obj.answers?obj:null;
}
function loadProfile(slot,input){
  const f=input.files&&input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    const p=parseProfile(r.result);
    if(!p){ alert(ST.lang==='en'
      ?'Not a KinkCompass profile. Export as JSON or Markdown from this tool.'
      :'Keine KinkCompass-Datei. Exportiere aus diesem Werkzeug als JSON oder Markdown.'); return; }
    CMP[slot]=p; renderCmp();
  };
  r.readAsText(f); input.value='';
}
function useOwn(slot){ CMP[slot]=JSON.parse(JSON.stringify(bundle())); renderCmp(); }

const TONE={no:'var(--c-hard)',warn:'var(--c-soft)',ok:'var(--c-neigung)',info:'var(--line)'};
const MARK={no:'⛔',warn:'⚠️',ok:'✅',info:'·'};

function renderCmp(){
  const v=document.getElementById('vCmp'); v.innerHTML='';
  const en=ST.lang==='en';
  const c=el('div','card');
  c.appendChild(el('h3',null,en?'Compare two profiles':'Zwei Profile vergleichen'));
  c.appendChild(el('div','hint',en
    ?'Both files stay in this browser. Nothing is uploaded. The loaded profiles are held in memory only and are gone when you close the tab — your own questionnaire is untouched.'
    :'Beide Dateien bleiben in diesem Browser. Nichts wird hochgeladen. Die geladenen Profile liegen nur im Arbeitsspeicher und sind beim Schließen des Tabs weg — dein eigener Bogen bleibt unberührt.'));
  ['a','b'].forEach(sl=>{
    const row=el('div','axrow'); row.style.margin='7px 0';
    row.appendChild(el('span','rlbl',sl.toUpperCase()));
    const b1=el('button','btn sm',en?'Load file …':'Datei laden …'); b1.type='button';
    b1.onclick=()=>document.getElementById('cmp'+sl).click();
    const b2=el('button','btn sm',en?'use my profile':'mein Profil verwenden'); b2.type='button';
    b2.onclick=()=>useOwn(sl);
    row.appendChild(b1); row.appendChild(b2);
    const st=el('span','hint'); st.style.margin='0 0 0 8px';
    st.textContent=CMP[sl]?(nameOf(CMP[sl])+' · '+((CMP[sl].coverage||{}).items_in_mode||'?')+
      (en?' points':' Punkte')):(en?'nothing loaded':'nichts geladen');
    row.appendChild(st);
    if(CMP[sl]){const b3=el('button','btn sm','×'); b3.type='button';
      b3.onclick=()=>{CMP[sl]=null; renderCmp();}; row.appendChild(b3);}
    c.appendChild(row);
  });
  v.appendChild(c);
  if(!CMP.a||!CMP.b){
    const h=el('div','card');
    h.appendChild(el('div','hint',en?'Load two profiles to see the comparison.'
      :'Lade zwei Profile, um den Vergleich zu sehen.'));
    v.appendChild(h); return;
  }
  const rep=buildReport(CMP.a,CMP.b);
  const bar=el('div','card');
  bar.appendChild(el('h3',null,rep.nA+'  ·  '+rep.nB));
  bar.appendChild(el('div','hint',en
    ?'A match is a conversation opener, not permission. Consent happens in the conversation, not through matching ticks.'
    :'Ein Treffer ist ein Gesprächsanlass, keine Erlaubnis. Zustimmung entsteht im Gespräch, nicht durch übereinstimmende Kreuze.'));
  const ex=el('button','btn pri',en?'Export comparison as Markdown':'Vergleich als Markdown');
  ex.type='button'; ex.onclick=()=>exportCmpMD();
  bar.appendChild(ex);
  v.appendChild(bar);
  rep.sections.forEach(s=>{
    const g=el('div','egroup');
    const h=el('h4',null,s.title+(s.rows.length?' ('+s.rows.length+')':''));
    const worst=s.rows.reduce((m,r)=>({no:0,warn:1,ok:2,info:3}[r.tone]<
      {no:0,warn:1,ok:2,info:3}[m]?r.tone:m),'info');
    h.style.background=TONE[worst]; if(worst==='info')h.style.color='var(--txt)';
    g.appendChild(h);
    const box=el('div'); box.style.padding='9px 13px 12px';
    if(s.note){const n=el('div','hint'); n.innerHTML=mdInline(s.note); box.appendChild(n);}
    if(!s.rows.length) box.appendChild(el('div','hint',s.empty||'—'));
    s.rows.slice(0,400).forEach(r=>{
      const d=el('div'); d.style.cssText='padding:5px 0;border-bottom:1px solid #22262f';
      d.appendChild(el('div',null,MARK[r.tone]+' '+r.t));
      if(r.s){const sm=el('div','hint'); sm.style.margin='2px 0 0';
        sm.style.whiteSpace='pre-line'; sm.textContent=r.s; d.appendChild(sm);}
      box.appendChild(d);
    });
    if(s.rows.length>400) box.appendChild(el('div','hint','… '+(s.rows.length-400)+
      (en?' more, see the Markdown export':' weitere, siehe Markdown-Export')));
    g.appendChild(box); v.appendChild(g);
  });
}
function exportCmpMD(){
  if(!CMP.a||!CMP.b) return;
  const en=ST.lang==='en', rep=buildReport(CMP.a,CMP.b), S=[];
  S.push('# '+(en?'Comparison':'Vergleich')+': '+rep.nA+' · '+rep.nB,'');
  S.push('<!-- '+APP.name+' '+APP.version+' · '+new Date().toISOString()+' -->','');
  S.push('> '+(en
    ?'**A match is a conversation opener, not permission.** Consent happens in the conversation, not through matching ticks. Anything not asked is **open, not refused**.'
    :'**Ein Treffer ist ein Gesprächsanlass, keine Erlaubnis.** Zustimmung entsteht im Gespräch, nicht durch übereinstimmende Kreuze. Was nicht abgefragt wurde, ist **offen, nicht abgelehnt**.'),'');
  S.push('> '+(en?'Ranks are not offset against each other and there is no compatibility score — on purpose.'
    :'Ränge werden nicht verrechnet und es gibt keine Passungskennzahl — mit Absicht.'),'');
  rep.sections.forEach((s,i)=>{
    S.push('## '+(i)+'. '+s.title,'');
    if(s.note) S.push(s.note,'');
    if(!s.rows.length){ S.push('*'+(s.empty||'—')+'*',''); return; }
    s.rows.forEach(r=>{
      S.push('- '+MARK[r.tone]+' **'+r.t+'**');
      if(r.s) r.s.split('\n').forEach(line=>S.push('  ' +line));
    });
    S.push('');
  });
  S.push('---','',(en?'Generated by ':'Erzeugt mit ')+APP.name+' '+APP.version+
    ' · '+(en?'entirely locally, no data left either device.'
    :'vollständig lokal, keine Daten haben ein Gerät verlassen.'),'');
  dl('kinkcompass_vergleich_'+stamp()+'.md',S.join('\n'),'text/markdown');
}
</script>
