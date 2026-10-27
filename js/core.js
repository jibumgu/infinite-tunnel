// 공용 상태, 그리기 도구, 입력(휠/터치/키보드). 각 버전(js/modes/*.js)이 MODES에 등록된다.
const cv = document.getElementById('stage');
const ctx = cv.getContext('2d');
const BG = [42, 36, 70];
const mixBg = (c, f) => `rgb(${(c[0] * f + BG[0] * (1 - f)) | 0},${(c[1] * f + BG[1] * (1 - f)) | 0},${(c[2] * f + BG[2] * (1 - f)) | 0})`;
function hsl(h, s, l) {   // 0-360, 0-1, 0-1 -> [r,g,b]
  h = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255; };
  return [f(0), f(8), f(4)];
}

let W = 0, H = 0, F = 1, dpr = 1;
let depth = 0, depthT = 0;   // 앞뒤로 나아간 거리 (끝없음)
let roll = 0, rollT = 0;     // 좌우로 돌린 각도 (끝없음)
let running = false;
let mode = 0;
let fv = 0, fvT = 0;        // 계단 버전의 시야각 (로그 단위, +면 넓게)
const MODES = [];

function draw() { MODES[mode].draw(); }
function resize() {
  const vv = window.visualViewport;
  dpr = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.75 : 2);
  W = Math.max(1, Math.round(vv ? vv.width : innerWidth));
  H = Math.max(1, Math.round(vv ? vv.height : innerHeight));
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  MODES[mode].setup();
  draw();
}
function tick() {
  depth += (depthT - depth) * 0.14;
  roll += (rollT - roll) * 0.14;
  fv += (fvT - fv) * 0.14;
  MODES[mode].draw();
  if (Math.abs(depthT - depth) > 0.0005 || Math.abs(rollT - roll) > 0.00005 || Math.abs(fvT - fv) > 0.0005) requestAnimationFrame(tick);
  else { depth = depthT; roll = rollT; fv = fvT; running = false; MODES[mode].draw(); }
}
function go() { if (!running) { running = true; requestAnimationFrame(tick); } }
const clampFv = v => Math.max(-0.7, Math.min(1.1, v));
function moveBy(dx, dy) {
  depthT += dy * 0.004;
  if (mode === 3) fvT = clampFv(fvT + dx * 0.0016);   // 계단: 좌우 = 시야 좁히기/넓히기
  else rollT += dx * 0.0016;
  go();
}

addEventListener('wheel', e => { e.preventDefault(); moveBy(e.deltaX || 0, e.deltaY || 0); }, { passive: false });
// 터치: 한 손가락 드래그 = 휠과 같은 이동, 손을 떼면 관성으로 부드럽게 이어진다
const TOUCH = 1.6;
let tx = 0, ty = 0, tt = 0, tvx = 0, tvy = 0, dragging = false, inertia = 0;
const onBar = e => e.target.closest && e.target.closest('#modes');
function stopInertia() { cancelAnimationFrame(inertia); inertia = 0; }
function glide() {
  tvx *= 0.94; tvy *= 0.94;
  if (Math.abs(tvx) + Math.abs(tvy) < 0.02) { inertia = 0; return; }
  moveBy(-tvx * 16 * TOUCH, -tvy * 16 * TOUCH);
  inertia = requestAnimationFrame(glide);
}
addEventListener('touchstart', e => {
  stopInertia();
  if (onBar(e)) { dragging = false; return; }
  dragging = e.touches.length === 1;
  if (dragging) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = e.timeStamp; tvx = tvy = 0; }
}, { passive: true });
addEventListener('touchmove', e => {
  e.preventDefault();
  if (!dragging || e.touches.length !== 1) return;
  const t = e.touches[0], dt = Math.max(1, e.timeStamp - tt);
  const dx = t.clientX - tx, dy = t.clientY - ty;
  moveBy(-dx * TOUCH, -dy * TOUCH);
  tvx = tvx * 0.6 + (dx / dt) * 0.4; tvy = tvy * 0.6 + (dy / dt) * 0.4;
  tx = t.clientX; ty = t.clientY; tt = e.timeStamp;
}, { passive: false });
const endTouch = e => {
  // 손가락이 멈춘 채로 떼면 관성 없이 그대로 멈춘다
  if (dragging && e.touches.length === 0 && e.timeStamp - tt < 120) inertia = requestAnimationFrame(glide);
  dragging = false;
};
addEventListener('touchend', endTouch, { passive: true });
addEventListener('touchcancel', () => { dragging = false; stopInertia(); }, { passive: true });
addEventListener('keydown', e => {
  const step = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
  if (!step) return;
  e.preventDefault();
  if (step[1]) depthT -= step[1] * 0.5;
  if (step[0]) { if (mode === 3) fvT = clampFv(fvT + step[0] * 0.15); else rollT += step[0] * (Math.PI / 12); }
  go();
});
