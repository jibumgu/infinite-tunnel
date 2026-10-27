MODES.push((() => {

const N = 8, NEAR = 0.25, FAR = 40;
function setup() { F = Math.hypot(W, H) * 0.25; }

// 터널이 구불구불 휘어서, 가까운 곳은 크게 / 먼 곳은 작게 흔들린다 (시차)
const sway = d => [0.32 * Math.sin(d * 0.15), 0.22 * Math.cos(d * 0.11)];

function pt(k, u, z, o) {
  let x, y;
  if (k === 0) { x = 1; y = u; } else if (k === 1) { x = -u; y = 1; }
  else if (k === 2) { x = -1; y = -u; } else { x = u; y = -1; }
  return [F * (x + o[0]) / z, F * (y + o[1]) / z];
}

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
  g.addColorStop(0, '#1c1736'); g.addColorStop(1, '#2a2446');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2);
  ctx.rotate(roll);
  ctx.lineWidth = 1; ctx.lineJoin = 'round';
  const cam = sway(depth);
  const first = Math.floor(depth + NEAR) + 1, last = Math.floor(depth + FAR);
  for (let i = last; i >= first; i--) {
    const zb = i - depth;
    if (zb <= NEAR) continue;
    const da = Math.max(i - 1, depth + NEAR), za = da - depth;
    const sa = sway(da), sb = sway(i);
    const oa = [sa[0] - cam[0], sa[1] - cam[1]], ob = [sb[0] - cam[0], sb[1] - cam[1]];
    const f = Math.exp(-(za + zb) / 2 / 13);
    const hue = 330 - (i * 7) % 360;                    // 깊이에 따라 분홍 → 보라 → 하늘 → 민트로 흐르는 그라데이션
    for (let k = 0; k < 4; k++) {
      for (let j = 0; j < N; j++) {
        const u0 = -1 + 2 * j / N, u1 = -1 + 2 * (j + 1) / N;
        const p0 = pt(k, u0, za, oa), p1 = pt(k, u1, za, oa), p2 = pt(k, u1, zb, ob), p3 = pt(k, u0, zb, ob);
        const c = ((i + j) & 1) ? hsl(hue, 0.7, 0.8) : hsl(hue + 35, 0.6, 0.94);
        const col = mixBg(c, f);
        ctx.fillStyle = col; ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
  }
}

return { setup, draw };
})());
