/* 植日生點陣樣板。座標是原生像素，可直接換成同尺寸的圖稿。 */
(() => {
  'use strict';
  const ink='#1A1A1A', green='#3D9257', fresh='#3BB254', pale='#A8D175',
    net='#DDECB3', yellow='#FABF0D', petal='#FAC93C', stem='#F5F2A3',
    red='#EA5A5A', cream='#FFF4CC', blush='#D96E68', white='#FFFFFF';
  const skin='#F5CCA0', straw='#E8B96B', blue='#286EA6', deep='#24553B';

  function pixelTools(ctx) {
    const box=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
    function oval(x,y,rx,ry,color) {
      for(let dy=-ry;dy<=ry;dy++){
        const half=Math.floor(rx*Math.sqrt(1-(dy/ry)**2));
        box(x-half,y+dy,2*half+1,1,color);
      }
    }
    function poly(points,color) {
      const ys=points.map(p=>p[1]);
      for(let row=Math.min(...ys);row<Math.max(...ys);row++){
        const y=row+.5, hits=[];
        for(let i=0;i<points.length;i++){
          const [ax,ay]=points[i], [bx,by]=points[(i+1)%points.length];
          if((ay<=y&&y<by)||(by<=y&&y<ay))hits.push(ax+(y-ay)*(bx-ax)/(by-ay));
        }
        hits.sort((a,b)=>a-b);
        for(let i=0;i<hits.length;i+=2){
          const x=Math.ceil(hits[i]-.5), end=Math.ceil(hits[i+1]-.5);
          box(x,row,end-x,1,color);
        }
      }
    }
    function line(x,y,tx,ty,color,w=1) {
      const dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;
      let error=dx+dy;
      while(true){
        box(x,y,w,w,color);
        if(x===tx&&y===ty)break;
        const twice=2*error;
        if(twice>=dy){error+=dy;x+=sx}
        if(twice<=dx){error+=dx;y+=sy}
      }
    }
    return {box,oval,poly,line};
  }

  function flower({box},x,y) {
    box(x-1,y-2,3,5,petal);box(x-2,y-1,5,3,petal);box(x,y,1,1,white);
  }
  function eyes({oval,box},x,y,gap,glasses=false) {
    for(const i of [0,1]){
      const at=x+i*gap;
      if(glasses)oval(at,y,4,4,deep);
      oval(at,y,3,3,ink);
      box(at-2,y-1,1,3,white);box(at-1,y+1,2,1,white);
    }
    if(glasses)box(x+3,y,gap-5,1,ink);
  }
  function hatch({line},x,y) {
    line(x,y+1,x+4,y+3,net);line(x+1,y,x+5,y+2,net);
    line(x+2,y,x,y+3,net);line(x+4,y+1,x+2,y+4,net);
  }
  function feet({oval},a,b,y,color) {
    for(const x of [a,b]){oval(x,y,3,2,ink);oval(x,y,2,1,color)}
  }

  const sprites={
    guaji(p){
      const {oval,box,poly}=p;
      oval(16,6,5,4,ink);oval(16,6,3,2,stem);
      poly([[5,22],[1,27],[2,29],[7,28],[11,31],[21,31],[25,28],[30,29],[31,27],[27,22]],ink);
      oval(16,19,14,11,ink);oval(16,19,12,9,pale);
      oval(16,25,10,3,'#91B960');oval(16,20,11,7,pale);
      feet(p,11,22,29,pale);eyes(p,11,17,10);
      box(15,16,2,1,ink);box(16,17,2,3,yellow);
      hatch(p,5,20);hatch(p,22,20);flower(p,20,11);
    },
    tomato(p){
      const {oval,box,poly}=p;
      oval(16,22,13,8,ink);oval(16,22,11,6,red);
      poly([[4,22],[1,27],[2,29],[7,28],[25,28],[30,29],[31,27],[27,22],[25,25],[6,25]],ink);
      oval(16,21,11,7,red);
      for(const x of [8,13,18,23]){oval(x,14,4,3,ink);oval(x,14,3,2,pale)}
      feet(p,10,23,29,red);eyes(p,10,22,12);
      box(14,21,1,1,ink);box(17,21,1,1,ink);box(15,22,2,1,ink);box(15,23,2,2,yellow);
      flower(p,23,26);
    },
    zucchini(p){
      const {oval,box,poly}=p;
      poly([[12,5],[12,2],[14,0],[18,0],[20,2],[20,5]],ink);box(14,2,4,3,pale);
      oval(16,17,9,13,ink);box(7,15,19,10,ink);
      oval(16,17,7,11,green);box(9,15,15,10,green);
      oval(17,25,7,4,green);box(10,20,2,6,fresh);
      feet(p,10,23,29,green);eyes(p,12,12,8,true);
      box(11,7,3,1,ink);box(20,7,3,1,ink);flower(p,19,22);
    },
    garlic(p){
      const {oval,box,line}=p;
      oval(14,16,4,3,ink);oval(19,16,4,3,ink);
      oval(14,16,3,2,pale);oval(19,16,3,2,pale);
      oval(16,19,5,2,cream);oval(16,24,11,6,ink);
      oval(16,24,9,5,cream);feet(p,11,21,29,cream);
      eyes(p,12,23,8);line(10,19,13,20,ink);line(19,20,22,19,ink);
      box(11,26,2,1,blush);box(19,26,2,1,blush);box(15,24,2,1,ink);
      flower(p,24,25);
    },
    kuan(p){
      const {oval,box,poly,line}=p;
      poly([[6,15],[3,12],[1,13],[3,22],[10,24],[12,22],[10,19],[7,19]],ink);
      poly([[3,14],[5,14],[7,20],[10,20],[10,22],[5,21]],skin);
      poly([[9,20],[23,20],[26,28],[22,30],[10,30],[8,27]],ink);
      box(11,21,11,6,white);box(10,25,13,2,white);box(10,27,13,3,blue);
      box(11,30,4,1,ink);box(19,30,4,1,ink);
      oval(17,14,9,9,ink);oval(17,14,7,7,skin);
      oval(16,5,9,5,ink);oval(16,5,7,4,straw);
      oval(16,8,13,3,ink);oval(16,8,11,2,green);box(10,6,11,1,straw);
      line(13,12,13,14,ink);line(19,12,19,14,ink);
      oval(16,17,4,3,ink);box(14,17,5,2,red);box(14,16,5,1,white);
      box(1,12,2,2,skin);
    },
    healthy(p){plant(p,'healthy')},
    weak(p){plant(p,'weak')},
    droop(p){plant(p,'droop')},
    smallLeaf(p){plant(p,'small')},
    largeLeaf(p){plant(p,'large')},
    snail(p){
      const {oval,poly,box,line}=p;
      oval(32,57,27,4,'#A9B970');
      oval(31,48,25,10,ink);oval(31,48,23,8,'#A2AF52');
      oval(46,40,12,13,ink);oval(46,40,10,11,'#B6C569');
      line(43,35,39,19,ink,3);line(51,34,56,18,ink,3);
      line(44,33,40,20,'#A2AF52',1);line(52,33,57,19,'#A2AF52',1);
      for(const x of [40,57]){
        oval(x,19,6,6,ink);oval(x,19,4,4,cream);oval(x+1,20,2,2,ink);
      }
      oval(26,38,20,19,ink);oval(26,38,18,17,'#A45F39');
      oval(25,36,15,14,'#C9854F');oval(24,34,11,10,'#DCA169');
      const spiral=[[15,41],[14,35],[17,29],[22,26],[30,27],[35,32],[35,38],[31,43],[25,44],[21,40],[21,35],[24,32],[28,33],[29,36],[27,38]];
      for(let i=1;i<spiral.length;i++)line(...spiral[i-1],...spiral[i],'#743B29',2);
      poly([[11,20],[8,8],[15,11],[18,3],[24,11],[31,6],[30,20]],ink);
      poly([[13,18],[11,11],[16,14],[18,7],[23,14],[29,10],[28,18]],yellow);
      box(18,15,2,2,cream);box(45,42,6,2,ink);box(46,44,3,1,ink);
      box(39,52,12,1,'#D2D981');
    },
    finalKuan(p){
      const {oval,poly,box,line}=p;
      oval(30,59,24,4,'#DCBD75');
      poly([[17,35],[38,34],[46,44],[43,57],[35,61],[19,61],[12,55],[12,43]],ink);
      poly([[18,37],[36,36],[43,43],[39,53],[17,53],[15,44]],white);
      box(17,53,23,5,blue);box(18,58,8,2,'#184861');box(31,58,8,2,'#184861');
      oval(28,28,17,16,ink);oval(28,28,15,14,skin);
      oval(27,13,18,11,ink);oval(27,13,16,9,straw);
      box(16,7,9,2,'#FFE2A0');line(34,7,40,13,'#C78F47',2);
      oval(28,17,25,6,ink);oval(28,17,23,4,green);box(12,13,30,3,straw);
      line(18,24,23,22,ink,2);line(32,22,37,24,ink,2);
      line(21,27,21,29,ink,2);line(34,27,34,29,ink,2);
      oval(28,34,7,5,ink);box(22,32,12,2,white);box(26,35,5,2,red);
      box(16,32,3,2,blush);box(38,32,3,2,blush);
      poly([[46,46],[49,36],[55,37],[53,47],[48,52],[44,50]],ink);
      poly([[47,46],[50,38],[53,38],[51,46],[48,49]],skin);
      poly([[47,36],[48,30],[51,34],[59,9],[63,12],[60,28],[54,39],[51,44],[47,42]],ink);
      poly([[51,34],[60,12],[61,13],[58,27],[54,34]],'#DAE5DD');
      line(49,36,53,38,'#A86C37',2);
      flower(p,7,36);flower(p,57,50);
    },
    field({box,oval,line,poly}) {
      box(0,0,320,84,'#E5EFD7');
      for(const [x,y] of [[78,30],[235,20],[289,36]]){
        oval(x,y,17,4,white);oval(x-4,y-3,9,5,white);oval(x+5,y-1,8,5,white);
      }
      oval(51,89,78,39,pale);oval(203,90,99,40,'#BFD994');oval(286,94,70,37,pale);
      poly([[116,75],[116,51],[138,34],[182,34],[205,51],[205,75]],'#EEF3DF');
      for(const [x,y,a,b] of [[116,75,116,51],[116,51,138,34],[138,34,182,34],[182,34,205,51],[205,51,205,75],[116,51,205,51],[138,34,138,75],[182,34,182,75],[160,51,160,75]])line(x,y,a,b,'#829F72',1);
      oval(92,93,135,23,green);oval(247,96,111,26,fresh);
      for(const [x,y] of [[31,76],[61,78],[101,80],[219,79],[248,77],[287,77]]){
        box(x,y,2,2,petal);box(x+1,y+2,1,2,deep);
      }
    },
  };
  function plant(p,kind){
    const {box,oval,line,poly}=p, weak=kind==='weak', droop=kind==='droop';
    const tone=weak?'#9AA549':green, light=weak?'#D1D275':pale;
    oval(16,28,12,3,'#A97752');box(9,28,13,1,'#BF9166');
    line(16,27,16,7,'#B9A57B');
    line(15,27,droop?21:15,droop?14:7,tone,weak?1:2);
    const large=kind==='large', small=kind==='small';
    for(const [y,dir] of [[11,1],[16,-1],[21,1]]){
      const width=large?12:small?5:weak?6:9;
      const spread=large?5:small?2:3;
      const cx=droop?19:16, tip=y+(droop?6:-3);
      poly([[cx,y],[cx+dir*3,y-spread],[cx+dir*width,tip],[cx+dir*(width-2),tip+spread],[cx+dir*2,y+spread]],tone);
      line(cx+dir,y,cx+dir*(width-2),tip,light);
    }
    if(kind==='healthy')flower(p,16,6);
  }
  for(const canvas of document.querySelectorAll('canvas[data-sprite]')){
    const ctx=canvas.getContext('2d');
    if(!ctx)continue;
    ctx.imageSmoothingEnabled=false;
    sprites[canvas.dataset.sprite](pixelTools(ctx));
  }
})();
