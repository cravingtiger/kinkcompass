/* Prueft, dass eine gesperrte Speicherung sichtbar gemeldet wird statt still zu scheitern. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const h=fs.readFileSync(path.join(__dirname,'harness.js'),'utf8');
const blocked=h.replace(
 "global.localStorage={getItem:k=>k in store?store[k]:null,\n  setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};",
 "global.localStorage={getItem:()=>null,setItem:()=>{throw new Error('blocked');},removeItem:()=>{}};");
if(blocked===h){console.log('  FAIL  Stub konnte nicht praepariert werden');process.exit(1);}
const tmp=path.join(__dirname,'.harness_blocked.js');
fs.writeFileSync(tmp,blocked);
let pass=0,fail=0;
const ok=(n,c,i)=>{c?pass++:fail++;console.log((c?'  ok  ':'  FAIL')+'  '+n+(c?'':'  → '+i));};
try{
  const A=require(tmp);
  const warn=global.document.getElementById('storagewarn');
  ok('App startet trotz gesperrtem Speicher', !!A.IDX && A.IDX.items.length>1500, 'n');
  ok('Warnung ist sichtbar', warn.style.display==='block', JSON.stringify(warn.style));
  ok('Warnung nennt den Export als Ausweg', /Markdown/.test(warn.textContent), warn.textContent.slice(0,80));
  A.ST().w['impact-play/flogger#a']='neigung';
  ok('Bewerten funktioniert weiterhin im Arbeitsspeicher',
     A.effW(A.IDX.byId['impact-play/flogger'],'#a').v==='neigung','x');
}finally{ fs.unlinkSync(tmp); }
console.log('\n'+(fail?'FEHLER: '+fail:'alle '+pass+' Speicher-Prüfungen bestanden'));
process.exit(fail?1:0);
