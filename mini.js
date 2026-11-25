/* stage-trial｜沿用 daily/game.js @9050f65 的 arc 操作及 M-1/2/6～11 題庫；新增 flash/cut/wire/catch。 */
const StageMini=(()=>{
 const cfg=globalThis.StageData, rules=cfg.rules;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const sequence=()=>shuffle(Array.from({length:9},(_,i)=>i));
 let g=null, frame=0, held=false,lastCell=-1,done=null, host=null, state={step:'arc',daily:{}}, miniTimer=0, jobCache={};
 const T={targets:rules.jobTargets,decoys:rules.jobDecoys}; // M-1、M-2 既有原型目標
 // 以下為舊打工模組的局部相容介面，不讀寫逐日存檔
 const D={job:{seconds:rules.seconds,penalty:rules.jobPenalty,maximum:rules.jobMax},jobs:[
 {id:'M-1',name:'鋤草',hint:'往上滑拔草，避開瓜苗。'},
 {id:'M-2',name:'幫鄰居採小黃瓜',hint:'採剛好的瓜與過老瓜，太小的留著。'},
 ...[[6,'市場理貨','照出貨單找蔬果。',5],[7,'蔬果箱打包','記住訂單和數量。',3],[8,'幫鄰田巡田','記住有病斑的位置。',4],[9,'市場收錢找零','算出該找多少錢。',5],[10,'數瓜入庫','看清楚瓜籃的數量。',4],[11,'蔬果箱裝箱拼圖','旋轉貨品並放入箱格。',1]].map(([n,name,hint,questions])=>({id:'M-'+n,name,hint,questions}))]};
 const daily={market:{items:['小黃瓜','櫛瓜','甜椒','番茄','洋香瓜','南瓜'],seedQuestions:[]}};
 const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const head=(a,b)=>'<small>'+escapeHTML(a)+'</small><h2>'+escapeHTML(b)+'</h2>';
 const note=(s,t='')=>'<p>'+escapeHTML(t?t+'：'+s:s)+'</p>';
 const action=(s,id)=>'<button data-act="'+escapeHTML(id)+'">'+escapeHTML(s)+'</button>';
 const dice=tag=>{if(!(tag in jobCache))jobCache[tag]=Math.random();return jobCache[tag]};
 const persist=()=>{};
 const cultivar=()=>({id:''});
 const arcGoal=x=>x.goal;
 const rev={duration:rules.seconds};
function arcTarget(g){
  return g.sequence[(g.stage+g.variant)%9];
}
function arcTime(g){return Math.max(0,(Date.now()-g.start)/1000);}
function oscillate(g,time){
  return .5+.34*Math.sin(time*(1.65+(g.variant%4)*.18)+g.variant);
}
function waterTarget(g,t){
  return g.mode==='depth'?.53+.19*Math.sin(t*1.15+g.variant):.32+.14*(g.context.value??1)+.05*Math.sin(t+g.variant);
}
function targetWidth(g){return g.green;}
function bossX(g,t){
  const type=Number(g.context.id?.slice(-1))||0;
  return .5+(type===0?.32*Math.sin(t*2.4):type===1?.19*Math.sin(t*.8):.3*Math.sin(t*1.5));
}
function flyFrame(g,t,dt){
  const bx=bossX(g,t),type=Number(g.context.id.slice(-1));
  if(t>=g.nextShot){g.shots.push([g.player[0],g.player[1]-.05]);g.nextShot=t+.22;}
  if(t>=g.nextHazard){
    const aim=(g.player[0]-bx)*.29;
    for(const dx of (type===0?[aim]:type===1?[-.12,.12]:[-.19,aim,.19]))g.hazards.push([bx,.22,dx]);
    g.nextHazard=t+(type===0?.52:type===1?.74:.95);
  }
  for(const s of g.shots){s[1]-=dt*.94;if(s[1]<.24&&s[1]>.09&&Math.abs(s[0]-bx)<.105){g.hit++;s[1]=-1;}}
  g.shots=g.shots.filter(s=>s[1]>0);
  for(const b of g.hazards){b[0]+=b[2]*dt;b[1]+=dt*.47;if(Math.hypot(b[0]-g.player[0],b[1]-g.player[1])<.06){g.miss++;b[1]=2;}}
  g.hazards=g.hazards.filter(b=>b[1]<1.05);
}
function cellFor(x,y){return clamp(Math.floor(y/105),0,2)*3+clamp(Math.floor(x/120),0,2);}
function baseCellText(g,i,t){
  const done=g.marks.includes(i),goal=arcGoal(g),pos=g.sequence.indexOf(i),right=arcTarget(g);
  switch(g.mode){
    case 'paint':return done?'已撒':'畦土';
    case 'slice':case 'avoid':return done?'剪好了':pos<Math.min(goal,5)?g.label:(pos%2?'留果枝':'主蔓');
    case 'memory':return g.marks.includes(i)?'完成':t<rules.memoryShow&&pos<4?'記 '+(pos+1):g.label+' '+(i+1);
    case 'order':case 'trail':return done?'完成':pos<goal?(g.mode==='order'?'順序 '+(pos+1):(pos===g.stage?'◎ ':'○ ')+(pos+1)):'·';
    case 'find':return i===right?g.label:({select:'端正幼果',poll:'未開花苞',tie:'已固定',water:'正常水滴',seal:'壓好的膜',mildew:'健康葉',prune:'主蔓'})[g.kind]||'正常';
    case 'node':return i===g.sequence[0]?'第 25 節':'第 '+(16+pos)+' 節';
    case 'pipes':return i>=3&&i<6?((g.values[i-3]+g.sequence[i])%4===0?'━':'┃┏┓'[((g.values[i-3]+g.sequence[i])%4)-1]):i===0?'入口 ↘':i===8?'↘ 出口':'田埂';
    case 'portion':return i===0?'半勺':i===1?'整勺':i>=3&&i<=5?g.values[i-3]+'／'+(i-1)+' 份':'';
    case 'swap':return i<6?(g.marks.includes(i%3)?'已交換':i<3?'表土 '+(i+1):'底土 '+(i-2)):'';
    case 'scale':return i<3?'＋'+[1,2,4][i]+' 勺':i===4?g.values[0]+'／'+(5+g.stage+g.variant%3):i===6?'重秤':i===8?'送出':'';
    case 'clean':return i===8?'開水閘':g.marks.includes(i)?'已清':g.sequence.filter(k=>k!==8).slice(0,3).includes(i)?'殘株':'瓜苗';
    case 'ridge':return [0,2].includes(i)?'堆畦 '+g.values[i===0?0:1]+'/2':i===4?'挖通溝槽':'畦溝';
    case 'calendar':return i>=3&&i<6?dateAt(state.days+harvestOptions()[i-3]).slice(5):'';
    case 'guess':return i>=3&&i<6?guessOptions(g)[i-3]+' kg':'';
    case 'guard':return i===right?'害蟲':i===(right+4)%9?'天敵':i===4?'洋香瓜':'';
    default:return '';
  }
}
function drawFieldIcon(c,g,word,x,y){
  c.save();c.translate(x,y);c.lineWidth=2.7;c.lineCap='round';c.strokeStyle='#365a44';c.fillStyle='#829d64';
  const line=(...p)=>{c.beginPath();c.moveTo(p[0],p[1]);for(let k=2;k<p.length;k+=2)c.lineTo(p[k],p[k+1]);c.stroke();};
  const oval=(x,y,rx,ry,angle=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fill();c.stroke();};
  if(g.kind==='prune'||g.kind==='mildew'||g.kind==='weed'||g.kind==='top'||g.kind==='tie'){
    line(-8,17,0,-15);if(!/完成|剪好了/.test(word)){line(-4,6,8,-2);oval(12,-5,12,5,-.5);}
    if(/主蔓|留果/.test(word)){oval(-9,-3,8,4,.5);if(word==='留果枝'){c.fillStyle='#c6a34d';oval(10,5,5,6);}}
    if(word.includes('病斑')){c.fillStyle='#f6f4e6';oval(10,-6,3,2);oval(16,-8,2,1);}
  }else if(g.kind==='select'){
    c.fillStyle='#96ad6f';oval(0,2,14,18);line(0,-15,3,-21,9,-22);
    if(word==='擦傷幼果'){c.strokeStyle='#955e38';line(-9,4,-2,1,2,4,8,0);}
  }else if(['paint','clean','swap','ridge','portion','memory','find','scale'].includes(g.mode)){
    c.fillStyle=word.includes('已')?'#b6b67e':'#c9ae79';oval(0,5,24,9);c.strokeStyle='#926f42';line(-14,5,13,3);
    if(g.mode==='paint'&&word==='已撒'){c.fillStyle='#fff9e1';for(let k=0;k<9;k++)c.fillRect(-16+k*4,1+(k%3)*3,3,2);}
    if(g.mode==='clean'&&!word.includes('清')){c.strokeStyle=word==='殘株'?'#996239':'#647f45';line(-7,1,-3,-10,7,-14);}
  }
  c.restore();
}
function drawArc(g,t){
  const canvas=document.getElementById('farmCanvas');if(!canvas)return;
  const c=canvas.getContext('2d'),w=360,h=320;
  c.fillStyle='#edf0d9';c.fillRect(0,0,w,h);
  function label(msg,x,y,size=18,col='#234f42'){c.fillStyle=col;c.font='bold '+size+'px sans-serif';c.textAlign='center';c.fillText(msg,x,y);}
  function dot(x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
  if(g.mode==='guard'){
    label('瓜',180,169,31);for(let i=0;i<4;i++){const [x,y]=guardPosition(i,t);const ally=(i+g.stage)%4===0;dot(x*w,y*h,23,ally?'#89bba4':'#df997a');label(ally?'天敵':'害蟲',x*w,y*h+5,14);}
    return;
  }
  if(g.mode==='plane'){
    c.fillStyle='#224c45';c.fillRect(0,0,w,h);
    for(let i=0;i<17;i++)dot((i*83)%w,(i*67+t*28)%h,2,'#90b592');
    const x=bossX(g,t)*w;label(g.title,x,30,16,'#fff4cd');label(['薊','蚜','粉'][Number(g.context.id.slice(-1))],x,69,40,'#ffbe77');
    for(let i=0;i<6;i++){const side=i%2?1:-1;c.beginPath();c.moveTo(x+side*12,49+Math.floor(i/2)*6);c.lineTo(x+side*(24+4*Math.sin(t*7)),40+Math.floor(i/2)*11);c.strokeStyle='#ffc18a';c.lineWidth=3;c.stroke();}
    for(const [x,y] of g.shots)dot(x*w,y*h,4,'#ffe896');
    for(const [x,y] of g.hazards){dot(x*w,y*h,8,'#ff9883');if(g.context.id==='pest1')label('蚜',x*w,y*h+5,12,'#533623');if(g.context.id==='pest2'){dot(x*w-5,y*h-4,3,'#fff');dot(x*w+5,y*h-4,3,'#fff');}}
    const [px,py]=g.player;label('✈',px*w,py*h+8,35,'#fff');return;
  }
  if(['balance','net','depth','timing'].includes(g.mode)){
    const timing=g.mode==='timing',target=timing?.5:waterTarget(g,t),width=timing?rules.timingWidth:targetWidth(g);
    if(g.mode==='depth'){
      c.fillStyle='#b99666';c.fillRect(0,51,360,79);c.strokeStyle='#765835';c.lineWidth=9;c.beginPath();
      for(let x=0;x<=360;x+=5){const y=51+78*waterTarget(g,t+(x-180)/135);if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
      c.fillStyle='#4f6253';c.fillRect(176,25,8,26+78*g.knob);label('耕刀',143,40,13);
    }
    if(g.kind==='poll'){for(let i=0;i<5;i++){const a=i*2*Math.PI/5,r=10+(1-Math.abs(oscillate(g,t)-.5)*2)*18;dot(180+r*Math.cos(a),76+r*Math.sin(a),14,'#e8bb4c');}dot(180,76,10,'#996b36');}
    if(g.kind==='net'){
      c.save();c.beginPath();c.ellipse(180,77,44,51,0,0,7);c.clip();c.fillStyle='#94ac65';c.fillRect(120,20,120,115);
      c.strokeStyle='#e0e7b2';c.lineWidth=2;
      for(let i=0;i<2+Math.floor(g.goodTime*2);i++){c.beginPath();c.moveTo(128+i*7,22);c.bezierCurveTo(200-i,83,130+i*4,88,150+i*8,133);c.stroke();}
      c.restore();
    }else if(g.kind!=='poll'&&g.mode!=='depth')label(timing?(Math.abs(oscillate(g,t)-.5)<width?'現在！':g.label):g.label,180,90,29);
    c.fillStyle='#ced5b6';c.fillRect(20,147,320,36);c.fillStyle='#83b98a';c.fillRect(20+320*(target-width),147,640*width,36);
    dot(20+320*(timing?oscillate(g,t):g.knob),165,10,'#9c592d');
    label(timing?'點一下抓時機':g.mode==='depth'?'按住下降　放開上升':'− 減少　　　　　增加 ＋',180,259);
    return;
  }
  for(let i=0;i<9;i++){
    const x=i%3*120,y=Math.floor(i/3)*105,word=cellText(g,i,t);
    c.fillStyle=g.marks.includes(i)?'#c3dcb3':i===g.selected?'#f4d790':'#faf7e9';c.fillRect(x+3,y+3,114,99);
    if(word){drawFieldIcon(c,g,word,x+60,y+34);label(word,x+60,y+76,word.length>6?14:19);}
  }
}

function legacyPlayCell(g,i){
  const pos=g.sequence.indexOf(i),goal=arcGoal(g),t=arcTime(g);
  function mark(){if(g.marks.includes(i))return;g.marks.push(i);g.hit++;g.stage++;}
  switch(g.mode){
    case 'paint':if(g.marks.includes(i))g.miss++;else mark();break;
    case 'slice':case 'avoid':if(pos<Math.min(goal,5))mark();else g.miss++;break;
    case 'memory':if(t<rules.memoryShow)return;
    case 'order':case 'trail':if(pos===g.stage)mark();else if(!g.marks.includes(i))g.miss++;break;
    case 'find':case 'guard':if(i===arcTarget(g)){g.hit++;g.stage++;}else g.miss++;break;
    case 'node':if(pos===0)g.hit++;else g.miss++;break;
    case 'timing':if(t-(g.lastTap??-1)<rules.timingGap)return;g.lastTap=t;g.attempts++;if(Math.abs(oscillate(g,t)-.5)<rules.timingWidth)g.hit++;else g.miss++;break;
    case 'net':case 'balance':g.knob=clamp(g.knob+(i%3===0?-.065:.065),0,1);break;
    case 'pipes':if(i<3||i>5)return;g.values[i-3]++;g.hit=g.values.filter((v,j)=>(v+g.sequence[j+3])%4===0).length;break;
    case 'portion':if(i<2)g.power=i+1;else if(i>=3&&i<=5){const j=i-3;g.values[j]+=g.power;if(g.values[j]>i-1){g.values[j]=0;g.miss++;}g.hit=g.values.filter((v,j)=>v===j+2).length;}break;
    case 'swap':if(i>=6)return;if(i<3){g.selected=i;return;}if(g.selected===i-3&&!g.marks.includes(i-3)){g.marks.push(i-3);g.hit++;}else g.miss++;g.selected=null;break;
    case 'scale':if(i<3)g.values[0]+=[1,2,4][i];else if(i===6)g.values[0]=0;else if(i===8){if(g.values[0]===5+g.stage+g.variant%3){g.hit++;g.stage++;}else g.miss++;g.values[0]=0;}break;
    case 'clean':if(i===8&&g.hit===3)g.hit++;else if(g.sequence.filter(k=>k!==8).slice(0,3).includes(i))mark();else g.miss++;break;
    case 'ridge':if(i===0||i===2){const j=i===0?0:1;if(g.values[j]<2){g.values[j]++;g.hit++;}}else if(i===4&&g.hit===4)g.hit++;else g.miss++;break;
    case 'calendar':case 'guess':if(i<3||i>5)return;g.choice=i-3;g.hit=Number(g.mode==='calendar'?g.choice===1:g.choice===g.sequence[0]%3);finishArc();return;
  }
}

function marketRound(m){
  const j=D.jobs.find(j=>j.id===m.kind),r=m.index,items=daily.market.items;
  const rand=(tag,n)=>Math.floor(dice(m.kind+'／'+r+'／'+tag)*n);
  m.started=Date.now();m.revealed=false;m.picks=[];m.counts=[0,0];m.cells=[];m.rotation=0;
  m.order=Array.from({length:9},(_,i)=>i).sort((a,b)=>dice(m.kind+r+'格'+a)-dice(m.kind+r+'格'+b));
  m.labels=[...items].sort((a,b)=>dice(m.kind+r+a)-dice(m.kind+r+b));
  m.answer=rand('答',m.labels.length);m.delay=0;
  if(m.kind==='M-6')m.prompt='這張單要找「'+m.labels[m.answer]+'」。';
  if(m.kind==='M-7'){m.delay=2000;m.quantities=[1+rand('甲',2+r),1+rand('乙',2+r)];}
  if(m.kind==='M-8'){m.delay=2000;m.targets=m.order.slice(0,2+r);}
  if(m.kind==='M-9'||m.kind==='M-10'){
    const count=m.kind==='M-10'?3+rand('瓜',5+r):0,paid=r<2?100:500,price=1+rand('錢',paid-1);
    const correct=count||paid-price;
    m.labels=[correct,correct+1,correct+3,Math.max(0,correct-1)].sort((a,b)=>dice(r+'選'+a)-dice(r+'選'+b));
    m.answer=m.labels.indexOf(correct);m.prompt=count?'籃子裡有幾顆瓜？':'收 '+paid+' 元，售價 '+price+' 元，要找多少？';
    if(count){m.delay=3000;m.count=count;}
  }
  if(m.kind==='M-12'){
    const q=daily.market.seedQuestions[r];m.photo=q.image;m.labels=q.options;m.answer=q.answer;m.prompt='這是哪種作物的種子？';
  }
  m.limit=m.delay+Math.round(D.job.seconds*1000/j.questions);
}
function marketView(m){
  const j=D.jobs.find(j=>j.id===m.kind),hidden=Date.now()-m.started<m.delay;
  let h=head('鄰田打工・'+(m.index+1)+'／'+j.questions,j.name)+note(j.hint);
  if(!m.start)return h+action('開始打工','miniStart',true);
  h+='<div class="track"><i id="clock"></i></div>';
  const btn=(s,i)=>action(String(s),'market:'+i);
  if(m.kind==='M-7')return h+(hidden?note(m.labels[0]+' × '+m.quantities[0]+'、'+m.labels[1]+' × '+m.quantities[1],'今天的訂單'):
    m.labels.slice(0,2).map((x,i)=>btn(x+' × '+m.counts[i]+'　＋',i)).join('')+btn('清空',2)+btn('交貨',3));
  if(m.kind==='M-8')return h+'<div class="grid">'+Array.from({length:9},(_,i)=>btn(hidden?(m.targets.includes(i)?'病斑':'葉片'):m.picks.includes(i)?'✓':'葉片',i)).join('')+'</div>';
  if(m.kind==='M-10'&&hidden)return h+note('🍈 '.repeat(m.count),'點收瓜籃');
  if(m.kind==='M-11')return h+btn('旋轉・'+(m.rotation?'直放':'橫放'),16)+'<div class="packShape" style="touch-action:none">拖動貨品 '+(m.rotation?'▣ ↕':'▣ ↔')+'</div><div class="packGrid">'+Array.from({length:16},(_,i)=>'<button data-act="market:'+i+'" data-pack="'+i+'">'+(m.cells.includes(i)?'瓜':'空')+'</button>').join('')+'</div>'+btn('送出這箱',17);
  return h+note(m.prompt)+(m.photo?'<img width="180" src="'+escapeHTML(m.photo)+'" alt="種子題目">':'')+m.labels.map(btn).join('');
}
function marketNext(m,correct){
  if(correct)m.done++;else m.mistakes++;
  const j=D.jobs.find(j=>j.id===m.kind);
  if(++m.index>=j.questions){finishMini();return;}
  marketRound(m);persist();render(false);
}
function marketTap(m,i){
  if(!m.start||Date.now()-m.started<m.delay)return;
  if(Date.now()-m.started>=m.limit){marketNext(m,false);return;}
  if(m.kind==='M-11'){
    if(i===16)m.rotation=1-m.rotation;
    else if(i===17){marketNext(m,true);return;}
    else{const other=i+(m.rotation?4:1);if(i>=0&&i<16&&other<16&&(m.rotation||i%4!==3)&&![i,other].some(x=>m.cells.includes(x)))m.cells.push(i,other);}
  }else if(m.kind==='M-7'){
    if(i===3){marketNext(m,m.counts.every((v,k)=>v===m.quantities[k]));return;}
    if(i===2)m.counts=[0,0];else m.counts[i]++;
  }else if(m.kind==='M-8'){
    if(m.picks.includes(i))return;
    if(!m.targets.includes(i)){marketNext(m,false);return;}
    m.picks.push(i);if(m.picks.length===m.targets.length){marketNext(m,true);return;}
  }else{marketNext(m,i===m.answer);return;}
  persist();render(false);
}

function miniSlot(m, wave) {
  return Math.floor(dice(m.kind + '位置' + wave) * 9);
}
function cropSlots(m){
  const first=miniSlot(m,m.index),slots=new Map();
  if(m.kind==='M-2'){slots.set(first,['剛好','過老','剛好','過小'][m.index%4]);return slots;}
  slots.set(first,'雜草');
  if(dice('雙草'+m.index)<.5)slots.set((first+4)%9,'雜草');
  slots.set((first+2)%9,'瓜苗');return slots;
}
function cropGrid(m){
  const slots=cropSlots(m);
  return '<div class="track"><i id="clock"></i></div><div class="grid">'+Array.from({length:9},(_,i)=>{
    const item=slots.get(i),picked=m.picked?.includes(i);
    return '<button class="tile '+(!item?'empty':'')+'" data-slot="'+i+'" '+(picked?'disabled':'')+'>'+ (picked?'✓':item||'')+'</button>';
  }).join('')+'</div><small>'+ (m.kind==='M-2'?'點選要採的瓜。':'往上滑拔草。')+'</small>';
}
function missedCucumber(m,to){
  if(m.kind!=='M-2')return;
  for(let i=m.index;i<to;i++)if(i%4===1&&(i!==m.index||!m.picked?.length))m.mistakes++;
}
function miniWave() {
  const m = state.mini;
  if (!m?.start) return;
  if(D.jobs.find(j=>j.id===m.kind)?.questions){
    const t=Date.now()-m.started;
    if(t>=m.limit){marketNext(m,false);return;}
    if(!m.revealed&&t>=m.delay){m.revealed=true;render(false);}
    const bar=document.getElementById('clock');if(bar)bar.style.width=(100*(1-t/m.limit))+'%';
    return;
  }
  let elapsed = Date.now() - m.start,
    pct = clamp(elapsed / m.duration, 0, 1),
    wave = Math.min(T.targets + T.decoys - 1, Math.floor(pct * (T.targets + T.decoys)));
  if (pct >= 1) {
    missedCucumber(m,T.targets+T.decoys);finishMini();
    return;
  }
  if (m.index !== wave) {
    missedCucumber(m,wave);m.picked=[];
    m.index = wave;
    m.taps = 0;
    m.hit = false;
    persist();
    render(false);
  }
  const clock = document.getElementById('clock');
  if (clock) clock.style.width = (1 - pct) * 100 + '%';
}
function hit(slot) {
  const m = state.mini;
  if(m?.start&&['M-1','M-2','homeWeed'].includes(m.kind)){
    const item=cropSlots(m).get(slot);if(!item||(m.picked||[]).includes(slot))return;
    (m.picked??=[]).push(slot);
    if(['雜草','剛好'].includes(item)){m.done++;m.valid=(m.valid||0)+1;}
    else if(item==='過老')m.valid=(m.valid||0)+1;
    else m.mistakes++;
    persist();render(false);return;
  }
  if (!m?.start || m.hit || miniSlot(m, m.index) !== slot) return;
  const bad = m.index % Math.ceil((T.targets + T.decoys) / T.decoys) === 0;
  if (bad) m.mistakes++;else if (++m.taps < m.hits) {
    persist();
    return;
  } else m.done++;
  m.hit = true;
  const el = app.querySelector('[data-slot="' + slot + '"]');
  if (el) {
    el.textContent = bad ? '×' : '✓';
    el.disabled = true;
  }
  persist();
}


 function cellText(g,i,t){
   const word=baseCellText(g,i,t), pos=g.sequence.indexOf(i);
   if(g.mode==='paint')return g.marks.includes(i)?'完成':g.label;
   if(g.mode==='find'){
     if(i===arcTarget(g))return g.label;
     return ({snail:'健康葉',vine:'已固定',prune:'主蔓',homeWeed:'瓜苗',mildew:'健康葉'})[g.kind]||'正常';
   }
   if(g.mode==='avoid'&&g.kind==='bud2')return g.marks.includes(i)?'剪好了':pos<Math.min(g.goal,5)?'側芽':pos%2?'第11～15節結果枝':'主蔓';
   if(g.mode==='slice'&&g.kind==='homeWeed')return g.marks.includes(i)?'拔好了':pos<Math.min(g.goal,5)?'雜草':'瓜苗';
   if(['order','trail'].includes(g.mode)&&word!=='·'&&word!=='完成')return word.replace('順序 ',g.label+' ').replace('◎ ',g.label+' ').replace('○ ',g.label+' ');
   return word;
 }
 function score(g){
   if(g.mode==='balance')return Math.round(100*clamp(g.goodTime/Math.max(g.duration*.9,g.totalTime),0,1));
   return Math.round(100*clamp((g.hit-g.miss*rules.missPenalty)/g.goal,0,1));
 }
 function resetWave(g){g.marks=[];g.stage=0;g.sequence=sequence();}
 function playCell(g,i){
   if(g.kind==='bud2'&&g.mode==='avoid'){
     const pos=g.sequence.indexOf(i);
     if(g.marks.includes(i))return;
     if(pos>=Math.min(g.goal,5)){g.miss++;g.heal+=cfg.bosses['B-3'].hp.heal;g.hit=Math.max(0,g.hit-g.goal*cfg.bosses['B-3'].hp.heal/g.hp);g.toast='剪錯結果枝，藤魔回血！';return;}
     g.marks.push(i);g.hit++;if(g.marks.length>=Math.min(g.goal,5)&&g.hit<g.goal)resetWave(g);return;
   }
   legacyPlayCell(g,i);
 }
 const custom=new Set(['flash','wire','catch','cut']);
 function points(g){return Array.from({length:g.goal+1},(_,i)=>[.1+.8*i/g.goal,.5+.24*Math.sin(i*2.1+g.variant)])}
 function snailPos(g){let p=g.sequence[g.stage%9];return [(p%3+.5)/3,(Math.floor(p/3)+.5)/3]}
 function drawCustom(g,t){
   const canvas=document.getElementById('farmCanvas');if(!canvas)return;
   const c=canvas.getContext('2d'),w=360,h=320;
   const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()};
   const label=(s,x,y,col='#284337',size=16)=>{c.fillStyle=col;c.font='bold '+size+'px sans-serif';c.textAlign='center';c.fillText(s,x,y)};
   c.fillStyle='#e9efd9';c.fillRect(0,0,w,h);
   if(g.mode==='flash'){
     c.fillStyle='#172721';c.fillRect(0,0,w,h);
     c.save();c.beginPath();c.arc(g.player[0]*w,g.player[1]*h,rules.flashLight,0,Math.PI*2);c.clip();c.fillStyle='#657f4d';c.fillRect(0,0,w,h);
     for(let i=0;i<9;i++){let x=(i%3+.5)*120,y=(Math.floor(i/3)+.5)*h/3;circle(x,y,27,'#375a35');}
     let [x,y]=snailPos(g);circle(x*w,y*h,18,'#c09263');label('蝸',x*w,y*h+5,'#372d20');
     for(let i=0;i<g.extra;i++){let p=g.sequence[(g.stage+i+1)%9];circle((p%3+.5)*120,(Math.floor(p/3)+.5)*h/3,9,'#b2a374')}
     c.restore();label('拖動光圈找蝸牛',180,304,'#fff4d0');
   }else if(g.mode==='wire'){
     let p=points(g);c.lineWidth=34;c.strokeStyle='#bad4ac';c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.stroke();
     c.lineWidth=2;c.strokeStyle='#5d8155';c.stroke();
     p.forEach(([x,y],i)=>circle(x*w,y*h,i===g.stage?12:6,i<g.stage?'#448846':'#e3b849'));
     label('花粉',p[0][0]*w,p[0][1]*h-20);label('雌花',p.at(-1)[0]*w,p.at(-1)[1]*h-20);
     circle(g.player[0]*w,g.player[1]*h,7,'#e8b44b');label('沿綠色路線送花粉，別碰邊',180,304);
   }else if(g.mode==='catch'){
     for(const o of g.falling){circle(o.x*w,o.y*h,o.bad?9:12,o.bad?'#cc6460':'#f0c94f');label(o.bad?'藥':'粉',o.x*w,o.y*h+4,'#473b25',12)}
     let x=g.player[0]*w;circle(x,280,24,'#e2b343');c.fillStyle='#4d4234';c.fillRect(x-17,273,34,7);label('蜜蜂',x,309);label('左右拖動接花粉，躲開農藥滴',180,22);
   }else{
     let x=oscillate(g,t)*w;c.strokeStyle='#548b51';c.lineWidth=6;c.beginPath();c.moveTo(180,32);c.lineTo(180,152);c.stroke();
     c.fillStyle='#91bd79';c.fillRect(w*(.5-rules.timingWidth),175,2*w*rules.timingWidth,42);
     label('剪刀',x,163);circle(x,196,10,'#bd6441');label('準準剪在綠區',180,275);
   }
 }
 function customTouch(g,x,y,down){
   if(g.mode==='flash'){
     g.player=[x,y];let p=snailPos(g);if(Math.hypot(x-p[0],y-p[1])<rules.flashHitRadius&&g.lastSnail!==g.stage){g.lastSnail=g.stage;g.hit++;g.stage++;if(g.stage%9===0)g.sequence=sequence();}
   }else if(g.mode==='wire'){
     g.player=[x,y];let p=points(g),i=g.stage;
     if(i===0){if(Math.hypot(x-p[0][0],y-p[0][1])<rules.wireTolerance)g.stage=1;return}
     let [a,b]=p[i-1], [d,e]=p[Math.min(i,p.length-1)];let dx=d-a,dy=e-b,k=clamp(((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy||1),0,1);
     if(Math.hypot(x-a-k*dx,y-b-k*dy)>rules.wireTolerance){g.miss++;g.stage=0;g.toast='碰到邊了！從起點再來';return}
     if(Math.hypot(x-d,y-e)<rules.wireHitRadius){g.hit=Math.max(g.hit,i);g.stage=i+1}
   }else if(g.mode==='catch'){g.player=[x,.87]}
   else if(g.mode==='cut'&&down){let t=arcTime(g);if(t-(g.lastTap??-1)<rules.timingGap)return;g.lastTap=t;if(Math.abs(oscillate(g,t)-.5)<rules.timingWidth)g.hit++;else g.miss++}
 }
 function fallingFrame(g,t,dt){
   const drop=bad=>g.falling.push({x:.12+Math.random()*.76,y:0,bad});
   if(t>=g.nextDrop){g.nextDrop=t+rules.dropInterval;drop(false)}
   while(g.poisonDrops<g.extra&&t>=g.duration*(rules.beePoisonFirst+g.poisonDrops*rules.beePoisonSpacing)){
     drop(true);g.poisonDrops++;
   }
   for(const o of g.falling){o.y+=dt*rules.dropSpeed;if(o.y>.79&&o.y<.96&&Math.abs(o.x-g.player[0])<rules.catchRadius){if(o.bad){g.miss++;g.toast='碰到農藥滴！'}else g.hit++;o.y=2}}
   g.falling=g.falling.filter(o=>o.y<1.1);
 }
 function finish(scoreValue){
   const cb=done;done=null;cancelAnimationFrame(frame);clearInterval(miniTimer);held=false;g=null;state.mini=null;if(cb)cb(clamp(Math.round(scoreValue),0,100));
 }
 function tick(){
   if(!g)return;const t=arcTime(g),dt=clamp(t-g.frame,0,.15);g.frame=t;
   if(g.mode==='balance'){g.knob=clamp(g.knob+dt*.10*Math.sin(t*(1.4+g.variant*.09)+g.variant+.7),0,1);g.totalTime+=dt;if(Math.abs(g.knob-waterTarget(g,t))<=targetWidth(g))g.goodTime+=dt;}
   if(g.mode==='plane')flyFrame(g,t,dt);
   if(g.mode==='catch')fallingFrame(g,t,dt);
   if(t>=g.duration||g.hit>=g.goal||(g.kind==='feed'&&g.mode==='timing'&&g.attempts>=rules.pourAttempts)){finish(score(g));return}
   if(custom.has(g.mode))drawCustom(g,t);else drawArc(g,t);
   let el=document.getElementById('arcClock');if(el)el.textContent='剩 '+Math.ceil(g.duration-t)+' 秒';
   el=document.getElementById('arcScore');if(el)el.textContent='操作 '+score(g)+' 分';
   el=document.getElementById('fightHp');if(el&&g.hp){el.style.width=100*(1-clamp(g.hit/g.goal,0,1))+'%';}
   el=document.getElementById('fightHpText');if(el&&g.hp)el.textContent=Math.round(g.hp*(1-clamp(g.hit/g.goal,0,1)))+' HP';
   el=document.getElementById('arcToast');if(el)el.textContent=g.toast||'';
   frame=requestAnimationFrame(tick);
 }
 function pointer(ev){
   if(!g)return;ev.preventDefault();let r=ev.currentTarget.getBoundingClientRect(),x=clamp((ev.clientX-r.left)/r.width,0,.999),y=clamp((ev.clientY-r.top)/r.height,0,.999),down=ev.type==='pointerdown';
   if(down){held=true;lastCell=-1;ev.currentTarget.setPointerCapture(ev.pointerId)}if(!held)return;
   if(custom.has(g.mode))customTouch(g,x,y,down);
   else if(g.mode==='plane')g.player=[clamp(x,.04,.96),clamp(y,.3,.95)];
   else if(down||['paint','trail','slice'].includes(g.mode)){let i=cellFor(x*360,y*320);if(lastCell!==i){lastCell=i;playCell(g,i)}}
 }
 function start(hostEl,spec,onDone){
   stop();host=hostEl;done=onDone;
   if(spec.job){startJob(spec.job);return}
   const [kind,mode]=spec.mode.split('/');
   const base=kind==='feed'&&mode==='timing'?rules.pourAttempts:rules.targets[mode]||1,goal=(spec.hp?Math.max(1,Math.round(base*spec.hp/rules.bossBase)):base)+(mode==='flash'?spec.extra||0:0);
   const duration=spec.hp?rules.bossSeconds:rules.seconds*rules.difficultyTime[(spec.difficulty||3)-1];
   g={kind,mode,title:spec.title,hint:spec.hint,label:spec.label||spec.title,variant:spec.variant||0,context:{id:'pest'+(spec.variant%3||0),value:1},goal,duration,green:spec.green||.14,hp:spec.hp||0,extra:spec.extra||0,sequence:sequence(),start:Date.now(),elapsed:0,hit:0,miss:0,marks:[],stage:0,values:[0,0,0],knob:.5,player:[.5,.82],shots:[],hazards:[],nextShot:0,nextHazard:0,frame:0,goodTime:0,totalTime:0,power:1,falling:[],nextDrop:0,poisonDrops:0,attempts:0,heal:0};
   state.daily.arc=g;
   host.innerHTML=(g.hp?'<div class="fightStatus"><div class="hp"><i id="fightHp"></i></div><span id="fightHpText">'+g.hp+' HP</span></div>':'')+'<div class="arcStatus"><b id="arcClock"></b><b id="arcScore"></b></div><canvas id="farmCanvas" width="360" height="320" aria-label="'+escapeHTML(spec.title)+'"></canvas><p id="arcToast" aria-live="polite"></p>';
   const canvas=document.getElementById('farmCanvas');canvas.addEventListener('pointerdown',pointer);canvas.addEventListener('pointermove',pointer);for(const e of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(e,()=>{held=false;lastCell=-1});tick();
 }
 function render(){
   if(!state.mini)return;const m=state.mini,j=D.jobs.find(x=>x.id===m.kind);host.innerHTML=j.questions?marketView(m):head('鄰田打工',j.name)+note(j.hint)+cropGrid(m);
   host.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>marketTap(m,Number(b.dataset.act.split(':')[1])));
   host.querySelectorAll('[data-slot]').forEach(b=>{if(m.kind==='M-2')b.onclick=()=>hit(Number(b.dataset.slot));else{let y;b.onpointerdown=e=>{y=e.clientY;b.setPointerCapture(e.pointerId)};b.onpointerup=e=>{if(y-e.clientY>12)hit(Number(b.dataset.slot))};b.onkeydown=e=>{if(e.key==='Enter')hit(Number(b.dataset.slot))}}});
 }
 function finishMini(){const m=state.mini;if(!m)return;const j=D.jobs.find(x=>x.id===m.kind);let ratio=m.kind==='M-11'?m.cells.length/16:j.questions?m.done/j.questions-m.mistakes*D.job.penalty:m.done/T.targets-m.mistakes*D.job.penalty;finish(100*clamp(ratio,0,1))}
 function startJob(id){jobCache={};state.mini={kind:id,duration:D.job.seconds*1000,start:Date.now(),index:0,done:0,mistakes:0,taps:0};if(D.jobs.find(x=>x.id===id)?.questions)marketRound(state.mini);render();miniTimer=setInterval(miniWave,80)}
 function stop(){cancelAnimationFrame(frame);clearInterval(miniTimer);held=false;g=null;state.mini=null;done=null}
 return {start,stop,jobNames:Object.fromEntries(D.jobs.map(j=>[j.id,j.name]))};
})();