import {matchesTopic} from './mix.mjs';
export const intervals={again:600000,hard:86400000,good:259200000,easy:604800000};
export function fresh(){return {version:1,records:{},favorites:[],archived:[],daily:{},size:20}}
export function valid(x){return !!(x&&x.version===1&&(x.preferences===undefined||(x.preferences&&typeof x.preferences==='object'&&!Array.isArray(x.preferences)&&Object.entries(x.preferences).every(([k,v])=>['direct','clock','feedback','reminder','repeatAgain'].includes(k)&&typeof v==='boolean')))&&(x.archived===undefined||(Array.isArray(x.archived)&&x.archived.every(n=>Number.isInteger(n)&&n>=1&&n<=1000000)))&&[10,20,40,183,100000].includes(x.size)&&Array.isArray(x.favorites)&&x.favorites.every(n=>Number.isInteger(n)&&n>=1&&n<=1000000)&&x.records&&typeof x.records==='object'&&!Array.isArray(x.records)&&Object.entries(x.records).every(([n,r])=>/^\d+$/.test(n)&&+n>=1&&+n<=1000000&&r&&Object.hasOwn(intervals,r.rating)&&Number.isFinite(r.due)&&Number.isFinite(r.last)&&Number.isFinite(r.count)&&r.count>=1)&&x.daily&&typeof x.daily==='object'&&!Array.isArray(x.daily)&&Object.entries(x.daily).every(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&Number.isFinite(v)&&v>=0))}
export function selectCards(cards,state,mode,subject,now=Date.now()){return activeCards(cards,state).filter(c=>matchesTopic(c,subject)).filter(c=>{const r=state.records[c.n];return mode==='all'||(mode==='new'&&!r)||(mode==='due'&&r&&r.due<=now)||(mode==='hard'&&r&&['again','hard'].includes(r.rating))||(mode==='favorites'&&state.favorites.includes(c.n))}).sort((a,b)=>{const ar=state.records[a.n],br=state.records[b.n];if(!ar&&!br)return a.n-b.n;if(!ar)return -1;if(!br)return 1;return ar.due-br.due||a.n-b.n})}
export function record(state,n,rating,day,now=Date.now()){if(!Object.hasOwn(intervals,rating))throw Error('Invalid rating');return {...state,records:{...state.records,[n]:{rating,due:now+intervals[rating],last:now,count:(state.records[n]?.count||0)+1}},daily:{...state.daily,[day]:(state.daily[day]||0)+1}}}

export function courseCards(cards,course){return cards.filter(c=>course==='all'||c.course===course)}
export function courseTopics(cards,course){return [...new Set(courseCards(cards,course).map(c=>c.subject))].sort((a,b)=>a.localeCompare(b,'tr'))}

export function activeCards(cards,state){const hidden=new Set(state.archived||[]);return cards.filter(c=>!hidden.has(c.n))}
export function setArchived(state,n,archived){if(!Number.isInteger(n)||n<1||n>1000000)throw Error('Invalid card');const ids=new Set(state.archived||[]);if(archived)ids.add(n);else ids.delete(n);return {...state,archived:[...ids]}}

export function localDay(time){const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function studiedToday(state,day,cards=null){const ids=cards?new Set(cards.map(c=>c.n)):null;return Object.entries(state.records).filter(([n,r])=>(!ids||ids.has(+n))&&localDay(r.last)===day).length}
export function answerDistribution(cards,state){const out={again:0,hard:0,good:0,easy:0,new:0};for(const c of activeCards(cards,state)){const key=state.records[c.n]?.rating||'new';out[key]++}return out}
