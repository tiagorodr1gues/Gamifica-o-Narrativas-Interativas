(function () {
  const PQ = window.PQ = window.PQ || {};
  const rets = (c) => { const r = []; for (let i = 1; i < c.length; i++) r.push(c[i] / c[i - 1] - 1); return r; };
  const stdev = (r) => { if (r.length < 2) return 0; const m = r.reduce((a, b) => a + b, 0) / r.length; return Math.sqrt(r.reduce((a, b) => a + (b - m) * (b - m), 0) / (r.length - 1)); };
  const maxDD = (c) => { let p = c[0], m = 0; c.forEach((v) => { p = Math.max(p, v); m = Math.min(m, v / p - 1); }); return m * 100; };
  const nivelRisco = (v) => v < .8 ? 0 : v < 1.5 ? 1 : v < 2.5 ? 2 : v < 4 ? 3 : 4;
  const indiceRisco = (v) => Math.min(100, Math.round(v * 25));
  const perfilDe = (s) => s < 34 ? 'Conservador' : s < 67 ? 'Moderado' : 'Agressivo';
  function datasComuns(list) {
    if (!list.length) return [];
    let s = new Set(list[0].daily.map((x) => x.d));
    list.slice(1).forEach((a) => { const t = new Set(a.daily.map((x) => x.d)); s = new Set([...s].filter((d) => t.has(d))); });
    return [...s].sort();
  }
  const fechosEm = (a, dates) => { const m = new Map(a.daily.map((x) => [x.d, x.c])); return dates.map((d) => m.get(d)); };
  function estatisticas(a) {
    const c = a.daily.map((x) => x.c), v = stdev(rets(c)) * 100;
    return { vol: v, dd: maxDD(c), ret: (c[c.length - 1] / c[0] - 1) * 100, nivel: nivelRisco(v), indice: indiceRisco(v) };
  }
  const nf = (x, d = 2) => new Intl.NumberFormat('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
  const pct = (x) => (x >= 0 ? '▲ ' : '▼ ') + nf(Math.abs(x)) + ' %';
  PQ.calc = { rets, stdev, maxDD, nivelRisco, indiceRisco, perfilDe, datasComuns, fechosEm, estatisticas, nf, pct, NIVEIS: ['Baixo', 'Moderado', 'Médio', 'Alto', 'Muito alto'] };
})();
