MODES.push((() => {

const M = 140, LOBES = 5, NEAR = 0.45, FAR = 30, S = 0.3, GAP = 0.15;
function setup() { F = Math.hypot(W, H) * 0.2; }
const sway = d => [0.3 * Math.sin(d * 0.13), 0.22 * Math.cos(d * 0.1)];

// 깊이 d에서의 별 모양 윤곽 (깊이마다 조금씩 비틀어서 소용돌이가 된다)
function ring(d, z, o, out) {
  const tw = d * 0.09;
  for (let m = 0; m < M; m++) {
    const a = m / M * Math.PI * 2;
    const r = 1 + 0.2 * Math.cos(LOBES * (a + tw)) + 0.04 * Math.cos(LOBES * 2 * (a - tw));
    out[m * 2] = F * (r * Math.cos(a) + o[0]) / z;
    out[m * 2 + 1] = F * (r * Math.sin(a) + o[1]) / z;
  }
}
const A = new Float32Array(M * 2), B = new Float32Array(M * 2);

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
  g.addColorStop(0, '#1b1634'); g.addColorStop(1, '#2d2650');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2);
  ctx.rotate(roll);
  const cam = sway(depth);
  const first = Math.floor((depth + NEAR) / S) + 1, last = Math.floor((depth + FAR) / S);
  for (let i = last; i >= first; i--) {
    // 띠 하나: 깊이 i-GAP ~ i, 사이는 어두운 틈
    const db = i * S, da = Math.max(db - GAP, depth + NEAR);
    if (db - depth <= NEAR) continue;
    const sa = sway(da), sb = sway(db);
    ring(da, da - depth, [sa[0] - cam[0], sa[1] - cam[1]], A);
    ring(db, db - depth, [sb[0] - cam[0], sb[1] - cam[1]], B);
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    for (let m = 1; m < M; m++) ctx.lineTo(A[m * 2], A[m * 2 + 1]);
    ctx.closePath();
    ctx.moveTo(B[0], B[1]);
    for (let m = M - 1; m >= 0; m--) ctx.lineTo(B[m * 2], B[m * 2 + 1]);
    ctx.closePath();
    const f = Math.exp(-(da + db - 2 * depth) / 2 / 14);
    const hue = 330 - ((i * 11) % 150);       // 분홍 ↔ 하늘색 사이를 오가는 그라데이션
    ctx.fillStyle = mixBg(hsl(hue, 0.75, ((i & 1) ? 0.8 : 0.72)), f);
    ctx.fill('evenodd');
  }
}

return { setup, draw };
})());
