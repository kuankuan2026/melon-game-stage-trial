/* SVG 立繪：階段關卡 98～110列。葉片依實際數量繪製。 */
const StageArt=(()=>{
 const R=D.rules;
 const leaf=(x,y,angle,scale,color,spot,bite,bug)=>'<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+scale+')"><path d="M0 0 Q-22 -22 -39 -13 Q-55 -38 -27 -45 Q-14 -62 0 -42 Q15 -63 30 -44 Q57 -37 39 -13 '+(bite?'L25 -19 Q13 -8 31 -7':'')+' Q20 -19 0 0Z" fill="'+color+'" stroke="#456d3c" stroke-width="1.2"/><path d="M0 0L0 -41M0 -8L-28 -29M0 -8L28 -29" fill="none" stroke="#e3ebba" opacity=".45" stroke-width="1.5"/>'+ (spot?'<g fill="#fff9df" opacity=".9"><circle cx="-14" cy="-26" r="7"/><circle cx="15" cy="-36" r="5"/><circle cx="25" cy="-18" r="4"/></g>':'')+(bug?'<g fill="#332a26"><ellipse cx="-12" cy="-18" rx="2" ry="4"/><ellipse cx="12" cy="-30" rx="2" ry="4"/></g>':'')+'</g>';
 const flower=(x,y,s=1)=>'<g transform="translate('+x+' '+y+') scale('+s+')">'+[0,72,144,216,288].map(a=>'<ellipse cx="0" cy="-8" rx="5" ry="10" fill="#f4c44f" transform="rotate('+a+')"/>').join('')+'<circle r="5" fill="#a46d27"/></g>';
 function plant(s){
  const {leaves,leafSize,training,doubleStarted,stage,vigor,cap,root,snailBite,disease,broken,missing,fruit,fruitNode}=s;
  const preview={leaves,leafSize,training,doubleStarted,stage,vigor,cap,root,snailBite,disease,broken,missing,fruit,fruitNode};
  return '<div class="plant-frame" tabindex="0" role="region" aria-label="洋香瓜植株，可上下滑動">'+
   '<canvas class="plant-pixels pixel" data-plant="'+JSON.stringify(preview).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')+'" aria-label="洋香瓜植株，'+s.leaves+'片葉"></canvas></div>';
 }
 function drawPlant(canvas,s){
  const total=s.leaves||0, dual=s.training==='double'&&s.doubleStarted;
  const pinched=s.stage>=2||s.broken;
  const weak=s.vigor<s.cap*R.weakRatio, vine=weak?'weak':'healthy';
  const type=s.root<R.droopRoot?'droop':weak?'weak':s.leafSize<R.artSmallLeaf?'small':s.leafSize>R.artLargeLeaf?'large':'healthy';
  const layers=[];
  function add(rows,anchor,x,y,flip=false){
   if(!rows)return;
   const ax=flip?rows[0].length-1-anchor[0]:anchor[0];
   layers.push({rows,flip,x:x-ax,y:y-anchor[1]});
  }
  function extra(key,x,y,flip){add(PLANT_EXTRA[key],PLANT_EXTRA_ANCHOR[key],x,y,flip);}
  const counts=dual?[Math.ceil(total/2),Math.floor(total/2)]:[total];
  counts.forEach((count,branch)=>{
   let x=dual?48+branch*64:80,y=0;
   for(let i=0;i<count;i++){
    const fromTop=count-1-i;
    const key=vine+'_'+((i+branch)%2===0?'right':'left')+(!pinched&&fromTop<3?'_h'+[5,7,9][fromTop]:'');
    const {bottom,node,leafSide}=PLANT_STEM_META[key], flip=leafSide==='left';
    add(PLANT_STEM[key],bottom,x,y);
    x+=node[0]-bottom[0];y+=node[1]-bottom[1];
    const globalIndex=dual?i*2+branch+1:i+1;
    const bit=s.snailBite&&globalIndex%3===0, spot=s.disease>=R.diseaseTrigger&&globalIndex%4===0;
    const damage=bit?'leaf_bitten_'+type:spot?'leaf_spotted_'+type:null;
    if(!pinched&&fromTop<2){
     const young=(type==='small'||type==='large'?'healthy':type)+'_young'+(fromTop+1);
     add(PLANT_LEAF_YOUNG[young],PLANT_LEAF_YOUNG_ANCHOR[young],x,y,flip);
    }else if(damage&&PLANT_EXTRA[damage])extra(damage,x,y,flip);
    else add(PLANT_LEAF[type],PLANT_LEAF_ANCHOR[type],x,y,flip);
    const resultAt=Math.min(count,s.fruitNode??R.artResultNodes[0]);
    if(branch===0&&i+1===resultAt&&s.stage===2&&s.fruit!==false)extra(s.fruit?'fruit_small':'flower_female',x,y,flip);
   }
   if(count){
    const top=vine+(pinched?'_pinched':'_bud');
    add(PLANT_TOP[top],PLANT_TOP_META[top].bottom,x,y);
   }
   if(s.broken&&branch===0)extra('broken_branch',x,y);
  });
  if(s.missing)extra('missing_hole',16,1);
  const top=Math.min(0,...layers.map(layer=>layer.y))-5;
  const bottom=Math.max(6,...layers.map(layer=>layer.y+layer.rows.length))+4;
  canvas.width=160;canvas.height=Math.max(72,bottom-top);
  const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;
  const tile=document.createElement('canvas');
  for(const {rows,x,y,flip} of layers){
   drawPlantSprite(tile,rows,flip);
   context.drawImage(tile,x,y-top);
  }
 }
 function actor(name){
  if(name==='guanguan')return '<canvas class="pixel teacher-pixels" width="44" height="56" data-character="guanguan" aria-hidden="true"></canvas>';
  const rows=MASCOTS[name];
  return '<canvas class="pixel mascot-pixels" width="'+rows[0].length+'" height="'+rows.length+'" data-character="'+name+'" aria-hidden="true"></canvas>';
 }
 function mount(root){
  for(const c of root.querySelectorAll('[data-plant]'))drawPlant(c,JSON.parse(c.dataset.plant));
  for(const c of root.querySelectorAll('[data-character]')){
   if(c.dataset.character==='guanguan')drawGuanguan(c);else drawMascot(c,c.dataset.character);
  }
  for(const c of root.querySelectorAll('[data-snail]'))drawSnail(c,c.dataset.snail);
  for(const meter of root.querySelectorAll('.bars .track, .hp, .boss-demo-hp')){
   if(meter.querySelector('.divider'))continue;
   for(let i=1;i<10;i++){
    const divider=document.createElement('span');divider.className='divider';divider.style.left=i*10+'%';divider.setAttribute('aria-hidden','true');meter.appendChild(divider);
   }
  }
 }
 function boss(id,pose="normal"){
  const wrap=x=>'<svg class="bossArt" viewBox="0 0 300 220" role="img" aria-label="'+D.bosses[id].name+'">'+x+'</svg>';
  if(id==='B-1')return '<canvas class="bossArt snail-pixels pixel" width="56" height="56" data-snail="'+pose+'" role="img" aria-label="蝸牛大王"></canvas>';
  if(id==='B-3')return wrap('<ellipse cx="150" cy="199" rx="93" ry="12" fill="#000" opacity=".2"/><path d="M147 198C31 173 250 117 142 49M142 163C82 175 42 135 50 76M158 143C231 152 263 91 246 46" fill="none" stroke="#538749" stroke-width="18" stroke-linecap="round"/><path d="M109 61Q102 14 148 8Q190 19 185 67Q213 99 180 122Q148 151 118 121Q84 97 109 61Z" fill="#71a451" stroke="#385c37" stroke-width="4"/><path d="M121 77L142 88L120 92M178 77L157 88L179 92" stroke="#2b4933" stroke-width="5" fill="#f5efc2"/><path d="M134 108Q148 97 165 108" stroke="#324c31" stroke-width="5" fill="none"/>'+leaf(51,95,-30,.9,'#7eab5b',false,false,false)+leaf(242,88,30,.9,'#7eab5b',false,false,false)+leaf(148,34,0,.65,'#8cb35b',false,false,false));
  return wrap('<ellipse cx="150" cy="200" rx="104" ry="12" fill="#000" opacity=".2"/><path d="M45 49Q122 -4 229 37Q299 69 240 116Q213 140 172 132Q230 177 83 199Q143 154 69 130Q-7 98 45 49Z" fill="#a4c5d2" stroke="#557e90" stroke-width="4"/><path d="M28 68Q119 32 223 67M46 95Q149 60 268 93M93 135Q170 162 135 182" fill="none" stroke="#e7f4f6" stroke-width="10" stroke-linecap="round"/><path d="M105 68L131 83L107 94M201 68L175 83L200 94" stroke="#3e5d6a" stroke-width="6" fill="none"/><path d="M138 111Q152 103 168 113" stroke="#3e5d6a" stroke-width="5" fill="none"/>'+flower(35,160,.7)+flower(264,145,.65));
 }
 return {plant,boss,actor,mount};
})();