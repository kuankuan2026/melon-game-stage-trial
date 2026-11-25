/* 階段關卡版｜1124b；獨立狀態機。 */
(()=>{
'use strict';
const R=D.rules,F=D.fertilizer,app=document.getElementById('app'),debugEl=document.getElementById('debug');
const q=new URLSearchParams(location.search),debug=q.get('debug')==='1';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),copy=x=>JSON.parse(JSON.stringify(x)),rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[rand(0,a.length-1)],round=x=>Math.round(x*100)/100;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=rand(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={vigor:'生長勢',root:'根系',leaves:'葉面積',pests:'田間蟲害',disease:'田間病害',virus:'田間病毒',weed:'草量',set:'著果率',coins:'金幣',tstem:'果梗 T 字'};
const names={...Object.fromEntries(Object.entries(D.work).map(([k,v])=>[k,v[0]])),...Object.fromEntries(Object.entries(D.bosses).map(([k,v])=>[k,v.name]))};
let s=null,timer=0,paintToken=0,setup={season:R.startSeason,cultivar:0};
const settingsKey=D.saveKey+'.seen';
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let seen=read(settingsKey,{});
function markSeen(key){seen[key]=(seen[key]||0)+1;write(settingsKey,seen)}
function save(){if(s)write(D.saveKey,s)}
function restore(){let v=read(D.saveKey,null);return v?.version===D.version?v:null}
const limit=()=>R.leafLimit[s.training==='double'?1:0];
const area=()=>s.leaves/limit()*100;
const cultivar=()=>D.cultivars[s.cultivar];
const maxVigor=()=>R.vigorByStar[cultivar()[2]];
const capFor=i=>Math.round(maxVigor()*R.caps[i]);
const band=score=>R.scoreBands.find(b=>score>=b[0]);
const snapshot=()=>{let o=copy(s);delete o.checkpoint;return o};
const measure=()=>({vigor:s.vigor,root:s.root,leaves:s.leaves,pests:s.pests,disease:s.disease,virus:s.virus,weed:s.weed,set:s.set,coins:s.coins,tstem:s.tstem?1:0});
const htmlButton=(label,id,disabled=false,secondary=false)=>'<button type="button" data-act="'+esc(id)+'" '+(disabled?'disabled':'')+' class="'+(secondary?'secondary':'')+'">'+esc(label)+'</button>';
const heading=(small,title)=>'<div class="eyebrow">'+esc(small)+'</div><h1>'+esc(title)+'</h1>';
const lesson=text=>'<div class="lesson"><b>冠冠小教室</b><p>'+esc(text)+'</p></div>';
const p=text=>'<p>'+esc(text)+'</p>';
const opt=(name,price,id)=>htmlButton(name+(price?'　◉ '+price:'　免費'),id,price>s.coins,true);
function stopTimer(){clearTimeout(timer);paintToken++}
function schedule(fn,ms){const token=paintToken;timer=setTimeout(()=>{if(token===paintToken)fn()},ms)}
function screen(view){stopTimer();s.view=view;save();render()}
function flag(key){return s.flags[key]}
function pay(n){if(n>s.coins)return false;s.coins-=n;return true}
function note(id,title,before,score=null,detail=''){
 const after=measure(),changes={};
 for(const k of Object.keys(after))if(after[k]!==before[k])changes[k]=round(after[k]-before[k]);
 let impact=Object.entries(changes).reduce((sum,[k,v])=>sum+(k==='coins'||k==='tstem'?0:['pests','disease','virus','weed'].includes(k)?-v:k==='leaves'?v*R.decisionLeafWeight:v),0);
 s.log.push({id,title,stage:s.stage,score,changes,impact:round(impact),detail});save();
 return {changes,impact};
}
function delta(changes){
 for(const [k,v] of Object.entries(changes)){
  if(k==='vigor')s.vigor=round(clamp(s.vigor+v,0,s.cap));
  else if(k==='root')s.root=round(clamp(s.root+v,0,R.fieldMax));
  else if(k==='leaves')s.leaves=clamp(s.leaves+Math.round(v),0,limit());
  else if(k==='set')s.set=round(s.set+v);
  else if(['pests','disease','virus'].includes(k))s[k]=round(clamp(s[k]+v,0,R.fieldMax));
 }
}
function normal(score,effects,mult=1){
 const [,v,leaf]=band(score),d={};
 for(const k of effects){if(k==='leaves'){if(leaf>0){if(!s.broken)s.extraLeaves+=leaf*mult}else d.leaves=leaf*mult}
 else if(k==='tstem')continue;else d[k]=v*mult}
 delta(d);
}
function failure(reason,teaching,id){
 s.fail={reason,teaching,id};if(id)s.log.push({id,title:reason,stage:s.stage,score:null,changes:{},impact:-1000,detail:teaching});
 screen('end');
}
function checkHealth(){
 if(s.view==='end')return true;
 let low=[];if(s.vigor<R.low)low.push('vigor');if(s.root<R.low)low.push('root');
 if(s.planted&&((s.stage>0&&area()<R.low)||s.leaves===0))low.push('leaves');
 if(!low.length)return false;
 const zero=low.some(k=>s[k]<=0);
 if(s.rescueUsed<R.rescueCount){s.rescueKeys=low;s.rescueReturn=s.view;screen('rescue');return true}
 if(zero){failure(s.stage===0?'苗被啃光了':'植株撐不住了','根系、生長勢與健康葉片都要顧，出現警訊時別拖。','C-6');return true}
 return false;
}
function begin(){
 const c=setup.cultivar,season=setup.season,match=D.match[c][season],field=R.fieldByMatch[match];
 const max=R.vigorByStar[D.cultivars[c][2]],cap=Math.round(max*R.caps[0]);
 s={version:D.version,stage:0,season,cultivar:c,soil:R.soil,training:'single',doubleStarted:false,planted:false,vigor:round(cap*R.initialVigor),cap,root:R.root,leaves:0,pests:field[0],disease:field[1],virus:R.virusStart,weed:R.weedStart,coins:R.coins,set:0,tstem:true,halfSet:false,brixCap:D.brixByStar[D.cultivars[c][1]],fruit:null,broken:false,leggy:false,missing:false,snailBite:false,extraLeaves:0,flags:{},log:[],stageResults:[],retryUsed:0,rescueUsed:0,jobLast:null,forms:{},deferred:{pests:0,disease:0},fail:null};
 beginStage();
}
function grow(n){if(s.broken){s.extraLeaves=0;return}delta({leaves:n+s.extraLeaves});s.extraLeaves=0}
function beginStage(){
 const before=measure();s.leggy=false;s.snailBite=false;s.flags={};s.jobUsed=0;s.queue=[...D.stages[s.stage].fixed];s.idx=0;s.triggered=false;s.stageGrowthDone=false;s.task=null;s.spec=null;s.result=null;s.boss=null;s.rescueKeys=null;s.stageStart=measure();s.stagePlant=copy({vigor:s.vigor,root:s.root,leaves:s.leaves,cap:s.cap,pests:s.pests,disease:s.disease,weed:s.weed,virus:s.virus,stage:s.stage,fruit:s.fruit,training:s.training,planted:s.planted,doubleStarted:s.doubleStarted,broken:s.broken});
 delta(s.deferred);s.deferred={pests:0,disease:0};s.weed=clamp(s.weed+R.weedGrowth,R.weedStart,R.weedMax);
 if(s.training==='double')delta({disease:R.doubleDisease});
 if(s.stage===0){s.flags.snail=Math.random()<R.snailChance}
 s.flags.pestAtStart=s.pests>=R.pestTrigger;s.flags.diseaseAtStart=s.disease>=R.diseaseTrigger;
 if(s.stage>0){const days=D.seasons[s.season];grow(s.stage===1?days[3]*R.leafPerDay:0)}
 s.view='period';s.checkpoint=snapshot();save();render();
}
function retry(){
 if(!s.checkpoint||s.retryUsed>=R.retryCount)return;
 const old=s,cp=copy(s.checkpoint),used=s.retryUsed+1;
 s=cp;s.checkpoint=copy(cp);s.retryUsed=used;s.rescueUsed=Math.max(cp.rescueUsed,old.rescueUsed);s.fail=null;s.view='period';save();render();
}
function appendTriggers(){
 if(s.triggered)return;
 s.triggered=true;
 if(s.stage===0){if(s.missing)s.queue.push('1-3');if(s.flags.snail)s.queue.push('1-4')}
 if(s.flags.pestAtStart)s.queue.push('C-1');if(s.flags.diseaseAtStart||s.disease>=R.diseaseTrigger)s.queue.push('C-2');
 if(s.weed>=R.weedTrigger)s.queue.push('C-3');s.queue.push('C-5',D.stages[s.stage].boss);
}
function next(){
 s.spec=null;s.result=null;s.task=null;
 if(s.idx>=s.queue.length)appendTriggers();
 if(s.idx>=s.queue.length){stageEnd();return}
 s.task=s.queue[s.idx++];
 if(s.task==='1-3'&&!s.missing){next();return}
 if(D.bosses[s.task]){bossIntro();return}
 if(!s.task){stageEnd();return}
 s.taskBefore=measure();s.options=null;
 if(['1-1','3-3','5-3'].includes(s.task)){s.fertId=D.work[s.task][1];s.options=makeBags(s.fertId)}
 screen('task');
}
function formFor(key,forms){
 let count=s.forms[key]||0;s.forms[key]=count+1;
 let offset=seen['rotation:'+key]||0;markSeen('rotation:'+key);
 return forms[offset%forms.length];
}
function setMini(mode,title,hint,label,extra=0,job=null){
 s.spec={mode,title,hint,label,extra,job,variant:rand(0,8),difficulty:cultivar()[4],green:R.seasonsGreen[s.season]*R.greenByDifficulty[cultivar()[4]-1],hp:s.boss?.hp||0};
 screen('ready');
}
function taskMini(id,option){
 if(id==='1-2'){
  s.training=option;s.brixCap=D.brixByStar[cultivar()[1]]+(option==='double'?R.doubleBrix:0);s.planted=true;s.leaves=R.seedLeaves;
  setMini('seed/order','定植','依編號把苗放進穴位。','穴位');
 }else if(id==='1-3'){
  if(!pay(R.missingCost))return;setMini('seed/memory','補苗','記住需要補苗的穴位，再照順序點回。','穴位');
 }else if(id==='1-4')setMini('snail/find','抓蝸牛','掀葉找蝸牛，看到牠就點。','蝸牛');
 else if(id==='3-1'){
  let mode=formFor(id,R.vineForms),titles={trail:['引蔓上網','沿亮點由下往上引蔓。','藤位'],timing:['藤夾卡位','藤夾進入綠區時點一下。','藤夾'],order:['由下往上綁','依編號固定瓜藤。','藤位'],find:['找出垂下的藤','點出沒固定的瓜藤。','垂藤'],balance:['扶正瓜藤','左右輕點，讓瓜藤保持在綠區。','瓜藤']},a=titles[mode];setMini('vine/'+mode,...a);
 }else if(id==='3-2'){
  if(option==='clean'){if(!pay(R.pruneClean))return}else delta({virus:R.pruneVirus});
  let mode=formFor(id,R.pruneForms);setMini('prune/'+mode,'摘除側芽',{slice:'滑過低節側芽，避開主蔓。',memory:'記住要剪的位置，依序剪掉。',order:'照編號由下往上剪。',find:'找出漏剪的側芽。'}[mode],'低節側芽');
 }else if(id==='5-1'){
  if(option==='bee'&&!pay(R.beePrice))return;s.flags.bee=option==='bee';simpleResult(option==='bee'?'放蜂':'人工授粉','授粉方式會決定最後一隻 Boss 的玩法。');
 }else if(id==='5-2'){
  let mode=formFor(id,R.tipForms);setMini('fruitTip/'+mode,'結果蔓摘心',mode==='cut'?'看準剪刀位置，精準停在綠區。':'依編號摘掉頂芽。','摘心點');
 }else if(id==='C-1'||id==='C-2'){
  let price=id==='C-1'?R.pestPrices[['enemy','spray','material'].indexOf(option)]:option==='spray'?R.diseasePrice:0;
  if(!pay(price))return;s.flags.control=option;if(option==='spray'&&s.stage===2&&s.flags.bee)s.flags.poison=true;
  if(option==='enemy')setMini('plane/plane','天敵迎戰','拖動巡田飛機，自動射擊蟲王。','蟲王');
  else if(option==='prune')setMini('mildew/find','巡葉摘病葉','找出有白粉病斑的葉片。','病斑');
  else setMini('protect/paint','噴到葉背','掃過每片葉背，不要漏噴。','葉背');
 }else if(id==='C-3'){
  let mode=R.weedForms[clamp(s.weed-1,0,R.weedForms.length-1)];setMini('homeWeed/'+mode,'除草','清除雜草，保留瓜苗。','雜草');
 }else if(id==='C-5'){
  if(s.jobUsed>=R.jobLimit)return;s.jobUsed++;s.jobLast=option;setMini('job/job',StageMini.jobNames[option],'完成打工，依表現領工資。','',0,option);
 }
}
function ignore(){
 const id=s.task;
 if(id==='1-3')delta({vigor:-R.missingPenalty});
 else if(id==='1-4'){
  s.flags.snailIgnored=true;s.snailBite=true;delta({leaves:-R.snailDamage});
  if(Math.random()<R.snailBiteChance&&!s.missing){s.missing=true;s.queue.splice(s.idx,0,'1-3')}
 }else if(id==='C-1'){delta({leaves:-R.ignoredLeafLoss,virus:R.ignoredVirus});s.deferred.pests+=R.ignoredRise}
 else if(id==='C-2'){delta({leaves:-R.ignoredLeafLoss});s.deferred.disease+=R.ignoredRise}
 else if(id==='C-3')delta({pests:s.weed*R.weedPest});
 simpleResult('先不處理',id==='1-4'?'蝸牛夜裡會再出來，下一關要小心。':'這次先略過，影響會記在田間紀錄。');
}
function classify(id,bag){
 const spec=F[id], [n,p,k]=bag.values,a=p/n,b=k/n;
 if(a>=Math.round(spec.ratio[0]*(1-F.tolerance)*100)/100&&a<=Math.round(spec.ratio[0]*(1+F.tolerance)*100)/100&&b>=Math.round(spec.ratio[1]*(1-F.tolerance)*100)/100&&b<=Math.round(spec.ratio[1]*(1+F.tolerance)*100)/100)return 'correct';
 if(id==='FZ-1'?a<=F.classicLimit:a<=F.classicLimit&&b<=F.classicLimit)return 'classic';
 return 'other';
}
function fromRatio(p,k,jitter=0){let n=rand(F.nMin,F.nMax);return {values:[n,Math.max(1,Math.round(n*p*(1+(Math.random()*2-1)*jitter))),Math.max(1,Math.round(n*k*(1+(Math.random()*2-1)*jitter)))]}}
function makeBags(id){
 const spec=F[id],list=[],unique=b=>!list.some(a=>a.values.join()===b.values.join());
 const far=b=>[b.values[1]/b.values[0],b.values[2]/b.values[0]].some((v,i)=>Math.abs(v/spec.ratio[i]-1)>=F.distractorGap);
 for(const kind of ['correct','classic','other','other']){
  let chosen=null;
  for(let tries=0;tries<F.formulaAttempts&&!chosen;tries++){
   let b;if(kind==='correct')b=fromRatio(...spec.ratio,F.jitter);
   else if(kind==='classic')b=fromRatio(F.classicRatio[0]+Math.random()*(F.classicRatio[1]-F.classicRatio[0]),id==='FZ-1'?F.classicK[0]+Math.random()*(F.classicK[1]-F.classicK[0]):F.classicRatio[0]+Math.random()*(F.classicRatio[1]-F.classicRatio[0]));
   else if(tries<F.formulaAttempts/2){let [period,p,k]=pick(F.allRatios);b=fromRatio(p,k);b.period=period}
   else b={values:[rand(F.nMin,F.nMax),rand(...F.randomP),rand(...F.randomK)]};
   if(classify(id,b)===kind&&unique(b)&&(kind!=='other'||far(b)))chosen=b;
  }
  if(!chosen){for(let n=F.nMin;n<=F.nMax&&!chosen;n++)for(let p=F.randomP[0];p<=F.randomP[1]&&!chosen;p++)for(let k=F.randomK[0];k<=F.randomK[1]&&!chosen;k++){let b={values:[n,p,k]};if(classify(id,b)===kind&&unique(b)&&(kind!=='other'||far(b)))chosen=b}}
  if(!chosen)throw Error('無法產生 '+id+' 肥料 '+kind);
  list.push(chosen);
 }
 return shuffle(list);
}
function chooseBag(i){
 const id=s.fertId,spec=F[id];
 if(i<0){s.flags[id]='skip';simpleResult('這次不施肥',spec.lesson);return}
 if(!pay(F.price))return;
 s.bag=s.options[i];s.flags[id]=classify(id,s.bag);setMini(spec.mode,spec.title,spec.hint,id==='FZ-1'?'畦土':id==='FZ-4'?'肥量':'肥料');
}
function fold(){
 if(s.broken||Math.random()>=R.breakChance)return '';
 const loss=pick(R.breakLoss);s.broken=true;delta({leaves:-Math.round(s.leaves*loss)});return '藤折斷了，掉葉 '+Math.round(loss*100)+'%，之後不再長新葉。';
}
function simpleResult(title,detail){
 const record=note(s.task,title,s.taskBefore,null,detail);
 s.result={title,detail,score:null,changes:record.changes};screen('feedback');
}
function settleScore(score){
 if(s.view!=='ready'&&s.view!=='playing')return;
 const id=s.task;let detail='',title=names[id]||s.spec.title;
 if(s.fertId&&['1-1','3-3','5-3'].includes(id)){
  const spec=F[s.fertId],type=s.flags[s.fertId];
  if(type==='correct'){let mult=F.multipliers.find(b=>score>=b[0])[1];delta(Object.fromEntries(Object.entries(spec.gain).map(([k,v])=>[k,v*mult])));detail='配方正確，效果 ×'+mult+'。'}
  else if(type==='classic'){delta(spec.classic);if(s.fertId==='FZ-3')s.leggy=true;detail='經典錯誤：'+(s.fertId==='FZ-1'?'磷太少，根長不好。':s.fertId==='FZ-3'?'氮太多，徒長。':'氮太多，花容易掉。')}
  else detail=s.bag.period?'這是'+s.bag.period+'的配方，這時候下效果不明顯。':'這時候下效果不明顯。';
  detail+=' '+spec.lesson;
 }else if(id==='1-2'){
  normal(score,['root']);s.flags.plantScore=score;
  if(score<R.lowScore){s.missing=true;detail='缺了一株苗，等等記得補苗。'}
 }else if(id==='1-3'){normal(score,['vigor']);s.missing=false}
 else if(id==='1-4'){normal(score,['root']);s.flags.snailCaught=true}
 else if(id==='3-1'){normal(score,['vigor']);if(score<R.lowScore)detail=fold()}
 else if(id==='3-2'){normal(score,['leaves']);s.flags.pruneScore=score;if(score<R.pruneMissBelow){delta({disease:R.pruneDisease});detail='側芽漏剪，枝葉太密。'}}
 else if(id==='5-2'){
  normal(score,['set']);s.flags.tipScore=score;
  if(score<R.lowScore){const roll=Math.random();if(roll<R.tipBad[0]){note(id,title,s.taskBefore,score,'結果蔓剪光');failure('結果蔓剪光了','摘心不是把整條結果蔓剪掉，葉片還要留著。',id);return}
   if(roll<R.tipBad[0]+R.tipBad[1]){s.halfSet=true;detail='結果蔓受傷，著果率減半。'}else{s.tstem=false;detail='失去 T 字果梗。'}}
 }else if(id==='C-1'||id==='C-2'){
  let amount=R.control*score/100*(s.flags.control==='material'?R.materialRate:1);delta({[id==='C-1'?'pests':'disease']:-amount});
  detail='防治完成度 '+score+'%。';
 }else if(id==='C-3')s.weed=score<R.lowScore?Math.max(R.weedStart,s.weed-1):R.weedStart;
 else if(id==='C-5'){const pay=Math.round(R.jobMax*score/100);s.coins+=pay;detail='領到 '+pay+' 金幣。'}
 else if(D.bosses[id]){
  normal(score,D.bosses[id].effects,R.bossMultiplier);
  if(id==='B-3'&&score<R.lowScore){delta({set:-R.vineBossSetLoss});detail='授粉期著果率下降。 '+fold()}
  s.boss.score=score;s.boss.remaining=score>=R.bossWin?0:Math.round(s.boss.hp*(1-score/100));
  if(id==='B-5'){
   let base=R.setBands.find(b=>score>=b[0])[1];
   s.setChance=clamp((base+s.set+(s.flags.bee?R.beeBonus:0)+(s.training==='double'?R.doubleSetBonus:0))*(s.halfSet?R.setHalf:1),0,100);
   s.fruit=Math.random()*100<s.setChance;
   detail=s.fruit?'花坐住了！':'花掉了，瓜沒坐住。';
  }
  const record=note(id,title,s.taskBefore,score,detail);s.result={title,score,detail,changes:record.changes};screen('bossOutcome');return;
 }
 const record=note(id,title,s.taskBefore,score,detail);s.result={title,score,detail:detail||'這一步做完了，看看植株的變化。',changes:record.changes};screen('feedback');
}
function bossIntro(){
 const id=s.task,b=D.bosses[id],reasons=[];s.taskBefore=measure();
 const add=(text,n)=>reasons.push({text,n});
 if(id==='B-1'){if(s.flags.snailCaught)add('你抓過蝸牛',b.hp.caught);if(s.flags.plantScore >= R.goodScore)add('定植表現很好',b.hp.plant);if(s.flags.snailIgnored)add('蝸牛出現卻沒抓',b.hp.ignored)}
 if(id==='B-3'){if(s.flags.pruneScore >= R.goodScore)add('摘除側芽表現很好',b.hp.prune);if(s.flags['FZ-3']==='classic')add('高氮肥造成徒長',b.hp.classic);if(s.flags['FZ-3']==='correct')add('施肥配方正確',b.hp.correct)}
 if(id==='B-5'){if(s.flags.tipScore >= R.goodScore)add('結果蔓摘心表現很好',b.hp.tip);if(s.flags['FZ-4']==='classic')add('高氮肥增加落花',b.hp.classic);if(s.flags['FZ-4']==='correct')add('施肥配方正確',b.hp.correct)}
 const hp=clamp(R.bossBase+reasons.reduce((a,b)=>a+b.n,0),R.bossMin,R.bossMax),repeat=!!seen[id];markSeen(id);
 s.boss={id,hp,reasons,repeat,score:null,remaining:hp};screen('bossIntro');
}
function startBoss(){
 const b=D.bosses[s.task],bee=s.task==='B-5'&&s.flags.bee;
 const mode=bee?b.beeMode:b.mode,hint=s.task==='B-1'?'拖動手電筒，照出蝸牛。':s.task==='B-3'?'剪掉側芽，保留第 11～15 節結果枝。':bee?'拖動蜜蜂接住花粉，避開農藥滴。':'拖動花粉沿路線送到雌花，不要碰邊。';
 setMini(mode,b.name,hint,'側芽',s.task==='B-1'&&s.flags.snailIgnored?R.snailMiss:bee&&s.flags.poison?R.beePoison:0);
}
function afterFeedback(){
 if(checkHealth())return;
 next();
}
function afterBoss(){
 if(checkHealth())return;
 stageEnd();
}
function stageEnd(){
 if(!s.stageGrowthDone){s.stageGrowthDone=true;
 if(s.stage===0){
  grow(Math.max(0,R.seedlingLeaves-R.seedLeaves));if(s.training==='double'){s.doubleStarted=true;delta({disease:R.doubleDisease})}
 }else if(s.stage===1){grow(D.seasons[s.season][4]*R.leafPerDay)}
 }
 s.view='stageEndPending';if(checkHealth())return;
 const stage=D.stages[s.stage],before=s.stageStart,after=measure(),changes={};for(const k in after)if(after[k]!==before[k])changes[k]=round(after[k]-before[k]);
 s.stageResults.push({name:stage.name,changes});
 s.cap=capFor(stage.cap);if(s.stage===1){s.flags.autoTop=R.autoTopScore}
 screen('stageEnd');
}
function advanceStage(){
 if(s.stage===2){
  if(!s.fruit){failure('瓜沒坐住','花期避免氮太多，保留結果蔓，授粉工作要做好。','5-B');return}
  screen('end');return;
 }
 if(s.stage===1){s.log.push({id:'4-B',title:'摘心期自動帶過',stage:s.stage,score:R.autoTopScore,changes:{},impact:0,detail:'自動 '+R.autoTopScore+' 分，生長勢上限提升至 '+Math.round(R.caps[3]*100)+'%'});s.cap=capFor(3)}s.stage++;beginStage();
}
function rescue(yes){
 const before=measure();if(yes&&s.coins<R.rescuePrice)return;s.rescueUsed++;
 if(yes){if(!pay(R.rescuePrice))return;for(const k of s.rescueKeys){if(k==='leaves')s.leaves=clamp(Math.ceil(limit()*R.rescueTo/100),0,limit());else s[k]=k==='vigor'?Math.min(s.cap,R.rescueTo):R.rescueTo}}
 note('C-6',yes?'緊急補救':'放棄補救',before,null);
 const ret=s.rescueReturn;s.rescueKeys=null;s.rescueReturn=null;
 if(s.vigor<=0||s.root<=0||(s.planted&&s.leaves<=0)){failure(s.stage===0?'苗被啃光了':'植株撐不住了','出現警訊時要及時補救。','C-6');return}
 if(ret==='bossResult'||ret==='stageEndPending')stageEnd();else if(ret==='period'){screen('period')}else next();
}
function bars(){
 const data=[['生長勢',s.vigor,s.cap],['根系',s.root,R.fieldMax],['葉面積',s.leaves,limit()]];
 return '<div class="bars">'+data.map(([n,v,max])=>'<div><span>'+n+'</span><div class="track"><i style="width:'+clamp(v/max*100,0,100)+'%"></i></div>'+(debug?'<small>'+round(v)+'/'+max+'</small>':'')+'</div>').join('')+'</div>';
}
function header(){return '<header><span>植日生・三關試玩</span><b>◉ '+s.coins+'</b></header><div class="steps">'+D.stages.map((v,i)=>'<span class="'+(i===s.stage?'current':i<s.stage?'done':'')+'">'+(i+1)+' '+v.name+'</span>').join('')+'</div>'}
function field(){return StageArt.plant(s)+bars()}
function changes(c,includeHidden=false,precise=false){
 const keys=includeHidden?Object.keys(labels):['vigor','root','leaves'];
 return '<div class="changes">'+keys.filter(k=>k!=='coins'&&k!=='tstem').map(k=>{let v=c[k]||0,positive=['pests','disease','virus','weed'].includes(k)?v<0:v>0;return '<div><span>'+labels[k]+'</span><b class="'+(v===0?'same':positive?'up':'down')+'">'+(v>0?'↑':v<0?'↓':'—')+(precise&&v?' '+(v>0?'+':'')+v:'')+'</b></div>'}).join('')+'</div>'
}
function ranked(count,stageOnly=false){
 const log=s.log.filter(x=>!stageOnly||x.stage===s.stage);
 const best=log.filter(x=>x.impact>0).sort((a,b)=>b.impact-a.impact).slice(0,count),worst=log.filter(x=>x.impact<0).sort((a,b)=>a.impact-b.impact).slice(0,count);
 const list=(a)=>a.length?a.map(x=>'<div class="decision"><b>'+esc(x.title)+'</b><small>'+esc(x.score==null?'':x.score+' 分　')+esc(x.detail||Object.entries(x.changes).map(([k,v])=>labels[k]+' '+(v>0?'↑':'↓')).join('、'))+'</small></div>').join(''):p('本階段無明顯變化');
 return '<h3>幫最多的決定</h3>'+list(best)+'<h3>傷最大的決定</h3>'+list(worst);
}
function taskView(){
 const id=s.task,h=heading(D.stages[s.stage].name+'・田間工作',names[id]),buttons=(...a)=>'<div class="choices">'+a.join('')+'</div>';
 if(['1-1','3-3','5-3'].includes(id)){
  return h+p('選一袋肥料。看看三種成分的比例，選好再開始施肥。')+'<div class="fertGrid">'+s.options.map((b,i)=>'<button class="fertBag" data-act="bag:'+i+'" '+(s.coins<F.price?'disabled':'')+'><svg viewBox="0 0 120 105" aria-hidden="true"><path d="M26 6H94L89 18Q108 56 102 98H18Q12 56 31 18Z" fill="#e8dfc3" stroke="#a09066" stroke-width="2"/><rect x="20" y="33" width="80" height="45" rx="5" fill="#faf7ed"/><text x="60" y="46" font-size="10" text-anchor="middle" fill="#4a593d">N-P-K</text><text x="60" y="66" font-size="17" font-weight="bold" text-anchor="middle" fill="#374c37">'+b.values.join('-')+'</text></svg>'+b.values.map((v,j)=>'<span class="npk"><small>'+['N','P','K'][j]+'</small><i style="width:'+v/Math.max(...b.values)*80+'%;background:'+['#568b62','#bf9146','#638db3'][j]+'"></i></span>').join('')+'<small>◉ '+F.price+'</small></button>').join('')+'</div>'+htmlButton('這次不施肥','bag:-1',false,true);
 }
 if(id==='1-2')return h+p('定植前先選整枝方式。')+buttons(opt('單蔓整枝',0,'option:single'),opt('雙蔓整枝',0,'option:double'));
 if(id==='1-3')return h+p('畦上有一個空穴。')+buttons(opt('補苗',R.missingCost,'option:yes'),htmlButton('不補','ignore',false,true));
 if(id==='1-4')return h+p('嫩葉底下有蝸牛。')+buttons(opt('抓蝸牛',0,'option:yes'),htmlButton('先不管','ignore',false,true));
 if(id==='3-2')return h+p('剪側芽前，剪刀要不要先消毒？')+buttons(opt('消毒剪刀',R.pruneClean,'option:clean'),opt('直接剪',0,'option:dirty'));
 if(id==='5-1')return h+p('花開了，你打算怎麼授粉？')+buttons(opt('人工授粉',0,'option:hand'),opt('放蜂',R.beePrice,'option:bee'));
 if(id==='C-1')return h+p('葉背有蟲，怎麼處理？')+buttons(opt('放天敵',R.pestPrices[0],'option:enemy'),opt('用藥',R.pestPrices[1],'option:spray'),opt('非農藥資材',R.pestPrices[2],'option:material'),htmlButton('先不管','ignore',false,true));
 if(id==='C-2')return h+p('葉面出現白粉病斑。')+buttons(opt('摘病葉、通風',0,'option:prune'),opt('用藥',R.diseasePrice,'option:spray'),htmlButton('先不管','ignore',false,true));
 if(id==='C-3')return h+p('畦邊的草開始茂盛了。')+buttons(opt('除草',0,'option:yes'),htmlButton('先不管','ignore',false,true));
 if(id==='C-5'){
  if(!s.jobOffer){let options=R.jobIds.filter(x=>x!==s.jobLast);s.jobOffer=pick(options);save()}
  return h+p('鄰田剛好缺人，這個階段可打工一次。')+buttons(htmlButton(StageMini.jobNames[s.jobOffer],'option:'+s.jobOffer),htmlButton('這次不打工','ignore',false,true));
 }
 return h+p(D.work[id][2]||'準備好就開始吧。')+htmlButton('開始工作','option:yes');
}
function bossView(outcome=false){
 const b=D.bosses[s.boss.id],hp=s.boss.hp,score=s.boss.score;
 return '<section class="bossScene '+(outcome?(score>=R.bossWin?'defeated':'escaped'):'arrival')+'"><div class="warning">'+(outcome?(score>=R.bossPerfect?'完美擊破！':score>=R.bossWin?'擊敗！':'被牠跑了…'):'BOSS 出現')+'</div>'+StageArt.boss(s.boss.id)+'<h2>'+esc(b.name)+'</h2><div class="dialog">'+esc(outcome?(score>=R.bossWin?b.win:b.lose):b.intro)+'</div><div class="hp"><i style="width:'+(outcome?s.boss.remaining/hp:hp/R.bossMax)*100+'%"></i></div><b>'+(outcome?s.boss.remaining:hp)+' HP</b>'+(!outcome?'<div class="hpReasons">'+s.boss.reasons.map(x=>'<p>'+esc(x.text)+'：'+(x.n>0?'+':'')+x.n+'</p>').join('')+'</div>':'')+'</section>'+htmlButton(outcome?'跳過演出':'開始戰鬥',outcome?'bossResult':'bossStart');
}
function render(){
 stopTimer();
 if(!s){
  let old=restore();app.innerHTML=heading('植日生｜手機小遊戲','今天來種瓜')+p('這次先挑戰幼苗、抽藤、授粉三個階段。')+'<div class="period"><b>定植時段</b><p>'+esc(D.seasons[setup.season][0])+'</p></div>'+(debug?'<label>測試季節<select id="season">'+D.seasons.map((a,i)=>'<option value="'+i+'" '+(i===setup.season?'selected':'')+'>'+esc(a[0])+'</option>').join('')+'</select></label>':'')+'<h3>挑一個品種</h3><div class="varietyGrid">'+D.cultivars.map((c,i)=>'<button data-act="variety:'+i+'" class="secondary '+(setup.cultivar===i?'selected':'')+'">'+esc(c[0])+'</button>').join('')+'</div>'+htmlButton('開始種瓜','begin')+(old?htmlButton('繼續上次試玩','resume',false,true):'');
  document.getElementById('season')?.addEventListener('change',e=>{setup.season=+e.target.value;render()});return;
 }
 let h=header(),stage=D.stages[s.stage];
 if(s.view==='period')h+=heading('第 '+(s.stage+1)+' 關',stage.name)+field()+p(stage.text)+htmlButton('開始這個階段','next');
 else if(s.view==='task')h+=field()+taskView();
 else if(s.view==='ready'||s.view==='playing'){
  let spec=s.spec,repeat=seen['help:'+spec.mode];
  h+=heading(stage.name,spec.title)+(repeat?p(spec.hint.split('。')[0]+'。'):p(spec.hint))+htmlButton('開始','play')+'<div id="miniHost"></div>';
 }else if(s.view==='feedback'){
  h+=heading('工作結算',s.result.title)+(s.result.score!=null?'<div class="score">'+s.result.score+' 分</div>':'')+changes(s.result.changes)+lesson(s.result.detail)+htmlButton('繼續','afterFeedback');
  schedule(afterFeedback,R.feedback);
 }else if(s.view==='bossIntro'){
  h+=bossView();schedule(()=>{app.querySelector('.arrival')?.classList.add('settled')},s.boss.repeat?R.repeatIntro:R.intro);
 }else if(s.view==='bossOutcome'){h+=bossView(true);schedule(()=>screen('bossResult'),R.defeat)}
 else if(s.view==='bossResult'){
  const b=D.bosses[s.boss.id];h+=heading('Boss 結算',b.name)+'<div class="score">'+s.boss.score+' 分</div>'+p((s.boss.score>=R.bossPerfect?'完美擊破！':s.boss.score>=R.bossWin?'擊敗！':'被牠跑了…')+'　剩 '+s.boss.remaining+' HP')+changes(s.result.changes)+lesson(b.lesson)+(s.task==='B-5'?p(s.fruit?'有坐果！':'花掉了，沒有坐果。'):'')+htmlButton('階段結算','afterBoss');
 }else if(s.view==='rescue'){
  h+=heading('植株警訊','瓜苗撐不住了')+field()+p(s.rescueKeys.map(k=>labels[k]).join('、')+'太低，這局還有一次補救機會。')+htmlButton('補救　◉ '+R.rescuePrice,'rescueYes',s.coins<R.rescuePrice)+htmlButton('先不補救','rescueNo',false,true);
 }else if(s.view==='stageEnd'){
  const c=s.stageResults.at(-1).changes;
  h+=heading('階段結算',stage.name+'・完成')+'<div class="compare"><div><small>階段開始</small>'+StageArt.plant(s.stagePlant)+'</div><div><small>現在</small>'+StageArt.plant(s)+'</div></div>'+bars()+changes(c)+ranked(1,true)+p(s.vigor>=s.cap*.7?'長勢不錯，接著顧好下一段。':'瓜苗還在努力，下一段要更用心。')+'<div class="capNotice">生長勢上限提升</div>'+htmlButton(s.stage===2?'看試玩結果':D.stages[s.stage+1].name+'・下一關','advance');
 }else if(s.view==='end'){
  const c={};for(const r of s.stageResults)for(const [k,v] of Object.entries(r.changes))c[k]=(c[k]||0)+v;if(s.fail&&s.stageResults.length<=s.stage){for(const [k,v] of Object.entries(measure()))c[k]=(c[k]||0)+v-s.stageStart[k];}
  h+=heading(s.fail?'本局結束':'試玩完成',s.fail?s.fail.reason:'瓜坐住了！')+field()+(s.fail?lesson(s.fail.teaching):p('你已經通過幼苗、抽藤、授粉三關。'))+p('著果：'+(s.fruit===true?'成功':s.fruit===false?'未著果':'尚未進入著果判定'))+changes(c,false)+ranked(2)+p('正式版敬請期待')+(s.fail?htmlButton('從該階段開頭重來','retry',s.retryUsed>=R.retryCount||!s.checkpoint):'')+htmlButton('重新開始','home',false,true);
 }
 app.innerHTML=h;renderDebug();
}
function renderDebug(){
 if(!debug||!s){debugEl.innerHTML='';return}
 const open=debugEl.querySelector('details')?.open;
 debugEl.innerHTML='<details '+(open?'open':'')+'><summary>debug｜全部數值與來源代號</summary><button data-act="download">下載本局 JSON</button><pre>'+esc(JSON.stringify({...s,checkpoint:undefined,leafArea:area(),cultivarName:cultivar()[0],match:D.match[s.cultivar][s.season]},null,2))+'</pre></details>';
}
function play(){
 if(!s.spec)return;markSeen('help:'+s.spec.mode);s.view='playing';save();
 app.innerHTML=header()+heading(D.stages[s.stage].name,s.spec.title)+'<div id="miniHost"></div>';
 StageMini.start(document.getElementById('miniHost'),s.spec,settleScore);
}
function action(id){
 const [cmd,arg]=id.split(':');
 if(cmd==='variety'){setup.cultivar=+arg;render();return}
 if(cmd==='begin'){begin();return}
 if(cmd==='resume'){s=restore();if(s.view==='playing')s.view='ready';render();return}
 if(cmd==='home'){StageMini.stop();stopTimer();s=null;write(D.saveKey,null);render();return}
 if(!s)return;
 if(cmd==='next'){if(s.view==='period'&&!checkHealth())next();}else if(cmd==='option')taskMini(s.task,arg);else if(cmd==='bag')chooseBag(+arg);else if(cmd==='ignore')ignore();
 else if(cmd==='play')play();else if(cmd==='afterFeedback'&&s.view==='feedback')afterFeedback();else if(cmd==='bossStart')startBoss();else if(cmd==='bossResult')screen('bossResult');
 else if(cmd==='afterBoss'&&s.view==='bossResult')afterBoss();else if(cmd==='advance'){s.jobOffer=null;advanceStage()}else if(cmd==='retry')retry();
 else if(cmd==='rescueYes')rescue(true);else if(cmd==='rescueNo')rescue(false);
 else if(cmd==='download'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));a.href=url;a.download='stage-trial-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled&&!b.closest('#miniHost'))action(b.dataset.act)});
if(debug){const c=q.get('cultivar'),season=q.get('season');if(c!==null){const n=D.cultivars.findIndex(x=>x[0]===c);setup.cultivar=n>=0?n:clamp(Number(c)||0,0,D.cultivars.length-1)}if(season!==null){let i=D.seasons.findIndex(x=>x[0]===season);setup.season=i>=0?i:clamp(Number(season)||0,0,D.seasons.length-1)}}
if(debug)globalThis.StageTest={makeBags,classify,getState:()=>copy(s),action,settleScore,begin,setup,restore};
render();
})();