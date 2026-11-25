/* 農夫冠冠・v2 角色重畫
 * 44×56，深色外框。
 * 每列一個字串，每個字元一格。「.」透明，其他字元對照 GUANGUAN_PALETTE。
 * 用法：drawGuanguan(canvas)。CSS 用整數倍放大＋image-rendering: pixelated。 */
const GUANGUAN_PALETTE = {"k": "#232824", "d": "#35322C", "D": "#4B533B", "o": "#65734A", "t": "#7B8959", "L": "#99A16D", "H": "#786246", "h": "#A6885D", "a": "#C8AE83", "A": "#E2CBA1", "P": "#D29171", "p": "#EDB18D", "f": "#FFD2AA", "b": "#EC9A8C", "u": "#304F66", "U": "#426985", "C": "#678DA3", "s": "#634534", "S": "#8C664B", "w": "#FFF9ED"};
const GUANGUAN = [
  "............................................",
  "...................kkkkkk...................",
  "................kkkaaaaaakkk................",
  "..............kkaaaaaaaaaaaakk..............",
  ".............kAaaaaaaaaaaaaaahk.............",
  ".............kaaaaaaaaaaaaaaahk.............",
  "............kAaaaaaaaaaaaaaaahhk............",
  "............kaaaaSHHHHHHHHSaahhk............",
  "............kahHHHHHHHHHHHHHHhhk............",
  "...........kSHHHhhhhhhhhhhhhHHHHk...........",
  "...........kaHHhaaaLtDDtLaaahHHSk...........",
  "...........kaaaaHHHHHHHHHHHaaahHk...........",
  "..........kaaaHHkkkkkkkkkkkHHHahhk..........",
  ".........kaaHHdkkkkkkkdkkkkkkdHHhhk.........",
  "........kAHHkkkdkkshkkddSkkkkkkkHHak........",
  ".......kDHSkkkdSkkdpskkkPkkkkdkkkHHDk.......",
  "......kdSSdkdkkpfhHhfSPhSHfaSkkdkkSSdk......",
  "......kSSSHsdkSfdddPaffffdddfpkddSSSSk......",
  "......kSSSSsHkfdwkwdffffdwkwdfkHsSSSSk......",
  ".......kSSSAhkdfwkkfddddfwkkfdkhAHSSk.......",
  "........kSSphddfwkwfdffdfwkwfddSpSHk........",
  ".........kkkpPbffwffdpfdffwffbPpkkk.........",
  "............kkbbdfddffPfddfdbbkk............",
  "..............kfffffdffdfffffk..............",
  ".........k.....kfffffddfffffk...............",
  "........kfk.....kkffffffffkk................",
  "........kfpkk.....kshhhhsk..................",
  ".......kkffkhk.....ksbbSkk..................",
  ".......kSpffk....kkoDShDook.................",
  "........kkffk...ktttooootttk................",
  ".........kafk..kttttttttttttk...............",
  "..........kffkktttttttttttottk..............",
  "...........kffkttDttttttttottk..............",
  "...........kffaDootttttttttDttk.............",
  "............kfpHDttttttttttdttk.............",
  "............kkkkdttttttttttdoDk.............",
  "...............kkttttttttttdHpk.............",
  "................kttttttttttDbfk.............",
  "................kttttttttttoSfk.............",
  "................ktttttttttttdfk.............",
  "................ktttttttttttkffk............",
  "................kotttttttttDkffk............",
  "................kuddDDDDdddkHHpk............",
  "................kUUUUUUUUUUkkkak............",
  "................kUUUUkkUUUUk.kk.............",
  "................kUUUUkuUUUUk................",
  "................kUUUUkkUUUUk................",
  "................kUUUUdkUUUUk................",
  ".................kUUUk.kUUUk................",
  ".................kUUuk.kUUUk................",
  "................kUUuuk.kuUUk................",
  "................kkkduk.kudkk................",
  "...............kssssk..kssssk...............",
  "...............ksssdk..kdsssk...............",
  "...............kkkkkk...kkkkk...............",
  "............................................"
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
