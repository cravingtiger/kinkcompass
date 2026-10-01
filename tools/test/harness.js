/* Minimaler DOM-Stub, um die App-Logik ohne Browser durchzurechnen. */
const fs=require('fs'),path=require('path');
function mkEl(tag){
  const n={tagName:(tag||'div').toUpperCase(),children:[],attrs:{},style:{},dataset:{},
    _cls:new Set(),_text:'',value:'',checked:false,files:null,
    appendChild(c){this.children.push(c);return c;},
    removeChild(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);},
    remove(){}, click(){}, focus(){},
    querySelectorAll(){return [];},
    setAttribute(k,v){this.attrs[k]=v;}, getAttribute(k){return this.attrs[k];},
    addEventListener(){}, 
  };
  n.classList={add:(...c)=>c.forEach(x=>n._cls.add(x)),
    remove:(...c)=>c.forEach(x=>n._cls.delete(x)),
    contains:(c)=>n._cls.has(c),
    toggle:(c,f)=>{const on=f===undefined?!n._cls.has(c):!!f; on?n._cls.add(c):n._cls.delete(c); return on;}};
  Object.defineProperty(n,'childNodes',{get(){return n.children;}});
  Object.defineProperty(n,'firstChild',{get(){return n.children[0]||null;}});
  Object.defineProperty(n,'className',{get(){return [...n._cls].join(' ');},
    set(v){n._cls=new Set(String(v).split(/\s+/).filter(Boolean));}});
  Object.defineProperty(n,'textContent',{get(){return n._text;},set(v){n._text=String(v);n.children=[];}});
  Object.defineProperty(n,'innerHTML',{get(){return n._html||'';},set(v){n._html=String(v);n._text=String(v).replace(/<[^>]*>/g,'');n.children=[];}});
  return n;
}
const store={};
global.localStorage={getItem:k=>k in store?store[k]:null,
  setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
const byId={};
['subline','mode','lang','q','bGuide','bExpl','imp','pbKinkC','pbKinkS','piKink',
 'pbSafeC','pbSafeS','piSafe','intro','lblMeta','lblAlias','lblDate','lblSelf','lblVer',
 'lblFree','lblProgKink','lblProgSafe','vGuide','vForm','vSearch','vPrio','vEval','foot',
 'printview','pOnlyRated','pExpl','refs','storagewarn','versionwarn','vLegend','bLegend','vCmp','bCmp','cmpa','cmpb'].forEach(id=>{byId[id]=mkEl('div');byId[id].id=id;});
byId.pOnlyRated.checked=true;
global.document={
  documentElement:mkEl('html'),
  body:Object.assign(mkEl('body'),{dataset:{view:'form'}}),
  createElement:mkEl, getElementById:id=>byId[id]||null,
  querySelectorAll:(sel)=>sel==='[data-meta]'?[]:[],
  addEventListener(){}, removeEventListener(){}, querySelector(){return null;},
};
global.window={scrollY:0,scrollTo(){},print(){}};
global.alert=(m)=>{global.__alerts=(global.__alerts||[]).concat(m);};
global.confirm=()=>true;
global.Blob=function(p,o){this.parts=p;this.type=o&&o.type;};
global.URL={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
global.__downloads=[];
global.FileReader=function(){this.readAsText=(f)=>{this.result=f._text;this.onload();};};
global.setTimeout=(fn)=>{fn();return 0;};      /* synchron, damit rerender sofort laeuft */
global.clearTimeout=()=>{};

const html=fs.readFileSync(path.join(__dirname,'../../KinkCompass.html'),'utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=blocks.join('\n;\n');
/* dl() abfangen */
const patched=code.replace(/function dl\(name,text,mime\)\{[\s\S]*?\n\}/,
  'function dl(name,text,mime){global.__downloads.push({name:name,text:text,mime:mime});}');
(new Function(patched+'\n;global.__api={ST:()=>ST,IDX:IDX,THEMES:THEMES,SC:SC,ORD:ORD,'+
 'roleOf:roleOf,effW:effW,effP:effP,effF:effF,isSkipped:isSkipped,countUnits:countUnits,'+
 'snapshot:snapshot,bundle:bundle,exportMD:exportMD,exportJSON:exportMD,'+
 'setMode:setMode,setView:setView,rerender:rerender,starredUnits:starredUnits,'+
 'MIG:MIG,snapshot2:snapshot,legendBlock:legendBlock,toggleLegend:toggleLegend,optsOf:optsOf,DATAchoices:DATA.tree.choices,migrateState:migrateState,migSummary:migSummary,BLANK:BLANK,CMP:CMP,buildReport:buildReport,renderCmp:renderCmp,exportCmpMD:exportCmpMD,'+
 'parseProfile:parseProfile,useOwn:useOwn,'+
 'stepList:stepList,nodeItems:nodeItems,cardList:cardList,goCard:goCard,limitStep:limitStep,hasLimits:hasLimits,saveMD:saveMD,saveJSON:saveJSON,'+
 'save:save,setST:(o)=>{ST=Object.assign(ST,o);},importText:(t)=>{'+
 'const f=document.createElement("x");f.textContent=t;'+
 'importFile({files:[f],value:""});}};'))();
module.exports=global.__api;
