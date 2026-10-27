// 버전 전환 버튼, 상태 저장, 시작
const NAMES = ['체크 터널', '별 터널', '모래시계', '계단', '사다리'];
const bar = document.getElementById('modes');
NAMES.forEach((n, i) => {
  const b = document.createElement('button');
  b.textContent = i + 1; b.title = n; b.setAttribute('aria-label', n);
  b.addEventListener('click', () => setMode(i));
  b.addEventListener('keydown', e => e.stopPropagation());
  bar.appendChild(b);
});
const STATE = MODES.map(() => ({ d: 0, dT: 0, r: 0, rT: 0, f: 0, fT: 0 }));
function setMode(i) {
  const o = STATE[mode];
  o.d = depth; o.dT = depthT; o.r = roll; o.rT = rollT; o.f = fv; o.fT = fvT;
  mode = i;
  const n = STATE[mode];
  depth = n.d; depthT = n.dT; roll = n.r; rollT = n.rT; fv = n.f; fvT = n.fT;
  [...bar.children].forEach((b, n) => b.classList.toggle('on', n === i));
  try { localStorage.setItem('tunnel-mode', i); } catch (e) {}
  MODES[mode].setup();
  draw();
  go();
}
addEventListener('keydown', e => { if (e.key >= '1' && e.key <= '5') setMode(+e.key - 1); });
try { const m = +localStorage.getItem('tunnel-mode'); if (m >= 0 && m < MODES.length) mode = m; } catch (e) {}
addEventListener('resize', resize);
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();
setMode(mode);
