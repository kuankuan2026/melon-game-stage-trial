/* 冠冠點陣圖（Claude 2026-11-25 第八版：漁夫帽、圓眼鏡、黑瀏海、橄欖綠 T 恤、舉手打招呼）
 * 尺寸 44×56。格式跟 mascots.js 一樣：每列一個字串，「.」是透明，其他字元對照 GUANGUAN_PALETTE。
 * 外框是深綠色（真人），跟吉祥物的黑框區分。
 * 用法：drawGuanguan(canvas)；CSS 用整數倍放大＋image-rendering: pixelated。 */
const GUANGUAN_PALETTE = {"D": "#2D5E2E", "p": "#F6D2AC", "h": "#B08A5C", "H": "#6E5236", "r": "#EA5A5A", "u": "#2F78B8", "b": "#F2A8A0", "k": "#1F1F1F", "d": "#4A4A4A", "t": "#55704C"};
const GUANGUAN = [
  '............................................',
  '............................................',
  '............................................',
  '...................DDDDDDDDDD...............',
  '.................DDhhhhhhhhhhDD.............',
  '................DhhhhhhhhhhhhhhD............',
  '...............DhhhhhhhhhhhhhhhhD...........',
  '...............DhhhhhhhhhhhhhhhhD...........',
  '...............DhhhhhhhhhhhhhhhhD...........',
  '..............DDDDDDDDDDDDDDDDDDDD..........',
  '........DDDDDDhhHHHHHHHHHHHHHHHHHhDDDDDD....',
  '......DDhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhDD..',
  '.....DhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhD.',
  '......DDhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhDD..',
  '........DDDDDDhhhhhhhhhhhhhhhhhhhhDDDDDD....',
  '..............DDDDDDDDDDDDDDDDDDDD..........',
  '.............kkkkkkkkkkkkkkkkkkkkkk.........',
  '.............kkkkkkkkkkkkkkkkkkkkkk.........',
  '..............kkkkkkkkkkkkkkkkkkkkk.........',
  '..............kkpkkkkpkkkkkkpkkkpkk.........',
  '..............kpppkkpppkkkppppkppDk.........',
  '..............kppdddppppkppdddpppDk.........',
  '..............DpdpkpdddddddpkpdppDDDD.......',
  '.............DppdpkpdpppppdpkpdpppDpD.......',
  '..............DpdpppdpppppdpppdppDpppD......',
  '..............DppdddpppppppdddpppDpppD......',
  '..............DppppppppppppppppppDppD.......',
  '..............DbbpppppppppppppppbbDDD.......',
  '...............DppppDDDDDDDpppppD...........',
  '.......DD.......DpppDrrrrrDppppD............',
  '......DppD.......DpppDrrrDppppD.............',
  '.....DppppD.......DpppDDDppppD..............',
  '.....DppppD........DppppppppD...............',
  '......DppDpD......DDDDppppDDDD..............',
  '.......DDpppD..DDDttttDDDDttttDDD...........',
  '........DppppDDDttttttttttttttttDDD.........',
  '.........DppDtttDttttttttttttttDtttD........',
  '..........DDtttttDttttttttttttDtttttD.......',
  '...........DtttttDttttttttttttDtttttD.......',
  '...........DtttttDttttttttttttDtttttD.......',
  '............DtttDttttttttttttttDtttDpD......',
  '.............DDDttttttttttttttttDDDpppD.....',
  '..............DtttttttttttttttttttDppppD....',
  '..............DtttttttttttttttttttDDpppDD...',
  '..............DDDDDDDDDDDDDDDDDDDDD.DpDppD..',
  '...............DuuuuuuuuuuuuuuuuuD...DppppD.',
  '...............DuuuuuuuuuuuuuuuuuD...DppppD.',
  '...............DuuuuuuuDDuuuuuuuuD....DppD..',
  '...............DDDDDDDDDDDDDDDDDDD.....DD...',
  '.................DuuuuD...DuuuuD............',
  '.................DDDDDD...DDDDDD............',
  '................DHHHHHHD.DHHHHHHD...........',
  '................DHHHHHHD.DHHHHHHD...........',
  '................DDDDDDDD.DDDDDDDD...........',
  '............................................',
  '............................................',
];
function drawGuanguan(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = GUANGUAN[0].length; canvas.height = GUANGUAN.length;
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, canvas.width, canvas.height);
  GUANGUAN.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === ".") return;
    ctx.fillStyle = GUANGUAN_PALETTE[ch]; ctx.fillRect(x, y, 1, 1);
  }));
}
globalThis.GUANGUAN = GUANGUAN; globalThis.GUANGUAN_PALETTE = GUANGUAN_PALETTE; globalThis.drawGuanguan = drawGuanguan;
