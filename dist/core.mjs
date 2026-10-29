export const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
export const clamp = (v, a = 0, b = 10) => Math.max(a, Math.min(b, Number(v) || 0));
export function weights(criteria) {
  const total = criteria.reduce((s,c) => s + clamp(c.weight,0,100),0);
  return criteria.map(c => total ? clamp(c.weight,0,100)/total : 1/criteria.length);
}
export function rank(decision, override) {
  const ws = override || weights(decision.criteria);
  return decision.options.map((o,index) => {
    const misses = decision.criteria.filter(c => c.must && clamp(o.scores[c.id]) < 5);
    const score = decision.criteria.reduce((s,c,i) => s + clamp(o.scores[c.id]) * ws[i] * 10,0);
    return {...o,index,score,eligible:!misses.length,misses};
  }).sort((a,b) => Number(b.eligible)-Number(a.eligible) || b.score-a.score || a.index-b.index);
}
export function redistribute(criteria,index,percent) {
  if(criteria.length===1) return [1];
  const rest=criteria.reduce((s,c,i)=>s+(i===index?0:clamp(c.weight,0,100)),0);
  const p=clamp(percent,0,100)/100;
  return criteria.map((c,i)=>i===index?p:(1-p)*(rest?clamp(c.weight,0,100)/rest:1/(criteria.length-1)));
}
export function switchPoint(decision,index) {
  const base=rank(decision)[0];
  if(!base?.eligible)return null;
  const baseline=Math.round(weights(decision.criteria)[index]*100);
  let result=null;
  for(let p=0;p<=100;p++) {
    const leader=rank(decision,redistribute(decision.criteria,index,p))[0];
    if(leader.eligible&&leader.id!==base.id&&(!result||Math.abs(p-baseline)<Math.abs(result.percent-baseline)))result={percent:p,name:leader.name,id:leader.id};
  }
  return result;
}
export function sample() {
  const criteria=[{id:'impact',name:'Real-world usefulness',weight:35,must:false},{id:'joy',name:'Excitement to build',weight:25,must:false},{id:'ship',name:'Easy to ship',weight:25,must:false},{id:'learn',name:'Learning potential',weight:15,must:false}];
  return {id:uid(),title:'What should I build next?',note:'A small project with a real reason to exist.',createdAt:new Date().toISOString(),criteria,options:[{id:uid(),name:'Portfolio refresh',note:'A sharper first impression',scores:{impact:6,joy:6,ship:9,learn:5}},{id:uid(),name:'Tiny useful tool',note:'Solve one everyday problem',scores:{impact:9,joy:9,ship:7,learn:8}},{id:uid(),name:'Weekend experiment',note:'Follow a wild little idea',scores:{impact:5,joy:10,ship:8,learn:9}}]};
}
export function validateImport(input) {
  if(!input||input.version!==1||!Array.isArray(input.decisions)||input.decisions.length>50)throw new Error('Choose a Fork backup file (up to 50 decisions).');
  return input.decisions.map(d=>{
    if(typeof d.title!=='string'||!d.title.trim()||!Array.isArray(d.criteria)||d.criteria.length<1||d.criteria.length>8||!Array.isArray(d.options)||d.options.length<2||d.options.length>5)throw new Error('This backup contains an invalid decision.');
    const ids=new Set();
    const criteria=d.criteria.map(c=>{
      if(typeof c.id!=='string'||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim())throw new Error('Invalid criteria in backup.');
      ids.add(c.id);return{id:c.id,name:c.name.slice(0,60),weight:clamp(c.weight,0,100),must:!!c.must};
    });
    return{id:uid(),title:d.title.trim().slice(0,100),note:String(d.note||'').slice(0,300),createdAt:d.createdAt||new Date().toISOString(),criteria,options:d.options.map(o=>({id:uid(),name:String(o.name||'Option').slice(0,60),note:String(o.note||'').slice(0,150),scores:Object.fromEntries(criteria.map(c=>[c.id,clamp(o.scores?.[c.id])]))}))};
  });
}
export function brief(d) {
  const ranked=rank(d),w=weights(d.criteria);
  return `# ${d.title}\n\n${d.note||''}\n\n## The comparison\n\n${ranked.map((o,i)=>`${i+1}. **${o.name}** — ${o.score.toFixed(1)}/100${o.eligible?'':' (does not meet must-haves)'}`).join('\n')}\n\n## What matters\n\n${d.criteria.map((c,i)=>`- ${c.name}: ${(w[i]*100).toFixed(1)}%${c.must?' · must score at least 5/10':''}`).join('\n')}\n\n## Your ratings (out of 10)\n\n| Criterion | ${d.options.map(o=>o.name.replaceAll('|','/')).join(' | ')} |\n| --- | ${d.options.map(()=>'---').join(' | ')} |\n${d.criteria.map(c=>`| ${c.name.replaceAll('|','/')} | ${d.options.map(o=>clamp(o.scores[c.id])).join(' | ')} |`).join('\n')}\n\nMade with Fork. A weighted comparison reflects your inputs, not an objective recommendation.\n`;
}
