MODES.push((() => {
const S = 0.5, HS = 0.17, EYE = 1.5, NEAR = 0.45, FAR = 30, HW = 1.3, COLS = 12;
let base = 1;
function setup() { base = Math.min(W, H) * 0.9; }
// 계단이 좌우로 구불거리고(시차), 폭이 숨쉬듯 변하며, 표면이 울퉁불퉁하게 일렁인다
const sw = d => 0.45 * Math.sin(d * 0.16) + 0.2 * Math.sin(d * 0.37);
const hw = i => HW * (1 + 0.16 * Math.sin(i * 0.23));
const bump = (x, i) => 0.075 * Math.sin(2.6 * x + i * 0.9) + 0.04 * Math.sin(5.1 * x - i * 0.5);
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1634'); g.addColorStop(1, '#2d2650');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  F = base * Math.exp(-fv);
  const slope = HS / S;
  ctx.translate(W / 2, H * 0.3);
  ctx.rotate(roll);
  ctx.lineWidth = 1; ctx.lineJoin = 'round';
  const camH = depth * slope + EYE, camX = sw(depth);
  const sy = (h, z) => F * (camH - h) / z + F * slope;
  const sx = (x, d, z) => F * (x + sw(d) - camX) / z;
  const first = Math.floor((depth + NEAR) / S) - 1, last = Math.floor((depth + FAR) / S);
  for (let i = last; i >= first; i--) {
    const hue = 330 - ((i * 9) % 150);
    const d0 = i * S, d1 = d0 + S, z0 = d0 - depth, z1 = d1 - depth;
    const f = Math.exp(-(z0 + 0.5) / 12);
    const w = hw(i), wp = hw(i - 1);
    for (let c = 0; c < COLS; c++) {
      const xa = -1 + 2 * c / COLS, xb = -1 + 2 * (c + 1) / COLS;
      const chk = (c + i) & 1;                    // 체크무늬 패턴 (카페월 착시처럼 층마다 어긋난다)
      if (z1 > NEAR) {   // 디딤판
        const za = Math.max(z0, NEAR), tN = (za - z0) / S;
        const xa0 = xa * w, xb0 = xb * w;
        const ha = i * HS + bump(xa * w, i), hb = i * HS + bump(xb * w, i);
        const hc = i * HS + bump(xa * w, i + 1), hd = i * HS + bump(xb * w, i + 1);
        ctx.fillStyle = ctx.strokeStyle = mixBg(hsl(hue, 0.6, chk ? 0.95 : 0.86), f);
        ctx.beginPath();
        ctx.moveTo(sx(xa0, d0 + tN * S, za), sy(ha, za)); ctx.lineTo(sx(xb0, d0 + tN * S, za), sy(hb, za));
        ctx.lineTo(sx(xb0, d1, z1), sy(hd, z1)); ctx.lineTo(sx(xa0, d1, z1), sy(hc, z1));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (z0 > NEAR) {   // 챌판
        const xa0 = xa * w, xb0 = xb * w;
        const lo = (x, ww) => (i - 1) * HS + bump(x * ww, i - 1);
        const hi = (x, ww) => i * HS + bump(x * ww, i);
        ctx.fillStyle = ctx.strokeStyle = mixBg(hsl(hue + 20, 0.5, chk ? 0.44 : 0.58), f);
        ctx.beginPath();
        ctx.moveTo(sx(xa0, d0, z0), sy(lo(xa, wp), z0)); ctx.lineTo(sx(xb0, d0, z0), sy(lo(xb, wp), z0));
        ctx.lineTo(sx(xb0, d0, z0), sy(hi(xb, w), z0)); ctx.lineTo(sx(xa0, d0, z0), sy(hi(xa, w), z0));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
  }
}
return { setup, draw };
})());
