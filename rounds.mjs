import {isMix,mixPairs,matchesTopic} from './mix.mjs';
import {selectCards,courseCards} from './core.mjs';
export const studyModes=['all','new','due','hard','favorites'];
export const modeNames={all:'Serbest çalışma',new:'Yeni kartlar',due:'Tekrar zamanı gelenler',hard:'Zorlandıklarım',favorites:'Favorilerim'};
export const roundKey=(course,subject,mode)=>JSON.stringify([course,subject,mode]);
export function normalizeRound(value,cards,archived=[],records={}){
 if(!value||!Array.isArray(value.ids)||!Number.isInteger(value.index)||value.index<0||value.index>value.ids.length||!studyModes.includes(value.mode)||typeof value.course!=='string'||typeof value.subject!=='string'||!Array.isArray(value.completed))return null;
 const map=new Map(cards.map(c=>[c.n,c]));if(value.course!=='all'&&!cards.some(c=>c.course===value.course))return null;
 if(isMix(value.subject)&&(!mixPairs(value.subject).length||value.course!=='all'))return null;
 if(!isMix(value.subject)&&value.subject!=='all'&&!cards.some(c=>(value.course==='all'||c.course===value.course)&&c.subject===value.subject))return null;
 if(new Set(value.ids).size!==value.ids.length||value.ids.some(n=>!map.has(n)||(value.course!=='all'&&map.get(n).course!==value.course)||(!matchesTopic(map.get(n),value.subject))))return null;
 const repeatPending=Object.fromEntries(Object.entries(value.repeatPending||{}).filter(([n,last])=>value.ids.includes(+n)&&Number.isFinite(last)&&records[n]?.rating==='again'&&records[n]?.last===last));
 const hidden=new Set(archived);if(value.mode==='new')for(const n of value.ids)if(records[n]&&!value.completed.includes(n)&&!Object.hasOwn(repeatPending,n))hidden.add(n);
 const ids=value.ids.filter(n=>!hidden.has(n)),index=value.ids.slice(0,value.index).filter(n=>!hidden.has(n)).length;
 const completed=[...new Set(value.completed)].filter(n=>ids.includes(n));const skipped=(Array.isArray(value.skipped)?value.skipped:value.ids.slice(0,value.index)).filter(n=>ids.includes(n)&&!completed.includes(n));
 const pending=Object.fromEntries(Object.entries(repeatPending).filter(([n])=>ids.includes(+n)));
 return {...(Object.keys(pending).length?{repeatPending:pending}:{}),ids,index,course:value.course,subject:value.subject,mode:value.mode,completed,skipped:[...new Set(skipped)],revealed:!!value.revealed&&ids[index]===value.ids[value.index],started:value.started===true||index>0||completed.length>0,updated:Number.isFinite(value.updated)?value.updated:0,clock:value.clock&&typeof value.clock==='object'?value.clock:null};
}
export function shuffleRemaining(ids,index,completed,random=Math.random){const done=new Set(completed),result=[...ids],positions=[];for(let i=index;i<ids.length;i++)if(!done.has(ids[i]))positions.push(i);const remaining=positions.map(i=>ids[i]);for(let i=remaining.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}positions.forEach((p,i)=>result[p]=remaining[i]);return result}
export function retrySkipped(ids,completed,skipped){const done=new Set(completed),skip=new Set(skipped),pending=ids.filter(n=>skip.has(n)&&!done.has(n)),rest=ids.filter(n=>!pending.includes(n));return {ids:[...rest,...pending],index:rest.length,pending}}

export function cancelRepeats(round){
 const pending=new Set(Object.keys(round.repeatPending||{}).map(Number));
 if(!pending.size)return round;
 const before=round.ids.slice(0,round.index),after=round.ids.slice(round.index),settled=after.filter(n=>pending.has(n));
 return {...round,ids:[...before,...settled,...after.filter(n=>!pending.has(n))],index:before.length+settled.length,
  completed:[...new Set([...round.completed,...pending])],skipped:round.skipped.filter(n=>!pending.has(n)),repeatPending:{},revealed:round.revealed&&!pending.has(round.ids[round.index])};
}
export function reconcileRound(raw,cards,state,now=Date.now()){
 let x=normalizeRound(raw,cards,state.archived,state.records);if(!x)return null;
 if(!state.preferences?.repeatAgain&&Object.keys(x.repeatPending||{}).length)x=cancelRepeats(x);
 const eligible=new Set(selectCards(courseCards(cards,x.course),state,x.mode,x.subject,now).map(c=>c.n));
 const pending=x.repeatPending||{},done=new Set(x.completed);
 const keep=n=>done.has(n)||eligible.has(n)||(Object.hasOwn(pending,n)&&(x.mode!=='favorites'||state.favorites.includes(n)));
 const ids=x.ids.filter(keep),index=x.ids.slice(0,x.index).filter(keep).length;
 return {...x,ids,index,completed:x.completed.filter(n=>ids.includes(n)),skipped:x.skipped.filter(n=>ids.includes(n)),
  repeatPending:Object.fromEntries(Object.entries(pending).filter(([n])=>ids.includes(+n))),revealed:x.revealed&&ids[index]===x.ids[x.index]};
}
export function advanceRatedRound(round,n,rating,last,repeatAgain){
 const ids=[...round.ids],completed=new Set(round.completed),repeatPending={...(round.repeatPending||{})};
 const skipped=round.skipped.filter(id=>id!==n);let index=round.index;
 if(repeatAgain&&rating==='again'){
  completed.delete(n);repeatPending[n]=last;ids.splice(index,1);ids.push(n);
 }else{completed.add(n);delete repeatPending[n];index++;}
 return {...round,ids,index,completed:[...completed],skipped,repeatPending,revealed:false,started:true};
}
