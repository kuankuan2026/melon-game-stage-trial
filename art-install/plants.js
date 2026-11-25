/* 植株點陣圖（Claude 2026-11-25 草稿三版：依冠冠回饋改葉柄、之字形瓜藤、摘心前後藤頂）
 * 葉子：心形葉基的凹口接葉柄，葉柄朝向瓜藤；另一端葉尖是尖的。畫的是「長在瓜藤右邊」的葉，
 *   長在左邊時左右鏡射（CSS scaleX(-1) 或程式把每列字串反轉），錨點 x 改成「寬−1−x」。
 *   healthy 健康（葉尖朝右上）、weak 生長勢弱（黃綠、葉尖帶褐、略下垂）、droop 萎垂（葉柄在上，整片往下掛）、small 小葉、large 大葉。
 *   PLANT_LEAF_ANCHOR：葉柄末端（接瓜藤那一格）的座標 [x, y]。
 * 瓜藤：每段高 12 格，節與節之間微微之字形。right／left 兩段交替往上疊：
 *   *_right 由下往右上斜，頂端的節在右，葉長在右側；*_left 相反。卷鬚長在節的另一側。
 *   摘心前最上面 3 節等比例縮短：由下往上用 *_h9、*_h7、*_h5（之字偏移也跟著縮成 2、2、1 格），頂芽接在 h5 那段的節上；
 *   摘心後全部用一般 12 格高的段。
 *   PLANT_STEM_META：bottom＝這段底部中心、node＝頂端節的中心，下一段的 bottom 對齊這一段的 node。
 * 嫩葉（PLANT_LEAF_YOUNG，摘心前才用）：頂芽下方 2 節各 1 片很小的嫩葉。young1 接在頂芽正下方那一節（最小），
 *   young2 接在再下一節（稍大），其他節照常用 PLANT_LEAF。小葉、大葉狀態的嫩葉用 healthy_*；摘心後不用嫩葉，最上面那節接正常葉。
 * 藤頂（PLANT_TOP）：摘心前用 *_bud（頂芽：芽心 2×3、兩側 1×2、頂端 1 格尖點，依冠冠參考）；摘心後用 *_pinched，藤停在最上面那一節、只把頂端封起來，
 *   那一節照常接一片葉子。PLANT_TOP_META.bottom 對齊最上面一段的 node。
 * 格式同 mascots.js：「.」透明，其他字元對照 PLANT_PALETTE。CSS 整數倍放大＋image-rendering: pixelated。 */
const PLANT_PALETTE_BASE = {"k": "#1A1A1A", "G": "#3BB254", "s": "#3D9257", "g": "#A8D175", "y": "#F5F2A3", "Y": "#C9B458", "a": "#AED581", "m": "#8BC34A", "l": "#DCE775"};
const PLANT_LEAF = {
  healthy: [
    '.....kkk............',
    '....kGGGkk..........',
    '...kGGGGGGk.........',
    '..kGGGGGGGGkkkk.....',
    '..kGGGGGGGGGGGGkkkk.',
    '.kGGGGGGgGGGGGGGGgGk',
    '..kGGGGgGGGGGGgggGk.',
    '..kGGGGgGGGgggGGGk..',
    '...kGGGgggggGGGGk...',
    '....kGsgGGGGGGGGk...',
    '...sssGggGGGGGGk....',
    'sss.kGGGGggGGGk.....',
    's...kGGGGGGGGGk.....',
    '....kGGGGGGGGGk.....',
    '....kGGGGGGGGk......',
    '.....kGGGGGGGk......',
    '......kGGGGGk.......',
    '.......kkkkk........'
  ],
  weak: [
    '.........kk..........',
    '.......kkggk.........',
    '......kgggggk........',
    '.....kggggggYk.......',
    '.....kggggggggk......',
    '.....kggggggggk......',
    '.....kggggyggggk.....',
    'ss...kgggyggggggk....',
    '..ssssssyggggggggkk..',
    '.....kggyyyyyyyygggk.',
    '....kgggygggggggyYYYk',
    '....kggggygggggggkkk.',
    '....kgggggyggggkk....',
    '....kggggggggkk......',
    '....kgggggggk........',
    '.....kggggYk.........',
    '......kkggk..........',
    '........kk...........'
  ],
  droop: [
    '..kk.............',
    '...k.............',
    '...kk......kk....',
    '....k....kksskk..',
    '.....k..kssssssk.',
    '.....kkksssssssk.',
    '.....kkkssssssssk',
    '..kkkskkssssssssk',
    '.kssssskGGssssssk',
    '.ksssssGGsGGssssk',
    'kssssssGGssssssk.',
    'ksssssGssGsssssk.',
    'ksssssGsssGssssk.',
    'ksssssssssGGsssk.',
    '.ksssssssssGsssk.',
    '..ksssssssssGssk.',
    '...kkkkkssssGssk.',
    '........kkkssGsk.',
    '...........kkGsk.',
    '.............ksk.',
    '..............k..'
  ],
  small: [
    '.....kk........',
    '....kGGkk......',
    '...kGGGGGkkk...',
    '..kGGGGGGGGGkk.',
    '..kGGGGGGGGGgGk',
    '..kGGGgGggggGk.',
    '...kGgsggGGGk..',
    '...sssggGGGGk..',
    'sss.kGGGGGGk...',
    '....kGGGGGGk...',
    '....kGGGGGk....',
    '.....kGGGGk....',
    '......kkkk.....'
  ],
  large: [
    '.......kkk................',
    '.....kkGGGkk..............',
    '....kGGGGGGGk.............',
    '...kGGGGGGGGGkk...........',
    '..kGGGGGGGGGGGGkkkk.......',
    '..kGGGGGGGGGGGGGGGGkkkkkk.',
    '..kGGGGGGGgGGGGGGGGGGGGGGk',
    '..kGGGGGGGgGGGGGGGGGgggGk.',
    '..kGGGGGGGgGGGGGGGggGGGk..',
    '..kGGGGGGgGGGGGgggGGGGk...',
    '...kGGGGGgGGggggGGGGGk....',
    '....kGGGgGggGGGGGGGGk.....',
    '.....kkssgGGGGGGGGGGk.....',
    '....sssGGGggGGGGGGGk......',
    '.sss..kGGGGGggGGGGk.......',
    's....kGGGGGGGGgGGGk.......',
    '.....kGGGGGGGGGGGGk.......',
    '.....kGGGGGGGGGGGGk.......',
    '......kGGGGGGGGGGk........',
    '......kGGGGGGGGGGk........',
    '.......kGGGGGGGGk.........',
    '........kGGGGGGk..........',
    '.........kkkkkk...........'
  ]
};
const PLANT_LEAF_YOUNG = {
  healthy_young1: [
    '..kkkkk.',
    '.kGGGGgk',
    'kGGgGgGk',
    '.kGsgGk.',
    '..sggGk.',
    '.skGGGk.',
    '...kkk..'
  ],
  healthy_young2: [
    '..kkk......',
    '.kGGGkkkkk.',
    'kGGGGGGGGgk',
    'kGGGgGGggk.',
    'kGGgGggGGk.',
    '.kGsgGGGk..',
    '.sssggGGk..',
    'sskGGGGGk..',
    '..kGGGGGk..',
    '...kGGGk...',
    '....kkk....'
  ],
  weak_young1: [
    '...kk....',
    '..kggk...',
    '.kgggkkk.',
    '.kgyggyyk',
    'ssssyygk.',
    '..kgygk..',
    '..kgggk..',
    '...kkk...'
  ],
  weak_young2: [
    '....kkk.......',
    '...kgggk......',
    '..kgggggk.....',
    '..kgggyggk....',
    '...kgyggggkkk.',
    'sssssyyyyyyygk',
    '...kgyggggkkk.',
    '..kgggyggk....',
    '..kgggggk.....',
    '...kgggk......',
    '....kkk.......'
  ],
  droop_young1: [
    '.....k..',
    '..kkksk.',
    '..kksssk',
    '.kskGssk',
    'kssGGssk',
    '.ksssGsk',
    '..kkksGk',
    '.....kk.'
  ],
  droop_young2: [
    '...k..kkk..',
    '...kkksssk.',
    '..kkksssssk',
    '.ksskkGsssk',
    '.kssGGsGssk',
    'ksssGsGssk.',
    '.kssssGssk.',
    '.ksssssGsk.',
    '..kkkkssGk.',
    '......kkGk.',
    '........k..'
  ]
};
const PLANT_LEAF_YOUNG_ANCHOR = {"healthy_young1": [1, 5], "healthy_young2": [0, 7], "weak_young1": [0, 4], "weak_young2": [0, 5], "droop_young1": [2, 1], "droop_young2": [3, 0]};
const PLANT_LEAF_ANCHOR = {"healthy": [0, 12], "small": [0, 8], "large": [0, 15], "weak": [0, 7], "droop": [2, 0]};
const PLANT_STEM = {
  healthy_right: [
    '......ksssk..',
    '...gg.kgGGk..',
    '...g.ggGGk...',
    '.....kgGGk...',
    '.....kgGGk...',
    '.....kgGGk...',
    '....kgGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '...kgGGk.....',
    '...kgGGk.....'
  ],
  healthy_right_h9: [
    '.....ksssk...',
    '..gg.kgGGk...',
    '..g.g.g.k....',
    '....kgGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '....g.G.k....',
    '...kgGGk.....',
    '...kgGGk.....'
  ],
  healthy_right_h7: [
    '.....ksssk...',
    '..gg.kgGGk...',
    '..g.ggGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '...kgGGk.....',
    '...kgGGk.....'
  ],
  healthy_right_h5: [
    '....ksssk....',
    '.gg.kgGGk....',
    '.g.gg.G.k....',
    '...kgGGk.....',
    '...kgGGk.....'
  ],
  healthy_left: [
    '...ksssk.....',
    '...kgGGk.gg..',
    '....kgGGg.g..',
    '....kgGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '.....kgGGk...',
    '.....kgGGk...',
    '.....kgGGk...',
    '.....kgGGk...',
    '......kgGGk..',
    '......kgGGk..'
  ],
  healthy_left_h9: [
    '...ksssk.....',
    '...kgGGk.gg..',
    '....g.G.g.g..',
    '....kgGGk....',
    '....kgGGk....',
    '....kgGGk....',
    '....k.g.k....',
    '.....kgGGk...',
    '.....kgGGk...'
  ],
  healthy_left_h7: [
    '...ksssk.....',
    '...kgGGk.gg..',
    '....kgGGg.g..',
    '....kgGGk....',
    '....kgGGk....',
    '.....kgGGk...',
    '.....kgGGk...'
  ],
  healthy_left_h5: [
    '...ksssk.....',
    '...kgGGk.gg..',
    '....g.G.g.g..',
    '....kgGGk....',
    '....kgGGk....'
  ],
  weak_right: [
    '......kYk..',
    '...gg.kgk..',
    '...g.ggk...',
    '.....kgk...',
    '.....kgk...',
    '.....kgk...',
    '....kgk....',
    '....kgk....',
    '....kgk....',
    '....kgk....',
    '...kgk.....',
    '...kgk.....'
  ],
  weak_right_h9: [
    '.....kYk...',
    '..gg.kgk...',
    '..g.g.k....',
    '....kgk....',
    '....kgk....',
    '....kgk....',
    '....g.k....',
    '...kgk.....',
    '...kgk.....'
  ],
  weak_right_h7: [
    '.....kYk...',
    '..gg.kgk...',
    '..g.ggk....',
    '....kgk....',
    '....kgk....',
    '...kgk.....',
    '...kgk.....'
  ],
  weak_right_h5: [
    '....kYk....',
    '.gg.kgk....',
    '.g.gg.k....',
    '...kgk.....',
    '...kgk.....'
  ],
  weak_left: [
    '...kYk.....',
    '...kgk.gg..',
    '....kgg.g..',
    '....kgk....',
    '....kgk....',
    '....kgk....',
    '.....kgk...',
    '.....kgk...',
    '.....kgk...',
    '.....kgk...',
    '......kgk..',
    '......kgk..'
  ],
  weak_left_h9: [
    '...kYk.....',
    '...kgk.gg..',
    '....g.g.g..',
    '....kgk....',
    '....kgk....',
    '....kgk....',
    '....k.k....',
    '.....kgk...',
    '.....kgk...'
  ],
  weak_left_h7: [
    '...kYk.....',
    '...kgk.gg..',
    '....kgg.g..',
    '....kgk....',
    '....kgk....',
    '.....kgk...',
    '.....kgk...'
  ],
  weak_left_h5: [
    '...kYk.....',
    '...kgk.gg..',
    '....g.g.g..',
    '....kgk....',
    '....kgk....'
  ]
};
const PLANT_TOP = {
  healthy_bud: [
    '..k...',
    '.klk..',
    '.kaak.',
    'kmaamk',
    'kmaamk',
    '.kGGk.',
    '.kGGk.',
    '.kGGk.',
    '.kGGk.'
  ],
  healthy_pinched: [
    'kkkkk',
    'kGYGk'
  ],
  weak_bud: [
    '..k...',
    '.klk..',
    '.kaak.',
    'kmaamk',
    'kmaamk',
    '.kgkk.',
    '.kgk..',
    '.kgk..',
    '.kgk..'
  ],
  weak_pinched: [
    'kkk',
    'kgk'
  ]
};
const PLANT_TOP_META = {"healthy_bud": {"bottom": [2, 8]}, "healthy_pinched": {"bottom": [2, 1]}, "weak_bud": {"bottom": [2, 8]}, "weak_pinched": {"bottom": [1, 1]}};
const PLANT_STEM_META = {"healthy_right": {"bottom": [5, 11], "node": [8, 0], "leafSide": "right"}, "healthy_right_h9": {"bottom": [5, 8], "node": [7, 0], "leafSide": "right"}, "healthy_right_h7": {"bottom": [5, 6], "node": [7, 0], "leafSide": "right"}, "healthy_right_h5": {"bottom": [5, 4], "node": [6, 0], "leafSide": "right"}, "healthy_left": {"bottom": [8, 11], "node": [5, 0], "leafSide": "left"}, "healthy_left_h9": {"bottom": [7, 8], "node": [5, 0], "leafSide": "left"}, "healthy_left_h7": {"bottom": [7, 6], "node": [5, 0], "leafSide": "left"}, "healthy_left_h5": {"bottom": [6, 4], "node": [5, 0], "leafSide": "left"}, "weak_right": {"bottom": [4, 11], "node": [7, 0], "leafSide": "right"}, "weak_right_h9": {"bottom": [4, 8], "node": [6, 0], "leafSide": "right"}, "weak_right_h7": {"bottom": [4, 6], "node": [6, 0], "leafSide": "right"}, "weak_right_h5": {"bottom": [4, 4], "node": [5, 0], "leafSide": "right"}, "weak_left": {"bottom": [7, 11], "node": [4, 0], "leafSide": "left"}, "weak_left_h9": {"bottom": [6, 8], "node": [4, 0], "leafSide": "left"}, "weak_left_h7": {"bottom": [6, 6], "node": [4, 0], "leafSide": "left"}, "weak_left_h5": {"bottom": [5, 4], "node": [4, 0], "leafSide": "left"}};
// 附加狀態（2026-11-25 草稿一版）：咬痕葉、病斑葉、折藤、缺株、雌花、小瓜
//  leaf_bitten_*：葉緣被蝸牛咬掉兩口；leaf_spotted_*：白粉病粉斑；錨點同 PLANT_LEAF_ANCHOR 的意思（葉柄接藤處）
//  broken_branch：折斷下垂的枯藤，錨點＝斷口，接在斷掉的那個節上，留到採收
//  missing_hole：缺株的空植穴，錨點＝底部中心；flower_female：雌花，錨點＝花梗末端；fruit_small：著果後的小瓜（T 字果梗），錨點＝果梗頂端
const PLANT_EXTRA = {
  leaf_bitten_healthy: [
    '.....kkk............',
    '....kGGGkk..........',
    '...kGGGGGGk.........',
    '....kGGGGGGkkkk.....',
    '.....kGGGGGGGGGkkkk.',
    '.....kGGgGGGGGGGGgGk',
    '.....kGgkkGGGGgkkkk.',
    '....kGknkGGgggk.....',
    '...kGGGkkgggGGk.....',
    '....kGsgGGkkGk......',
    '...sssGggGknkGk.....',
    'sss.kGGGGkkGGGk.....',
    's...kGGGGGGGGGk.....',
    '....kGGGGGGGGGk.....',
    '....kGGGGGGGGk......',
    '.....kGGGGGGGk......',
    '......kGGGGGk.......',
    '.......kkkkk........'
  ],
  leaf_spotted_healthy: [
    '.....kkk............',
    '....kGGGkk..........',
    '...kGGGGGGk.........',
    '..kGGnGGGGGkkkk.....',
    '..kGnwnGGGGGnGGkkkk.',
    '.kGGGnGGgGGnwnGGGgGk',
    '..kGGGGgGGGGnGgggGk.',
    '..kGGGGgGGGgggGGGk..',
    '...kGGGggnggGGGGk...',
    '....kGsgnwnGGGGGk...',
    '...sssGggnGGGGGk....',
    'sss.kGGGGggGGGk.....',
    's...kGGGGGGnGGk.....',
    '....kGGGGGnwnGk.....',
    '....kGGGGGGnGk......',
    '.....kGGGGGGGk......',
    '......kGGGGGk.......',
    '.......kkkkk........'
  ],
  leaf_spotted_severe_healthy: [
    '.....kkk............',
    '....knnnkk..........',
    '...kwnnnnwk.........',
    '..kGwwnnwwnkkkk.....',
    '..kwwwwwwwnnnnwkkkk.',
    '.kwwnnwwnwwnwwwnngnk',
    '..knnnnnwwwwwGnggnk.',
    '..kwnnnnnnngnnwwwk..',
    '...kwwwnggggwwnnk...',
    '....kwsnwnnwwnnnk...',
    '...ssswnnwwwwwnk....',
    'sss.kwwnngnGwwk.....',
    's...kwnnnnwwwnk.....',
    '....kwwnnnwnnnk.....',
    '....kwwwwwwwnk......',
    '.....knwwGwwnk......',
    '......knwwwwk.......',
    '.......kkkkk........'
  ],
  leaf_bitten_weak: [
    '.........kk..........',
    '.......kkggk.........',
    '......kgggggk........',
    '.......kgggk.........',
    '........kggk.........',
    '........kggk.........',
    '........kgygk........',
    'ss.....kgygggkkkk....',
    '..ssskksyggkkggggkk..',
    '.....kggkkyyknkygggk.',
    '....kgknkgggkkggyYYYk',
    '....kggkkygggggggkkk.',
    '....kgggggyggggkk....',
    '....kggggggggkk......',
    '....kgggggggk........',
    '.....kggggYk.........',
    '......kkggk..........',
    '........kk...........'
  ],
  leaf_spotted_weak: [
    '.........kk..........',
    '.......kkggk.........',
    '......kggnggk........',
    '.....kggnwngYk.......',
    '.....kgggnggggk......',
    '.....kggggggngk......',
    '.....kggggynwngk.....',
    'ss...kgggyggngggk....',
    '..ssssssygggggggnkk..',
    '.....kggyyyyyyynwngk.',
    '....kgggygggggggnYYYk',
    '....kgggnygggggggkkk.',
    '....kggnwnyggggkk....',
    '....kgggnggggkk......',
    '....kgggggggk........',
    '.....kggggYk.........',
    '......kkggk..........',
    '........kk...........'
  ],
  leaf_spotted_severe_weak: [
    '.........kk..........',
    '.......kkwwk.........',
    '......knnwwnk........',
    '.....knnwwnnnk.......',
    '.....kwwwwnnnnk......',
    '.....kwwgwwnwwk......',
    '.....knwwwywwgwk.....',
    'ss...knwnynnwwwwk....',
    '..ssssssynnnwwnnwkk..',
    '.....kgwnyynnyyynwwk.',
    '....kwwwnwwwwwnnywnnk',
    '....kwwnnywgwwwwwkkk.',
    '....kwnnnnnwwnwkk....',
    '....kwwnnnwnnkk......',
    '....kwwwwwwwk........',
    '.....knwwgwk.........',
    '......kkwwk..........',
    '........kk...........'
  ],
  leaf_bitten_small: [
    '.....kk........',
    '....kGGkk......',
    '...kGkkGGkkk...',
    '....kGknkGGGkk.',
    '.....kGkGGGGgGk',
    '....kGgGggggGk.',
    '...kGgsgkGGGk..',
    '...sssgkkGkkk..',
    'sss.kGknGk.....',
    '....kGkGGk.....',
    '....kGGGGk.....',
    '.....kGGGGk....',
    '......kkkk.....'
  ],
  leaf_spotted_small: [
    '.....kk........',
    '....kGGkk......',
    '...kGGnGGkkk...',
    '..kGGnwnGGGGkk.',
    '..kGGGnGGGnGgGk',
    '..kGGGgGgnwnGk.',
    '...kGgsggGnGk..',
    '...sssggGGGGk..',
    'sss.kGGnGGGk...',
    '....kGnwnGGk...',
    '....kGGnGGk....',
    '.....kGGGGk....',
    '......kkkk.....'
  ],
  leaf_spotted_severe_small: [
    '.....kk........',
    '....knnkk......',
    '...kwnnnnkkk...',
    '..kGwwnnwwnnkk.',
    '..kwwwwwwwnngnk',
    '..kwnnnwnnngwk.',
    '...kngsnnwwwk..',
    '...sssgnnnnnk..',
    'sss.kwwwnnnk...',
    '....kwGwwnnk...',
    '....kwwwwwk....',
    '.....kwnnwk....',
    '......kkkk.....'
  ],
  leaf_bitten_large: [
    '.......kkk................',
    '.....kkGGGkk..............',
    '....kGGGGGGGk.............',
    '...kGGGGGGGGGkk...........',
    '...kkGGGGGGGGGGkkkk.......',
    '.....kGGGkkGGGGGGGGkkkkkk.',
    '.....kGknkgGGGGGGGGGGGGGGk',
    '......kGkkgGGGGGGGGGgggGk.',
    '.....kGGGGgGGGGGGGggGGGk..',
    '.....kGGGgGGGGGgggGGGGk...',
    '...kkGGGGgGGggggGGGGGk....',
    '....kGGGgGggGGGGGGGGk.....',
    '.....kkssgGGkkGGGGGGk.....',
    '....sssGGGggGknkGkkk......',
    '.sss..kGGGGGgkkGk.........',
    's....kGGGGGGGGgk..........',
    '.....kGGGGGGGGGk..........',
    '.....kGGGGGGGGGk..........',
    '......kGGGGGGGGGk.........',
    '......kGGGGGGGGGGk........',
    '.......kGGGGGGGGk.........',
    '........kGGGGGGk..........',
    '.........kkkkkk...........'
  ],
  leaf_spotted_large: [
    '.......kkk................',
    '.....kkGGGkk..............',
    '....kGGGGGGGk.............',
    '...kGGGGnGGGGkk...........',
    '..kGGGGnwnGGGGGkkkk.......',
    '..kGGGGGnGGGGGGnGGGkkkkkk.',
    '..kGGGGGGGgGGGnwnGGGGGGGGk',
    '..kGGGGGGGgGGGGnGGGngggGk.',
    '..kGGGGGGGgGGGGGGGnwnGGk..',
    '..kGGGGGGgGGGGGgggGnGGk...',
    '...kGGGGGgGGggggGGGGGk....',
    '....kGGGgGgnGGGGGGGGk.....',
    '.....kkssgnwnGGGGGGGk.....',
    '....sssGGGgnGGGGGGGk......',
    '.sss..kGGGGGggGGGGk.......',
    's....kGGGGGGGGgGGGk.......',
    '.....kGGGGnGGGGGGGk.......',
    '.....kGGGnwnGGGGGGk.......',
    '......kGGGnGGGGGGk........',
    '......kGGGGGGGGGGk........',
    '.......kGGGGGGGGk.........',
    '........kGGGGGGk..........',
    '.........kkkkkk...........'
  ],
  leaf_spotted_severe_large: [
    '.......kkk................',
    '.....kknwwkk..............',
    '....knnnnwwnk.............',
    '...kwwnnwwnnnkk...........',
    '..kwwwwwwwnnnnwkkkk.......',
    '..kwnnwwGwwnwwwnnnnkkkkkk.',
    '..knnnnwwwgwwGwwnnwwnnnnwk',
    '..kwnnnwnngnwwwwwwwwgggnk.',
    '..kwwwwwnngnwwnnwwnnwwwk..',
    '..knwwGwwgnwwnnggnwwwwk...',
    '...knwwwwnwwngggnwnnnk....',
    '....kwwngwnnwwwwwwnnk.....',
    '.....kkssgwwwnwwGwwnk.....',
    '....sssnnnngnnnwwwwk......',
    '.sss..kwwwwwggnwwnk.......',
    's....knwwGwwnnnwnnk.......',
    '.....knnwwwwwwwwwnk.......',
    '.....knnwwnnnwwwwwk.......',
    '......kwwwnnnwwwnk........',
    '......kwwwnnnwwnnk........',
    '.......kwwwwwwwnk.........',
    '........knnwwGwk..........',
    '.........kkkkkk...........'
  ],
  broken_branch: [
    'kkk.................',
    'kyyk................',
    'kkdkk...............',
    '.kkdkkk.............',
    '..kkddk...k.........',
    '...kkkkkkkdkk.......',
    '.....dTkdddddk......',
    '.....kkTdddddk......',
    '.....kddTYYddk......',
    '....kdddYYddk.......',
    '....kdddYYYddk......',
    '....kdddddYddk......',
    '.....kdddddYYk......',
    '......kkkkkdYk..k...',
    '..........kkkkkkdkk.',
    '...........kTkdddddk',
    '............kTdddddk',
    '...........kddTYYddk',
    '..........kdddYYddk.',
    '..........kdddYYYddk',
    '..........kdddddYddk',
    '...........kdddddYYk',
    '............kkkkkdYk',
    '.................kk.'
  ],
  missing_hole: [
    '......kkkkkk......',
    '..kkkttttttttdkk..',
    'kktdtttTTTTtttttkk',
    'kttttTTTTTTTTttttk',
    'kktttTTTTTTTTtttkk',
    '..kkkttttttttkkk..',
    '......kkkkkk......'
  ],
  flower_female: [
    '.....kk.....',
    '....kffk....',
    '..kkffffkk..',
    '.kffffffffk.',
    'kffffffffffk',
    'kffffFFffffk',
    'kfffFFFFfffk',
    '.kfffFFfffk.',
    '.kffffffffk.',
    '.kffffffffk.',
    '..kffaaffk..',
    '...kaaaak...',
    '...kaaaak...',
    '....kaak....',
    '.....ss.....',
    '.....ss.....'
  ],
  fruit_small: [
    '..kkkkkkk...',
    '.ksssssssk..',
    '.ksssssssk..',
    '..kkksskk...',
    '....kssk....',
    '....kssk....',
    '...kaaaak...',
    '..kaaaaaak..',
    '.kaanaaaaak.',
    '.kawaaanaak.',
    'kaaaaaaaaaak',
    'kaaaaaaaaaak',
    'kaaaanaaaaak',
    '.kaaaaanaak.',
    '.kaanaaaaak.',
    '..kaaaaaak..',
    '...kaaaak...',
    '....kkkk....'
  ]
};
const PLANT_EXTRA_ANCHOR = {"leaf_bitten_healthy": [0, 12], "leaf_spotted_healthy": [0, 12], "leaf_bitten_weak": [0, 7], "leaf_spotted_weak": [0, 7], "leaf_bitten_small": [0, 8], "leaf_spotted_small": [0, 8], "leaf_bitten_large": [0, 15], "leaf_spotted_large": [0, 15], "leaf_spotted_severe_healthy": [0, 12], "leaf_spotted_severe_weak": [0, 7], "leaf_spotted_severe_small": [0, 8], "leaf_spotted_severe_large": [0, 15], "broken_branch": [1, 1], "missing_hole": [9, 6], "flower_female": [5, 15], "fruit_small": [5, 0]};
const PLANT_PALETTE = Object.assign({}, PLANT_PALETTE_BASE, {"w": "#FFFFFF", "n": "#DDECB3", "t": "#8B6B3D", "T": "#5E4528", "F": "#FABF0D", "f": "#FAC93C", "d": "#B8A56A"});
function drawPlantSprite(canvas, rows, flip = false) {
  const ctx = canvas.getContext("2d");
  canvas.width = rows[0].length; canvas.height = rows.length;
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, canvas.width, canvas.height);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === ".") return;
    ctx.fillStyle = PLANT_PALETTE[ch]; ctx.fillRect(flip ? row.length - 1 - x : x, y, 1, 1);
  }));
}
Object.assign(globalThis, { PLANT_PALETTE, PLANT_LEAF, PLANT_LEAF_ANCHOR, PLANT_LEAF_YOUNG, PLANT_LEAF_YOUNG_ANCHOR, PLANT_STEM, PLANT_STEM_META, PLANT_TOP, PLANT_TOP_META, PLANT_EXTRA, PLANT_EXTRA_ANCHOR, drawPlantSprite });
