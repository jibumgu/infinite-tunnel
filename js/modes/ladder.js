MODES.push((() => {
const PITCH = 1.3, HUE = u => 255 + 70 * Math.sin(u * 0.22);
const LAYERS = [
  { s: 0.5, sp: -0.6, ox: -0.22, oy: -0.2, a: 0.55 },
  { s: 1, sp: 1, ox: 0, oy: 0, a: 1 },
  { s: 1.5, sp: 1.6, ox: 0.3, oy: 0.34, a: 0.95 },
];
let U = 1;
function setup() { U = Math.min(W, H) * 0.12; }
const C30 = 0.866, S30 = 0.5;
function box(u0, u1, v0, v1, w0, w1, hue, k) {
  const P = (u, v, w) => [(u + v) * C30 * k, (v - u) * S30 * k - w * k];
  const face = (pts, c) => {
    ctx.fillStyle = c; ctx.strokeStyle = c;
    ctx.beginPath();
    pts.forEach((p, n) => n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  face([P(u0, v1, w0), P(u1, v1, w0), P(u1, v1, w1), P(u0, v1, w1)], rgb(hsl(hue, 0.55, 0.7)));
  face([P(u0, v0, w0), P(u0, v1, w0), P(u0, v1, w1), P(u0, v0, w1)], rgb(hsl(hue, 0.55, 0.52)));
  face([P(u0, v0, w1), P(u1, v0, w1), P(u1, v1, w1), P(u0, v1, w1)], rgb(hsl(hue + 10, 0.6, 0.9)));
}
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f4e9f6'); g.addColorStop(1, '#d9e6f7');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const L of LAYERS) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(W / 2 + L.ox * W, H / 2 + L.oy * H);
    ctx.rotate(roll * (0.6 + 0.4 * L.sp));
    ctx.globalAlpha = L.a;
    ctx.lineWidth = 1; ctx.lineJoin = 'round';
    const k = U * L.s, off = depth * L.sp * PITCH;
    const c0 = Math.floor(off / PITCH);
    const R = 11 / Math.min(1, L.s * 1.1);
    const n0 = Math.floor(-R / PITCH) - 1, n1 = Math.ceil(R / PITCH) + 1;
    ctx.translate(0, 0);
    const V0 = 0.3, V1 = 2.1, VT = 2.4, T = 0.3, vc = VT / 2;
    // 앞뒤로 쌓이는 순서: 큰 u(먼 쪽)부터 그린다
    const items = [];
    for (let n = n1; n >= n0; n--) {
      const uw = (n + c0) * PITCH - off + 0;
      const u = (n) * PITCH - (off - c0 * PITCH);
      items.push({ u, world: (n + c0) * PITCH });
    }
    // 불가능한 사다리: 홀수 칸은 가로대가 두 레일 사이에서 앞뒤가 뒤집힌 채 엮인다 (펜로즈식 착시)
    for (let n = n1; n >= n0; n--) {
      const u = n * PITCH - (off - c0 * PITCH), world = (n + c0) * PITCH, hue = HUE(world);
      const odd = (n + c0) & 1;
      const back = () => box(u - PITCH / 2, u + PITCH / 2, 0 - vc, 0.3 - vc, 0, T, hue, k);
      const front = () => box(u - PITCH / 2, u + PITCH / 2, V1 - vc, VT - vc, 0, T, hue, k);
      const P = (uu, vv) => [(uu + vv - vc) * C30 * k, (vv - vc - uu) * S30 * k];
      const gap = () => {
        const a = P(u - PITCH / 2, V0), b = P(u + PITCH / 2, V0), c = P(u + PITCH / 2, V1), d = P(u - PITCH / 2, V1);
        const col = `hsl(${hue + 20},80%,90%)`;
        ctx.fillStyle = col; ctx.strokeStyle = col;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
      };
      const rung = () => box(u - 0.2, u + 0.2, 0.12 - vc, VT - 0.12 - vc, 0, T, hue, k);
      if (odd) { front(); gap(); rung(); back(); }
      else { back(); gap(); rung(); front(); }
    }
  }
  ctx.globalAlpha = 1;
}
return { setup, draw };
})());
