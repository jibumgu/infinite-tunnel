MODES.push((() => {

const NR = 56, LEN = 3.6, P = 0.16, D = 6.2;
function setup() { F = Math.min(W, H) * 1.05; }
const radius = y => 0.34 + 0.2 * y * y;

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f4e9f6'); g.addColorStop(1, '#d9e6f7');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2);
  const tilt = 0.28 + 0.1 * Math.sin(depth * 0.2);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const shift = depth / P;
  const j0 = Math.floor(shift - LEN / P) - 1, j1 = Math.ceil(shift + LEN / P) + 1;
  // 줄무늬가 고정된 곡면 위를 미끄러지는 방식이라 끝이 없다
  const rows = [];
  for (let j = j0; j <= j1 + 1; j++) rows.push(j);
  const pts = rows.map(j => {
    const y = (j - shift) * P, r = radius(y), row = [];
    for (let m = 0; m <= NR; m++) {
      const a = m / NR * Math.PI * 2;
      const x0 = r * Math.cos(a), z0 = r * Math.sin(a);
      const x1 = x0 * cr + z0 * sr, z1 = -x0 * sr + z0 * cr;
      const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct + D;
      row.push([F * x1 / z2, F * y2 / z2, z2]);
    }
    return { j, y, row };
  });
  const quads = [];
  for (let q = 0; q < pts.length - 1; q++) {
    const a = pts[q], b = pts[q + 1];
    for (let m = 0; m < NR; m++) {
      const p0 = a.row[m], p1 = a.row[m + 1], p2 = b.row[m + 1], p3 = b.row[m];
      quads.push({ p: [p0, p1, p2, p3], z: (p0[2] + p1[2] + p2[2] + p3[2]) / 4, j: a.j, m, y: (a.y + b.y) / 2 });
    }
  }
  quads.sort((u, v) => v.z - u.z);
  for (const q of quads) {
    const ang = (q.m + 0.5) / NR * Math.PI * 2 + roll;
    const sh = 0.78 + 0.26 * Math.cos(ang - 0.9);
    const t = (q.y / LEN + 1) / 2;
    const c = (q.j & 1) ? hsl(300 - 70 * t, 0.55, 0.9) : hsl(215 + 40 * t, 0.5, 0.74);
    const col = `rgb(${Math.min(255, c[0] * sh) | 0},${Math.min(255, c[1] * sh) | 0},${Math.min(255, c[2] * sh) | 0})`;
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(q.p[0][0], q.p[0][1]);
    for (let n = 1; n < 4; n++) ctx.lineTo(q.p[n][0], q.p[n][1]);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

return { setup, draw };
})());
