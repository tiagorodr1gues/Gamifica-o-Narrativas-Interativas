(function () {
  const PQ = window.PQ = window.PQ || {};
  const nf = PQ.calc.nf;
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, anchor) { const t = el('text', { x, y, 'font-size': 11, fill: 'var(--mute)', 'text-anchor': anchor || 'start' }, parent); t.textContent = s; return t; }
  const dec = (mx) => mx >= 1000 ? 0 : mx >= 10 ? 1 : 2;

  function candles(host, cs, o) {
    host.innerHTML = '';
    if (cs.length < 3) { host.innerHTML = '<div class="msg">A carregar dados…</div>'; return; }
    const Wd = 900, H = 290, VH = 56, plotW = 820, n = cs.length, cw = plotW / n;
    const mn = Math.min(...cs.map((x) => x.l)), mx = Math.max(...cs.map((x) => x.h)), y = (v) => 8 + (mx - v) / (mx - mn || 1) * H;
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + (H + VH + 44), role: 'img', 'aria-label': o.label || 'Gráfico de preços' });
    for (let i = 0; i < 5; i++) { const gy = 8 + i * H / 4; el('line', { x1: 0, x2: plotW, y1: gy, y2: gy, stroke: 'var(--line)' }, svg); txt(svg, plotW + 8, gy + 4, nf(mx - (mx - mn) * i / 4, dec(mx))); }
    const vm = Math.max(...cs.map((x) => x.v)) || 1;
    if (o.tipo === 'linha') {
      const pts = cs.map((x, i) => (i * cw + cw / 2).toFixed(1) + ',' + y(x.c).toFixed(1));
      el('polygon', { points: pts.join(' ') + ' ' + (n * cw - cw / 2) + ',' + (H + 8) + ' ' + cw / 2 + ',' + (H + 8), fill: 'var(--red)', opacity: .14 }, svg);
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--red)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    }
    cs.forEach((x, i) => {
      const up = x.c >= x.o, col = up ? 'var(--ink)' : 'var(--red)', cx = i * cw + cw / 2, bw = Math.max(2, cw * .62);
      if (o.tipo !== 'linha') {
        el('line', { x1: cx, x2: cx, y1: y(x.h), y2: y(x.l), stroke: col, 'stroke-width': 1.5 }, svg);
        el('rect', { x: cx - bw / 2, y: y(Math.max(x.o, x.c)), width: bw, height: Math.max(1.5, Math.abs(y(x.o) - y(x.c))), fill: col }, svg);
      }
      if (o.vol) { const vh = x.v / vm * VH; el('rect', { x: cx - bw / 2, y: H + 20 + VH - vh, width: bw, height: vh, fill: col, opacity: up ? .35 : .7 }, svg); }
    });
    if (o.ma) {
      const ma = cs.map((_, i) => { const s = cs.slice(Math.max(0, i - 9), i + 1); return s.reduce((p, q) => p + q.c, 0) / s.length; });
      el('polyline', { points: ma.map((v, i) => (i * cw + cw / 2).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }, svg);
    }
    const last = cs[n - 1], ly = y(last.c);
    el('line', { x1: 0, x2: plotW, y1: ly, y2: ly, stroke: 'var(--red)', 'stroke-dasharray': '3 4', opacity: .8 }, svg);
    el('rect', { x: plotW + 2, y: ly - 9, width: 76, height: 18, rx: 3, fill: 'var(--red)' }, svg);
    const lt = txt(svg, plotW + 8, ly + 4, nf(last.c, dec(mx))); lt.setAttribute('fill', '#fff'); lt.setAttribute('font-weight', 700);
    const cvl = el('line', { x1: 0, x2: 0, y1: 8, y2: H + 8, stroke: 'var(--mute)', 'stroke-dasharray': '4 4', visibility: 'hidden' }, svg);
    const fmtT = (x) => x.t ? new Date(x.t).toLocaleString('pt-PT', o.intraday ? { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: '2-digit' }) : x.d.slice(5);
    [0, 1, 2, 3, 4].forEach((k) => txt(svg, k * plotW / 4, H + VH + 40, fmtT(cs[Math.min(n - 1, Math.round(k * (n - 1) / 4))]), k === 4 ? 'end' : 'start'));
    const tip = document.createElement('div'); tip.className = 'tip';
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * Wd, i = Math.max(0, Math.min(n - 1, Math.floor(px / cw))), x = cs[i], cx = i * cw + cw / 2;
      cvl.setAttribute('x1', cx); cvl.setAttribute('x2', cx); cvl.setAttribute('visibility', 'visible');
      tip.style.display = 'block'; tip.style.left = Math.min(r.width - 170, Math.max(0, cx / Wd * r.width - 80)) + 'px'; tip.style.top = '6px';
      tip.innerHTML = '<b>' + (x.t ? new Date(x.t).toLocaleString('pt-PT') : x.d) + '</b><br>Abertura ' + nf(x.o) + ' · Fecho ' + nf(x.c) + '<br>Máx ' + nf(x.h) + ' · Mín ' + nf(x.l);
    });
    svg.addEventListener('pointerleave', () => { tip.style.display = 'none'; cvl.setAttribute('visibility', 'hidden'); });
    host.appendChild(svg); host.appendChild(tip);
  }

  function line(host, series, h, labels) {
    host.innerHTML = '';
    const Wd = 700, plotW = 640, all = series.flatMap((s) => s.v), mn = Math.min(...all), mx = Math.max(...all);
    const svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + (h + 24), role: 'img', 'aria-label': 'Gráfico comparativo' }), y = (v) => 6 + (mx - v) / (mx - mn || 1) * h;
    for (let i = 0; i < 5; i++) { const gy = 6 + i * h / 4; el('line', { x1: 0, x2: plotW, y1: gy, y2: gy, stroke: 'var(--line)' }, svg); txt(svg, plotW + 6, gy + 4, nf(mx - (mx - mn) * i / 4, 0)); }
    series.forEach((s) => el('polyline', { points: s.v.map((v, i) => (i * plotW / (s.v.length - 1)).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), fill: 'none', stroke: s.color, 'stroke-width': s.w || 2.5, 'stroke-dasharray': s.dash || '', 'stroke-linejoin': 'round' }, svg));
    if (labels) { txt(svg, 0, h + 20, labels[0]); txt(svg, plotW, h + 20, labels[1], 'end'); }
    host.appendChild(svg);
  }

  function scatter(host, pts) {
    host.innerHTML = '';
    const xM = Math.max(...pts.map((p) => p.x)) * 1.15 || 1, yMx = Math.max(0, ...pts.map((p) => p.y)) * 1.15 + 1, yMn = Math.min(0, ...pts.map((p) => p.y)) * 1.15 - 1;
    const svg = el('svg', { viewBox: '0 0 420 300', role: 'img', 'aria-label': 'Risco contra retorno' }), Y = (v) => 262 - (v - yMn) / (yMx - yMn) * 250;
    el('path', { d: 'M 36 8 L 36 262 L 410 262', stroke: 'var(--line)', 'stroke-width': 2, fill: 'none' }, svg);
    el('line', { x1: 36, x2: 410, y1: Y(0), y2: Y(0), stroke: 'var(--line)', 'stroke-dasharray': '4 4' }, svg);
    pts.forEach((p) => { const cx = 36 + p.x / xM * 360, cy = Y(p.y); el('circle', { cx, cy, r: 8, fill: p.cripto ? 'var(--red)' : 'var(--ink)' }, svg); txt(svg, cx + 12, cy + 4, p.tag); });
    txt(svg, 36, 284, 'Risco (volatilidade diária) →'); txt(svg, 30, 12, '↑ retorno', 'end');
    host.appendChild(svg);
  }

  function hex(size, on, ch) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="' + (on ? 'var(--red)' : 'var(--card)') + '" stroke="' + (on ? 'var(--ink)' : 'var(--line)') + '" stroke-width="4"/><text x="50" y="64" font-size="40" font-weight="700" text-anchor="middle" fill="' + (on ? '#fff' : 'var(--mute)') + '" font-family="Inter,sans-serif">' + ch + '</text></svg>';
  }
  PQ.charts = { candles, line, scatter, hex, el, txt };
})();
