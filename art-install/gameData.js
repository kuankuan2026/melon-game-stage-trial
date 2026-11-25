/* 1124b｜階段關卡、施肥小遊戲；全部為遊戲模擬值 */
const D = globalThis.StageData = {
  version: 'stage-trial-1',
  saveKey: 'zhirisheng.stage-trial.v1',
  rules: {
    coins:1000, // 預算與收支 B-1
    soil:'3-S5', // 0-1
    startSeason:1, // ST-0
    vigorByStar:[0,40,55,70,85,100], // P-1
    caps:[.5,.60,.75,.85,1], // 59列；交辦幼苗結算後60%
    initialVigor:.7, root:60, strongRatio:.7,weakRatio:.4,droopRoot:30, // 99～100列；根系萎垂門檻背景暫定
     // 92、93列
    leafLimit:[25,40], seedLeaves:1, seedlingLeaves:4, leafPerDay:1, // 94列
     // 94列
    scoreBands:[[90,2],[60,0],[30,-3],[0,-6]], // 階段關卡第 58 列：分數、一般數值
    leafSizeInitial:1, leafSizeReference:1, // 1125b／階段關卡第 94 列：開局大小、面積基準（暫定）
    leafSizeMin:.6, leafSizeMax:1.2, leafSizeGain:.6, // 1125b／階段關卡第 94 列：大小下限、上限、公式增幅（暫定）
    bossMultiplier:2, lowScore:30, goodScore:90, autoTopScore:60, setHalf:.5, // 58列、ST-4、5-2
     tipGoodBonus:2, tipPoorLoss:3, tipBadLoss:6, decisionLeafWeight:2, // 5-2、58列；T字非數值，著果率依一般分數
    // 58列
    low:20, rescueTo:30, rescuePrice:50, rescueCount:1, retryCount:1, // C-6、確認
    bossBase:100, bossMin:60,bossMax:140, bossWin:60,bossPerfect:90, // 68列
    intro:3000, repeatIntro:1000, defeat:2000, feedback:2700, // 60、84～87列
     // 84～87列
    snailChance:.4, snailBiteChance:.2, // 蝸牛未抓時咬苗機率，逐日設定32列背景暫定
    snailMiss:0, snailDamage:1, missingCost:20, missingPenalty:5, // 1-3、1-4：忽略蝸牛只透過 B-1 血量調整戰鬥目標
    breakChance:.3, breakLoss:[.1,.2,.3,.4,.5], // 102列
    pruneClean:10, pruneDisease:10, pruneVirus:10, pruneMissBelow:60, // 3-2；漏剪門檻暫定
    beePrice:100, beeBonus:10, beePoison:2, // 5-1、5-B
    tipBad:[.1,.7,.2], // 5-2
    setBands:[[90,95],[60,80],[30,50],[0,20]], // 5-B
    vineBossSetLoss:20, doubleSetBonus:10,doubleDisease:5,doubleBrix:-.5, // 3-B、確認
    pestTrigger:40,diseaseTrigger:40,fieldMax:100,weedStart:1,weedMax:5,weedTrigger:2,weedGrowth:1, // C-1～3
    pestPrices:[60,40,30],diseasePrice:40,control:20,materialRate:.6,ignoredRise:15, ignoredLeafLoss:1, // C-1、C-2
    ignoredVirus:10,weedPest:5, // C-1～3
    jobMax:100, jobLimit:1, // C-5
    // ST-0、63列：配對未給田況點數；暫定映射（蟲／病）
    fieldByMatch:{'最適合':[15,15],'可以':[25,25],'勉強':[40,40],'不行':[45,50]},
    virusStart:0, // P-7
    // 操作調整暫定：沿用既有 arc 的目標及節奏；各模式可獨立調整
    seconds:10, bossSeconds:12, wireTolerance:.12, wireHitRadius:.085, flashHitRadius:.085, flashLight:75, dropInterval:.58, dropSpeed:.65, catchRadius:.12, // 新玩法手感暫定，均可調
     missPenalty:.35, memoryShow:2.6, // 操作暫定
    greenByDifficulty:[1.2,1.1,1,.9,.8], jobPenalty:.1, jobTargets:8,jobDecoys:2, // 難度綠區倍率暫定；M-1/2 沿用逐日
    timingWidth:.15, timingGap:.35, // 藤夾、倒肥停手操作暫定
    pourAttempts:4, // FZ-4
    beePoisonFirst:0, beePoisonSpacing:.15, // 5-1：藥滴自開場分散至戰鬥前段，出場節奏暫定
    artSmallLeaf:.85, artLargeLeaf:1.1, // 美術安裝：大小葉顯示門檻（暫定）
    artResultNodes:[11,15], // 美術安裝：由下往上的展示節位，日後改為玩家選擇
    virusVisible:40, // 階段關卡 95 列：病毒顯示門檻暫定
    targets:{paint:9,slice:5,avoid:5,memory:4,order:5,trail:5,timing:4,find:3,scale:2,balance:7,plane:10,flash:6,cut:4,wire:5,catch:6},
    difficultyTime:[1.1,1.05,1,.95,.9], // 品種難度 1～5；暫定
    seasonsGreen:[.13,.14,.14,.14,.14,.13,.12,.14], // 63列；暫定
    vineForms:['trail','timing','order','find','balance'], // 3-1
    pruneForms:['slice','memory','order','find'], // 3-2
    tipForms:['cut','order'], // 5-2
    weedForms:['find','slice','paint','avoid','trail'], // C-3
    jobIds:['M-1','M-2','M-6','M-7','M-8','M-9','M-10','M-11'], // C-5
  },
  // 品種 A、D、I、J、K欄；不包含真實品種名
  cultivars:[
    ['綠光盛夏',5,4,3,3],['霜網一號',5,5,3,3],['寒甜雪球',5,5,3,3],['冬夜琥珀',5,2,1,5],['夏日勇士',4,5,5,1],
    ['網購特價種子',3,2,2,4],['夕陽紅玉',5,3,2,5],['玻璃心',5,2,2,5],['冬日勇士',3,5,5,1],['四季平安',3,5,5,1]
  ],
  brixByStar:[0,12,13,15,16,18], // F-5
  // 季節、逐日設定21～28列：定植到採收天數、幼苗／生長／抽藤、授粉天數（範圍取中間值暫定）
  seasons:[
    ['8月下旬',75,7,7,15,7],['9月',78,7,8,17,7],['10月上旬',85,9,9,21,7],
    ['10月下旬～11月上旬',93,10,9,22,8],['1月底～2月上旬',93,10,10,22,8],
    ['2月底～3月底',78,7,8,17,7],['4月～8月上旬',73,7,7,13,7],['11月中～1月中',110,14,14,30,8]
  ],
  // 配對表 B:I
  match:[
    ['最適合','可以','不行','不行','不行','最適合','最適合','不行'],
    ['不行','可以','最適合','最適合','最適合','不行','不行','不行'],
    ['不行','勉強','勉強','最適合','不行','不行','不行','可以'],
    ['不行','不行','可以','最適合','不行','不行','不行','可以'],
    ['最適合','最適合','勉強','不行','不行','最適合','最適合','不行'],
    ['勉強','可以','勉強','勉強','勉強','可以','不行','不行'],
    ['最適合','可以','不行','不行','不行','最適合','可以','不行'],
    ['不行','最適合','最適合','不行','勉強','最適合','不行','不行'],
    ['勉強','可以','最適合','最適合','最適合','勉強','不行','不行'],
    ['可以','最適合','可以','勉強','勉強','可以','勉強','不行']
  ],
  stages:[
    {id:'ST-1',name:'幼苗期',text:'苗剛種下去，根還沒抓住土。這時候最怕根長不好，還有晚上出來啃苗的蝸牛。',hint:'剛定植，根還沒抓住土。',fixed:['1-1','1-2'],boss:'B-1',cap:1},
    {id:'ST-3',name:'抽藤期',text:'藤一直往上爬，側芽到處冒，花芽也開始準備了。',hint:'藤往上爬、花芽在準備。',fixed:['3-1','3-2','3-3'],boss:'B-3',cap:2},
    {id:'ST-5',name:'授粉期',text:'雌花開了，要讓瓜坐得住。花期就這幾天，錯過就沒了。',hint:'雌花開了，要坐果。',fixed:['5-1','5-2','5-3'],boss:'B-5',cap:4}
  ],
  work:{
    '1-1':['施肥（基肥）','FZ-1'], '1-2':['定植','seed/order','依編號把苗放進穴位','root'], // 1-1、1-2
    '1-3':['補苗','seed/memory','記住要補苗的穴位','vigor'], // 1-3
    '1-4':['抓蝸牛','snail/find','掀葉找蝸牛','root'], // 1-4
    '3-1':['固定瓜藤','vine','引蔓、固定瓜藤','vigor'], // 3-1
    '3-2':['摘除側芽','prune','剪掉側芽，保留主蔓','vigor'], // 3-2
    '3-3':['施肥','FZ-3'], '5-1':['授粉方式'], '5-2':['結果蔓摘心','fruitTip','保留結果蔓的葉片，剪掉頂芽','set','tstem'], '5-3':['施肥','FZ-4'], // 5-1～3
    'C-1':['防治：蟲'], 'C-2':['防治：病'], 'C-3':['除草'], 'C-5':['打工'], 'C-6':['補救']
  },
  skipped:{
    '1-3':['沒補苗','空穴沒補，生長勢下降。'],
    '1-4':['沒抓蝸牛','蝸牛啃掉一片葉，下場 Boss 會更難打。'],
    'C-1':['沒處理蟲害','掉一片葉，病毒增加，下階段蟲害也會加重。'],
    'C-2':['沒處理病害','掉一片葉，下階段病害會加重。'],
    'C-3':['沒除草','雜草越多，蟲害增加越多。'],
    'C-5':['這次不打工','這個階段沒有打工收入。'],
  },
  fertilizer:{
    price:40, tolerance:.15,jitter:.10,nMin:8,nMax:15, distractorGap:.30, classicLimit:.5, classicRatio:[.15,.4], classicK:[.6,2.1], // 17列；生成區間暫定
     formulaAttempts:1000, randomP:[1,24], randomK:[1,30], // 生成安全上限（暫定）
    // 15～21列
    multipliers:[[90,1.5],[60,1],[0,.5]],
    allRatios:[['幼苗期',1,1],['生長期',.4,1.2],['抽藤期',.35,1],['授粉期',.3,1],['膨大期',.3,1.4],['硬化期',.35,1.8],['縱網期',.45,2.2],['橫網期',.45,2.6],['入甜期',.45,3]],
    'FZ-1':{ratio:[1,1],bounds:[[.85,1.15],[.85,1.15]],gain:{root:6},classic:{root:-6},mode:'lime/paint',title:'翻土拌肥',hint:'手指掃過畦面，把肥料拌進土裡。',lesson:'基肥三要素差不多一樣多就好，其中磷幫忙發根；磷在土裡不太會跑，所以要在種之前拌進土裡。'}, // FZ-1
    'FZ-3':{ratio:[.35,1],bounds:[[.30,.40],[.85,1.15]],gain:{vigor:6},classic:{disease:6,set:-10},mode:'feed/scale',title:'秤肥配重',hint:'選 1、2、4 單位勺，湊到目標重量再送出。',lesson:'這時候氮的比例是全場最高，但只下氮肥會徒長、節間拉長。'}, // FZ-3
    'FZ-4':{ratio:[.3,1],bounds:[[.26,.35],[.85,1.15]],gain:{set:10},classic:{set:-20},mode:'feed/timing',title:'倒肥停手',hint:'指針落在綠區時按下停手，共 4 次。',lesson:'開花時要把氮壓下來，不然養分都跑去長葉子，花容易掉。'} // FZ-4
  },
  bosses:{
    'B-1':{name:'蝸牛大王',mode:'snail/flash',intro:'嘿嘿，剛種的嫩苗最好吃了。',win:'手電筒太亮了…我的眼睛…',lose:'明天晚上我還會再來～',lesson:'蝸牛晚上才出來，傍晚、晚上巡田最抓得到。',effects:['root','vigor'],hp:{caught:-20,plant:-10,ignored:30}}, // B-1
    'B-3':{name:'徒長藤魔',mode:'bud2/avoid',intro:'藤長越多越好，對吧？',win:'我的側芽…全被剪光了…',lose:'嘿嘿，剩下的藤夠我長了。',lesson:'側芽不剪，養分全被藤搶走，瓜就沒得吃。',effects:['vigor'],hp:{prune:-20,classic:30,correct:-10,heal:10}}, // B-3
    'B-5':{name:'落花風妖',mode:'poll/wire',beeMode:'bee/catch',intro:'花開再多，我一口氣全吹掉。',win:'這朵花…居然坐住了…',lose:'呼～花都被我吹走啦！',lesson:'開花時氮太多、授粉沒做好，花就坐不住。',effects:[],hp:{tip:-10,classic:30,correct:-10}} // B-5
  }
};