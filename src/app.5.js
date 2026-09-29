<script>
"use strict";
/* ====================================================================
   Vergleich zweier Profile  (SPEC § 9)
   Zwei Grundsaetze, die den Aufbau bestimmen:
   - Sicherheit vor Lust, auch in der Dokumentreihenfolge.
   - Es gibt KEINE errechnete Passungskennzahl. Raenge werden nicht verrechnet.
   ==================================================================== */
const CMP={a:null,b:null};          /* nur im Arbeitsspeicher, nie in ST */
const POS=['must','neigung','sehnsucht'], CUR=['interessant'],
      NEU=['neutral','na'], SOFT=['soft'], HARD=['hard'];
const inl=(a,v)=>a.indexOf(v)>=0;

/* Ids, auf die die Querverweise zugreifen */
const ID_LEITMODELL='risikomodell/nach-welchem-modell-arbeitest-du';
const ID_ANREDE_GUT='sprache-wortliste/belohnende-ansprache';
const ID_ANREDE_HERAB='sprache-wortliste/herabsetzende-ansprache';
const ID_WORTE_NEIN='sprache-wortliste/absolut-ausgeschlossene-worte';
const WORT_KAT=['sprache-wortliste/sexistische-herabsetzung','sprache-wortliste/rassistische-oder-ethnisch-bezogene-herabsetzung','sprache-wortliste/herabsetzung-mit-bezug-auf-herkunft-oder-sprache','sprache-wortliste/koerper-und-gewichtsbezogene-herabsetzung','sprache-wortliste/behinderungs-oder-krankheitsbezogene-herabsetzung','sprache-wortliste/herabsetzung-mit-bezug-auf-gender-oder-orientierung','sprache-wortliste/herabsetzung-mit-bezug-auf-religion','sprache-wortliste/intelligenz-und-leistungsbezogene-herabsetzung','sprache-wortliste/sexuelle-herabsetzung'];
const KAT_ORD=['nie','whitelist','offen'];
const ABSICHERUNG=['reale-machtverhaeltnisse/ansprechperson-ausserhalb-benennen','reale-machtverhaeltnisse/ausstiegsplan-schriftlich-festhalten','reale-machtverhaeltnisse/dynamik-befristen-oder-ueberpruefen','reale-machtverhaeltnisse/eigene-finanzielle-unabhaengigkeit','reale-machtverhaeltnisse/eigene-wohnmoeglichkeit-sichern','reale-machtverhaeltnisse/nuechtern-verhandeln','reale-machtverhaeltnisse/auf-augenhoehe-verhandeln'];
const GESUND_KONTROLLE=['ernaehrung-sport-koerperdaten/ernaehrungsprotokoll-fuehren','ernaehrung-sport-koerperdaten/mahlzeiten-freigeben','ernaehrung-sport-koerperdaten/kalorien-oder-makrovorgabe','ernaehrung-sport-koerperdaten/essenszeiten-vorgegeben','ernaehrung-sport-koerperdaten/gewicht-regelmaessig-melden','ernaehrung-sport-koerperdaten/koerpermasse-melden','ernaehrung-sport-koerperdaten/blutdruck-melden','ernaehrung-sport-koerperdaten/blutzucker-melden','ernaehrung-sport-koerperdaten/laborwerte-besprechen','ernaehrung-sport-koerperdaten/trainingsplan-vorgegeben','ernaehrung-sport-koerperdaten/schlafdaten-teilen'];
const GESUND_GRENZEN=['gesundheit-selbstbestimmung/behandlung-in-aerztlicher-hand','gesundheit-selbstbestimmung/eigene-entscheidung-ueber-medikamente','gesundheit-selbstbestimmung/aerztlich-festgelegte-untergrenzen','gesundheit-selbstbestimmung/ernaehrung-und-gewicht-ausserhalb-der-dynamik','gesundheit-selbstbestimmung/straffreiheit-fuer-messwerte','gesundheit-selbstbestimmung/konsequenzen-nur-fuer-verhalten','gesundheit-selbstbestimmung/ueberwachung-jederzeit-abschaltbar','gesundheit-selbstbestimmung/loeschfrist-fuer-nachweise-und-aufzeichnungen'];
const MACHTABGABE=['grundorientierung/24-7-dynamik',
  'lifecoaching-accountability/dominante-begleitung-im-alltag-lifecoaching',
  'grundorientierung/total-power-exchange',
  'rollen-identitaeten/slave-als-rollenidentitaet',
  'rollen-identitaeten/property-besitzrolle','rollen-identitaeten/owner-eigentuemerrolle',
  'geld-findom/financial-domination-findom-mit-festem-budget','geld-findom/paypig-rollenspiel'];

/* ---------- Zugriff auf ein geladenes Profil ---------- */
const ansOf=(P,id)=>(P&&P.answers&&P.answers[id])||null;
function rOf(P,id,role){
  const a=ansOf(P,id); if(!a||!a.roles) return null;
  return a.roles[role]||null;
}
function valOf(P,id,role){
  const a=ansOf(P,id); if(!a) return null;
  if(a.roles){
    if(role&&a.roles[role]) return a.roles[role].value||null;
    if(!role){ const k=Object.keys(a.roles)[0]; return k?(a.roles[k].value||null):null; }
    return (a.roles['-']&&a.roles['-'].value)||null;
  }
  return a.value||null;
}
const txtOf=(P,id)=>{const a=ansOf(P,id); return a?(a.text||''):'';};
const nameOf=(P)=>(P&&P.meta&&P.meta.alias)||'—';
const unitsFor=(it)=>it.ap?['a','p']:['-'];
/* Auch im Vergleich gilt die Bezeichnung des Items, nicht die Vorgabe —
   sonst stuende bei „Knien" weiter „ausfuehrend", wo der Bogen selbst
   „kniet selbst" sagt. */
const roleTxt=(u,it)=>u==='a'||u==='p'?LB(roleOf(it,'#'+u)):'';
const src=(r)=>r&&r.rating_src==='inh'?' ('+(ST.lang==='en'?'derived':'abgeleitet')+')':'';
const itName=(it)=>LB({de:it.de,en:it.en});
const secName=(it)=>LB({de:IDX.sec[it.sec].title_de,en:IDX.sec[it.sec].title_en});
function sharedNote(P,id){const a=ansOf(P,id);
  return (a&&a.note&&a.note.shared&&a.note.text)?a.note.text.replace(/\n/g,' '):'';}

/* ---------- Bericht aufbauen ---------- */
function buildReport(A,B){
  const nA=nameOf(A), nB=nameOf(B), S=[];
  const push=(id,title,note,rows,empty)=>S.push({id:id,title:title,note:note,
    rows:rows,empty:empty||null});

  /* 0 — Abdeckung */
  const cov=(P)=>{const c=P.coverage||{};
    return (c.items_in_mode||0)+' von '+(c.items_total||IDX.items.length)+
      ' Punkten abgefragt ('+LB(MODELBL[P.mode||'v'])+')';};
  const covRows=[{t:nA+': '+cov(A),tone:'info'},{t:nB+': '+cov(B),tone:'info'}];
  /* Fassungsunterschiede offenlegen, statt sie als fehlende Antworten auszugeben */
  [[A,nA],[B,nB]].forEach(([P,n])=>{
    const rev=(P.app&&P.app.listRevision)||null;
    const fremd=Object.keys(P.answers||{}).filter(id=>!IDX.byId[id]);
    const bits=[];
    if(rev&&rev!==APP.listRev) bits.push((ST.lang==='en'?'filled in against list revision '
      :'mit Listenfassung ')+rev+(ST.lang==='en'?', current is ':' ausgefüllt, aktuell ist ')+APP.listRev);
    if(fremd.length) bits.push(fremd.length+(ST.lang==='en'
      ?' answers refer to items this version does not have'
      :' Angaben beziehen sich auf Punkte, die es in dieser Fassung nicht gibt'));
    if(!bits.length) return;
    covRows.push({t:n+': '+(ST.lang==='en'?'different version':'abweichende Fassung'),
      s:bits.join(' · ')+'\n'+(ST.lang==='en'
        ?'Unanswered items can therefore also mean the item did not exist in that version.'
        :'„Nicht bewertet" kann hier also auch heißen, dass es den Punkt in jener Fassung noch nicht gab.'),
      tone:'warn'});
  });
  push('abdeckung',ST.lang==='en'?'Coverage':'Abdeckung',
    ST.lang==='en'
      ?'What was not asked is **open, not refused**. Do not read a gap as a no.'
      :'Was nicht abgefragt wurde, ist **offen, nicht abgelehnt**. Eine Lücke ist kein Nein.',
    covRows);

  /* 1 — Absolute No-Gos */
  const nogo=[];
  IDX.items.forEach(it=>{
    if(it.kind!=='wunsch') return;
    unitsFor(it).forEach(u=>{
      const a=rOf(A,it.id,u), b=rOf(B,it.id,u);
      const aH=a&&a.rating==='hard', bH=b&&b.rating==='hard';
      if(!aH&&!bH) return;
      const who=aH&&bH?(nA+' + '+nB):(aH?nA:nB);
      nogo.push({t:itName(it)+(u!=='-'?' — '+roleTxt(u,it):''),
        s:secName(it)+' · '+who+(aH?src(a):'')+(bH?src(b):''),tone:'no',
        sort:[it.theme,it.sec,it.de]});
    });
  });
  const worte=[]; [A,B].forEach((P,i)=>{splitWords(txtOf(P,ID_WORTE_NEIN))
    .forEach(w=>worte.push({w:w,who:i?nB:nA}));});
  worte.forEach(x=>nogo.push({t:'Wort: „'+x.w+'"',s:'ausgeschlossen von '+x.who,tone:'no',
    sort:['zzz','wort',x.w]}));
  nogo.sort((x,y)=>x.sort.join('|').localeCompare(y.sort.join('|')));
  push('nogo',ST.lang==='en'?'Absolute no-gos':'Absolute No-Gos',
    ST.lang==='en'?'The union of both sides. One hard limit is enough — it is not negotiable.'
      :'Die Vereinigung beider Seiten. Ein Hard Limit genügt — es steht nicht zur Verhandlung.',
    nogo, ST.lang==='en'?'None stated.':'Keine angegeben.');

  /* 2 — Unvereinbare Vereinbarungen */
  const ver=[];
  function vergleicheVereinbarung(it,ua,ub){
    const a=valOf(A,it.id,ua), b=valOf(B,it.id,ub);
    if(!a&&!b) return;
    const rolle=(ua!=='-')?' — '+nA+' '+roleTxt(ua,it)+' / '+nB+' '+roleTxt(ub,it):'';
    const name=itName(it)+rolle;
    const paar=(x,y)=>(a===x&&b===y)||(b===x&&a===y);
    const beide=nA+': '+(a?scLbl('vereinbarung',a):'—')+' · '+nB+': '+(b?scLbl('vereinbarung',b):'—');
    if(paar('verbindlich','ablehnend'))
      ver.push({t:name,s:beide+' — '+(ST.lang==='en'
        ?'a condition on one side against an express wish for the opposite on the other'
        :'Bedingung der einen Seite gegen den ausdrücklichen Gegenwillen der anderen'),tone:'no'});
    else if(paar('verbindlich','nicht-noetig'))
      ver.push({t:name,s:beide+' — '+(ST.lang==='en'
        ?'no contradiction in substance: one needs it, the other does not mind. Worth saying out loud.'
        :'kein Widerspruch in der Sache: die eine Seite braucht es, die andere hat nichts dagegen. Gehört trotzdem ausgesprochen.'),
        tone:'warn'});
    else if(paar('gewuenscht','ablehnend'))
      ver.push({t:name,s:beide,tone:'warn'});
    else if(a==='verbindlich'&&!b)
      ver.push({t:name,s:nA+' verbindlich · '+nB+' nicht beantwortet',tone:'warn'});
    else if(b==='verbindlich'&&!a)
      ver.push({t:name,s:nB+' verbindlich · '+nA+' nicht beantwortet',tone:'warn'});
  }
  IDX.items.forEach(it=>{
    if(!it.exempt||it.kind!=='vereinbarung') return;
    /* Ueber Kreuz: was die eine Seite als fuehrende zusichert, trifft auf das,
       was die andere als folgende braucht. */
    (it.ap?[['a','p'],['p','a']]:[['-','-']]).forEach(pr=>
      vergleicheVereinbarung(it,pr[0],pr[1]));
  });

  push('vereinbarungen',ST.lang==='en'?'Incompatible agreements':'Unvereinbare Vereinbarungen',
    ST.lang==='en'?'A binding condition on one side against a refusal on the other.'
      :'Eine verbindliche Bedingung der einen Seite gegen eine Ablehnung der anderen.',
    ver, ST.lang==='en'?'No contradictions found.':'Keine Widersprüche gefunden.');

  /* 3 — Risikomodell */
  const la=valOf(A,ID_LEITMODELL), lb=valOf(B,ID_LEITMODELL), risk=[];
  if(la||lb){
    const same=la&&lb&&la===lb;
    risk.push({t:nA+': '+(la?scLbl('leitmodell',la):'—')+'   ·   '+
      nB+': '+(lb?scLbl('leitmodell',lb):'—'),
      s:same?(ST.lang==='en'?'Same model.':'Gleiches Modell.')
        :(ST.lang==='en'?'Different risk stance — settle this before negotiating any high-risk practice.'
          :'Unterschiedliche Risikohaltung — vor jeder Hochrisiko-Praktik klären.'),
      tone:same?'ok':'warn'});
  }
  push('risikomodell',ST.lang==='en'?'Risk model':'Risikomodell',null,risk,
    ST.lang==='en'?'Not stated on either side.':'Von beiden Seiten nicht angegeben.');

  /* 4 — Zuerst zu besprechen: reale Abhaengigkeit + starke Machtabgabe */
  const first=[];
  [[A,nA],[B,nB]].forEach(([P,n])=>{
    const mh=[];
    MACHTABGABE.forEach(id=>{const it=IDX.byId[id]; if(!it) return;
      unitsFor(it).forEach(u=>{const r=rOf(P,id,u);
        if(r&&r.rating==='must') mh.push(itName(it)+(u!=='-'?' ('+roleTxt(u,it)+')':''));});});
    if(!mh.length) return;
    const offen=ABSICHERUNG.filter(id=>{
      const v=valOf(P,id); return !v||v==='ablehnend'||v==='nicht-noetig';
    }).map(id=>{const v=valOf(P,id); const nm=IDX.byId[id]?itName(IDX.byId[id]):id;
      return nm+(v?' ('+scLbl('vereinbarung',v)+')':'');});
    if(!offen.length) return;
    first.push({t:n+(ST.lang==='en'?': far-reaching power exchange without settled safeguards'
        :': weitreichende Machtabgabe ohne gesicherte Absicherung'),
      s:(ST.lang==='en'?'As must-have: ':'Als Must-have: ')+mh.join(', ')+
        '\n'+(ST.lang==='en'
          ?'A lasting transfer of power is only as revocable as the way out remains materially open. Settle these before any agreement.'
          :'Eine dauerhafte Machtabgabe ist nur so widerruflich, wie der Weg hinaus materiell offen bleibt. Vor einer Vereinbarung klären.')+
        '\n'+(ST.lang==='en'?'Open or declined: ':'Offen oder abgelehnt: ')+offen.join(', '),
      tone:'warn'});
  });
  /* 4b — gesundheitsbezogene Kontrolle ohne beantwortete Grenzen */
  (function(){
    const wollen=[];
    [[A,nA],[B,nB]].forEach(([P,n])=>{
      GESUND_KONTROLLE.forEach(id=>{
        const it=IDX.byId[id]; if(!it) return;
        unitsFor(it).forEach(u=>{
          const r=rOf(P,id,u);
          if(r&&(r.rating==='must'||r.rating==='neigung'))
            wollen.push(n+': '+itName(it)+(u!=='-'?' ('+roleTxt(u,it)+')':'')+
              ' — '+scLbl('wunsch',r.rating));
        });
      });
    });
    if(!wollen.length) return;
    const offen=[];
    GESUND_GRENZEN.forEach(id=>{
      const it=IDX.byId[id]; if(!it) return;
      const fehlt=[[A,nA],[B,nB]].filter(([P])=>!valOf(P,id)).map(([,n])=>n);
      if(fehlt.length) offen.push(itName(it)+' ('+fehlt.join(', ')+')');
    });
    if(!offen.length) return;
    first.push({t:ST.lang==='en'?'Health-related control without settled limits'
        :'Gesundheitsbezogene Kontrolle ohne beantwortete Grenzen',
      s:wollen.join('\n')+'\n'+(ST.lang==='en'
        ?'Health-related control works slowly and is hard to see from outside. Settle the counterparts in Framework and safety before this starts.'
        :'Gesundheitsbezogene Kontrolle wirkt langsam und ist von außen schwer zu erkennen. Die Gegenstücke in Rahmen und Sicherheit klären, bevor das beginnt.')+
        '\n'+(ST.lang==='en'?'Still open: ':'Noch offen: ')+offen.join(', '),
      tone:'warn'});
  })();

  push('zuerst',ST.lang==='en'?'To discuss first':'Zuerst zu besprechen',null,first,
    ST.lang==='en'?'No such combination found.':'Keine solche Kombination gefunden.');

  /* 5 — Nutzbare Sprache */
  const lang=[];
  const noAll=[].concat(splitWords(txtOf(A,ID_WORTE_NEIN)),splitWords(txtOf(B,ID_WORTE_NEIN)))
    .map(w=>w.toLowerCase());
  const frei=(w)=>noAll.indexOf(w.toLowerCase())<0;
  const lc=(w)=>w.toLowerCase();
  const inList=(l,w)=>l.some(x=>lc(x)===lc(w));
  const gutA=splitWords(txtOf(A,ID_ANREDE_GUT)), gutB=splitWords(txtOf(B,ID_ANREDE_GUT));
  const herA=splitWords(txtOf(A,ID_ANREDE_HERAB)), herB=splitWords(txtOf(B,ID_ANREDE_HERAB));
  function blockListe(la,lb,titel,hinweis){
    if(!la.length&&!lb.length) return;
    const both=la.filter(w=>inList(lb,w)).filter(frei);
    lang.push({t:titel+': '+(both.length?both.join(', ')
      :(ST.lang==='en'?'nothing on both lists':'nichts auf beiden Listen')),
      s:hinweis, tone:both.length?'ok':'warn'});
    const onlyA=la.filter(frei).filter(w=>!inList(lb,w));
    const onlyB=lb.filter(frei).filter(w=>!inList(la,w));
    if(onlyA.length) lang.push({t:(ST.lang==='en'?'Only ':'Nur ')+nA+': '+onlyA.join(', '),
      s:ST.lang==='en'?'not released by the other side':'von der anderen Seite nicht freigegeben',tone:'warn'});
    if(onlyB.length) lang.push({t:(ST.lang==='en'?'Only ':'Nur ')+nB+': '+onlyB.join(', '),
      s:ST.lang==='en'?'not released by the other side':'von der anderen Seite nicht freigegeben',tone:'warn'});
  }
  blockListe(gutA,gutB,ST.lang==='en'?'Rewarding, usable':'Belohnend, nutzbar',
    ST.lang==='en'?'Words both sides released as praise.'
      :'Worte, die beide Seiten als Lob freigegeben haben.');
  blockListe(herA,herB,ST.lang==='en'?'Degrading, usable':'Herabsetzend, nutzbar',
    ST.lang==='en'?'Words both sides released as an insult.'
      :'Worte, die beide Seiten als Beschimpfung freigegeben haben.');
  /* Derselbe Klang, entgegengesetzte Bedeutung. Der Befund, den eine einzige
     gemeinsame Wortliste nicht hergeben konnte. */
  const konflikt=[];
  gutA.filter(frei).forEach(w=>{ if(inList(herB,w))
    konflikt.push({w:w,lob:nA,schimpf:nB}); });
  gutB.filter(frei).forEach(w=>{ if(inList(herA,w))
    konflikt.push({w:w,lob:nB,schimpf:nA}); });
  konflikt.forEach(k=>lang.push({t:(ST.lang==='en'?'Conflicting meaning: „'
      :'Bedeutungskonflikt: „')+k.w+'"',
    s:k.lob+(ST.lang==='en'?' released it as praise, ':' hat es als Lob freigegeben, ')+
      k.schimpf+(ST.lang==='en'?' as an insult. The same word lands in opposite ways — settle it before it is used.'
        :' als Beschimpfung. Dasselbe Wort kommt gegenteilig an — vor dem Gebrauch klären.'),
    tone:'no'}));
  WORT_KAT.forEach(id=>{
    const it=IDX.byId[id]; if(!it) return;
    const a=valOf(A,id), b=valOf(B,id); if(!a&&!b) return;
    const ia=a?KAT_ORD.indexOf(a):0, ib=b?KAT_ORD.indexOf(b):0;
    const eff=KAT_ORD[Math.min(ia<0?0:ia, ib<0?0:ib)];
    lang.push({t:itName(it)+': '+scLbl('herabsetzung',eff),
      s:nA+': '+(a?scLbl('herabsetzung',a):'—')+' · '+nB+': '+(b?scLbl('herabsetzung',b):'—')+
        (a!==b?' — '+(ST.lang==='en'?'the more restrictive answer applies'
          :'es gilt die restriktivere Angabe'):''),
      tone:eff==='nie'?'no':(a!==b?'warn':'ok')});
  });
  push('sprache',ST.lang==='en'?'Usable language':'Nutzbare Sprache',
    ST.lang==='en'?'Word lists are intersected, categories take the stricter side.'
      :'Wortlisten werden geschnitten, bei Kategorien gilt die strengere Seite.',
    lang, ST.lang==='en'?'No word lists filled in.':'Keine Wortlisten ausgefüllt.');

  /* 6 — Strafe */
  const str=[];
  IDX.items.forEach(it=>{
    if(it.kind!=='wunsch'||!it.ap) return;
    [[A,nA,B,nB],[B,nB,A,nA]].forEach(([P,pn,Q,qn])=>{
      const rec=rOf(P,it.id,'p'), giv=rOf(Q,it.id,'a');
      const rp=rec&&rec.punishment, gp=giv&&giv.punishment;
      if(!rp&&!gp) return;
      if(rec&&rec.rating==='hard') return;               /* steht schon unter No-Go */
      if(rp==='echt'&&gp==='echt')
        str.push({t:itName(it),s:pn+' '+(ST.lang==='en'?'receives':'empfängt')+' · '+qn+' '+
          (ST.lang==='en'?'administers':'verhängt')+' — '+
          (ST.lang==='en'?'effective consequence, carried by both':'wirksame Konsequenz, beidseitig getragen'),
          tone:'ok'});
      else if(rp==='reizvoll'&&gp==='echt')
        str.push({t:itName(it),s:qn+' '+(ST.lang==='en'?'means this as a real punishment, '
          :'meint das als echte Strafe, ')+pn+(ST.lang==='en'
          ?' finds it arousing — it does not deter.':' findet es reizvoll — es wirkt nicht abschreckend.'),
          tone:'warn'});
      else if(rp==='echt'&&!gp)
        str.push({t:itName(it),s:pn+(ST.lang==='en'?' allows this as a real punishment; '
          :' erlaubt das als echte Strafe; ')+qn+(ST.lang==='en'
          ?' has not said they are willing to administer it.':' hat keine Bereitschaft angegeben, sie zu verhängen.'),
          tone:'warn'});
    });
  });
  push('strafe',ST.lang==='en'?'Punishment':'Strafe',
    ST.lang==='en'?'A punishment that arouses is not a punishment.'
      :'Eine Strafe, die erregt, ist keine Strafe.',
    str, ST.lang==='en'?'Nothing recorded on the punishment axis.':'Auf der Strafe-Achse nichts angegeben.');

  /* 7 — Prioritaeten-Abgleich */
  const prio=[];
  [[A,nA,B,nB],[B,nB,A,nA]].forEach(([P,pn,Q,qn])=>{
    (P.priorities||[]).forEach((k,i)=>{
      const role=/#[ap]$/.test(k)?k.slice(-2,-1)==='a'?'a':'p':'-';
      const id=/#[ap]$/.test(k)?k.slice(0,-2):k;
      const it=IDX.byId[id]; if(!it) return;
      const opp=role==='a'?'p':role==='p'?'a':'-';
      const q=rOf(Q,id,opp);
      const qv=q&&q.rating;
      let tone='info',txt;
      if(!qv) txt=qn+(ST.lang==='en'?' has not rated this — open, not refused.'
        :' hat das nicht bewertet — offen, nicht abgelehnt.'),tone='warn';
      else if(qv==='hard') txt=qn+(ST.lang==='en'?': hard limit — a core wish meets a no-go.'
        :': Hard Limit — ein Kernwunsch trifft auf ein No-Go.'),tone='no';
      else if(qv==='soft') txt=qn+(ST.lang==='en'?': soft limit — the most important thing to negotiate.'
        :': Soft Limit — der wichtigste Verhandlungspunkt.'),tone='warn';
      else if(inl(POS,qv)) txt=qn+': '+scLbl('wunsch',qv)+src(q)+
        (ST.lang==='en'?' — strong match.':' — starker Treffer.'),tone='ok';
      else txt=qn+': '+scLbl('wunsch',qv)+src(q);
      prio.push({t:'#'+(i+1)+' '+pn+': '+itName(it)+(role!=='-'?' ('+roleTxt(role,it)+')':''),
        s:txt,tone:tone,ord:i});
    });
  });
  prio.sort((x,y)=>({no:0,warn:1,ok:2,info:3}[x.tone]-{no:0,warn:1,ok:2,info:3}[y.tone])||x.ord-y.ord);
  push('prioritaeten',ST.lang==='en'?'Priorities':'Prioritäten-Abgleich',
    ST.lang==='en'?'Ranks are **not** offset against each other. There is no compatibility score.'
      :'Ränge werden **nicht** miteinander verrechnet. Es gibt keine Passungskennzahl.',
    prio, ST.lang==='en'?'No priorities set on either side.':'Auf beiden Seiten keine Prioritäten gesetzt.');

  /* 8–11 — Wunsch-Matching */
  const match=[],entdecken=[],einseitig=[],verhandeln=[],fantasie=[];
  const rank=(v)=>ORD.indexOf(v);
  IDX.items.forEach(it=>{
    if(it.kind!=='wunsch') return;
    const fa=(ansOf(A,it.id)||{}).fantasy_only, fb=(ansOf(B,it.id)||{}).fantasy_only;
    const pairs=it.ap?[['a','p',A,nA,B,nB],['p','a',A,nA,B,nB]]:[['-','-',A,nA,B,nB]];
    pairs.forEach(([ua,ub,PA,pn,PB,qn])=>{
      const a=rOf(PA,it.id,ua), b=rOf(PB,it.id,ub);
      const av=a&&a.rating, bv=b&&b.rating;
      if(av==='hard'||bv==='hard') return;               /* No-Go steht oben */
      const dir=it.ap?(ua==='a'?pn+' → '+qn:qn+' → '+pn):pn+' + '+qn;
      const base={t:itName(it)+(it.ap?' — '+dir:''),
        s:secName(it)+' · '+pn+': '+(av?scLbl('wunsch',av)+src(a):'—')+
          ' · '+qn+': '+(bv?scLbl('wunsch',bv)+src(b):'—'),
        ord:Math.min(rank(av)<0?99:rank(av),rank(bv)<0?99:rank(bv))};
      const note=[sharedNote(A,it.id),sharedNote(B,it.id)].filter(Boolean).join(' / ');
      if(note) base.s+=' · '+note;
      if(fa||fb){ fantasie.push(Object.assign({tone:'info'},base,
        {s:base.s+' · '+(ST.lang==='en'?'fantasy only — talk, do not enact'
          :'nur Fantasie — darüber reden, nicht umsetzen')})); return; }
      if(inl(POS,av)&&inl(POS,bv)) match.push(Object.assign({tone:'ok'},base));
      else if(inl(CUR,av)&&inl(CUR,bv)){
        const noExp=(a&&a.experience==='keine')&&(b&&b.experience==='keine');
        entdecken.push(Object.assign({tone:'ok'},base,
          {s:base.s+(noExp?' · '+(ST.lang==='en'?'neither has experience'
            :'beide ohne Erfahrung'):'')}));
      }
      else if((inl(SOFT,av)&&(inl(POS,bv)||inl(CUR,bv)))||
              (inl(SOFT,bv)&&(inl(POS,av)||inl(CUR,av))))
        verhandeln.push(Object.assign({tone:'warn'},base));
      else if(av==='must'&&(!bv||inl(NEU,bv)))
        einseitig.push(Object.assign({tone:'warn'},base,
          {s:base.s+' · '+(bv?'':(ST.lang==='en'?'not rated — open, not refused'
            :'nicht bewertet — offen, nicht abgelehnt'))}));
      else if(bv==='must'&&(!av||inl(NEU,av)))
        einseitig.push(Object.assign({tone:'warn'},base,
          {s:base.s+' · '+(av?'':(ST.lang==='en'?'not rated — open, not refused'
            :'nicht bewertet — offen, nicht abgelehnt'))}));
    });
  });
  [match,entdecken,verhandeln,einseitig,fantasie].forEach(a=>a.sort((x,y)=>x.ord-y.ord));
  push('match',ST.lang==='en'?'Matches':'Treffer',
    ST.lang==='en'?'Sorted by how strongly both sides want it. A match is a conversation opener, not permission.'
      :'Sortiert danach, wie stark beide es wollen. Ein Treffer ist ein Gesprächsanlass, keine Erlaubnis.',
    match, ST.lang==='en'?'No overlap found.':'Keine Überschneidung gefunden.');
  push('einseitig',ST.lang==='en'?'One-sided core wishes':'Einseitige Kernwünsche',
    ST.lang==='en'?'A must-have on one side that the other has not answered positively.'
      :'Ein Must-have der einen Seite, das die andere nicht positiv beantwortet hat.',
    einseitig, ST.lang==='en'?'None.':'Keine.');
  push('verhandeln',ST.lang==='en'?'To negotiate':'Verhandeln',
    ST.lang==='en'?'A soft limit against interest on the other side.'
      :'Ein Soft Limit gegen Interesse der anderen Seite.',
    verhandeln, ST.lang==='en'?'None.':'Keine.');
  push('entdecken',ST.lang==='en'?'Explore together':'Gemeinsam entdecken',
    null, entdecken, ST.lang==='en'?'None.':'Keine.');
  push('fantasie',ST.lang==='en'?'Fantasy only — do not enact':'Nur Fantasie, nicht umsetzen',
    null, fantasie, ST.lang==='en'?'None.':'Keine.');

  /* 12 — Aftercare */
  const after=[];
  (IDX.sec['aftercare']?IDX.sec['aftercare'].items:[]).forEach(it=>{
    unitsFor(it).forEach(u=>{
      const opp=u==='a'?'p':u==='p'?'a':'-';
      const a=rOf(A,it.id,u), b=rOf(B,it.id,opp);
      if(!a&&!b) return;
      const av=a&&a.rating, bv=b&&b.rating;
      if(!inl(POS,av)&&!inl(POS,bv)) return;
      after.push({t:itName(it)+(u!=='-'?' — '+roleTxt(u,it):''),
        s:nA+': '+(av?scLbl('wunsch',av):'—')+' · '+nB+': '+(bv?scLbl('wunsch',bv):'—'),
        tone:(inl(POS,av)&&inl(POS,bv))?'ok':'warn'});
    });
  });
  push('aftercare',ST.lang==='en'?'Aftercare':'Aftercare-Abgleich',null,after,
    ST.lang==='en'?'Nothing rated.':'Nichts bewertet.');

  /* 13 — Offen */
  const offenRows=[];
  let bothOpen=0;
  IDX.items.forEach(it=>{
    if(it.kind!=='wunsch') return;
    unitsFor(it).forEach(u=>{
      if(!rOf(A,it.id,u)&&!rOf(B,it.id,u)) bothOpen++;
    });
  });
  offenRows.push({t:bothOpen+(ST.lang==='en'?' units rated by neither side.'
    :' Einheiten von keiner Seite bewertet.'),
    s:ST.lang==='en'?'Open, not refused.':'Offen, nicht abgelehnt.',tone:'info'});
  push('offen',ST.lang==='en'?'Still open':'Offen',null,offenRows);
  return {a:A,b:B,nA:nA,nB:nB,sections:S};
}
function splitWords(t){
  return String(t||'').split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean);
}
</script>
