(function () {
  const PQ = window.PQ = window.PQ || {};
  const C = PQ.config;
  async function getJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  const kl = (arr) => arr.map((k) => ({ d: new Date(k[0]).toISOString().slice(0, 10), t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));
  let seed = 1;
  const rnd = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  const gs = () => { const u = rnd() || .5, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); };
  function demoDaily(sd, mu, sg, days) {
    seed = sd; let c = 100; const out = [], t0 = Date.now() - days * 864e5;
    for (let i = 0; i < days; i++) {
      const o = c; c = Math.max(20, c * (1 + mu + sg * gs())); const bd = Math.abs(c - o);
      out.push({ d: new Date(t0 + i * 864e5).toISOString().slice(0, 10), o, c, h: Math.max(o, c) + bd * rnd(), l: Math.min(o, c) - bd * rnd(), v: (bd + 1) * (rnd() + .5) });
    }
    return out;
  }
  function criarAtivos() {
    const out = [];
    C.crypto.forEach((x, i) => out.push({ id: x.tag, kind: 'cripto', name: x.name, tag: x.tag, sym: x.sym, price: NaN, chg: 0, daily: [], chart: [], demo: false, ds: 11 + i * 7, mu: .01, sg: .045 }));
    C.stocks.forEach((x, i) => out.push({ id: x.tag, kind: 'ação', name: x.name, tag: x.tag, sym: x.sym, price: NaN, chg: 0, daily: [], chart: [], demo: false, ds: 41 + i * 5, mu: .0007, sg: x.tag === 'SPY' ? .009 : .02 }));
    return out;
  }
  function demo(a, why) {
    a.demo = true; a.daily = demoDaily(a.ds, a.mu, a.sg, C.days); a.chart = a.daily;
    a.price = a.daily[a.daily.length - 1].c; a.chg = (a.price / a.daily[a.daily.length - 2].c - 1) * 100; a.why = why;
  }
  async function carregarCripto(ativos) {
    await Promise.all(ativos.filter((a) => a.kind === 'cripto').map(async (a) => {
      const [d, t] = await Promise.all([
        getJSON('https://api.binance.com/api/v3/klines?symbol=' + a.sym + '&interval=1d&limit=' + C.days),
        getJSON('https://api.binance.com/api/v3/ticker/24hr?symbol=' + a.sym)
      ]);
      a.daily = kl(d); a.chart = a.daily; a.price = +t.lastPrice; a.chg = +t.priceChangePercent; a.demo = false;
    }));
  }
  async function klines(a, ivl) {
    if (a.demo || a.kind !== 'cripto' || ivl === '1d') return a.daily;
    try { return kl(await getJSON('https://api.binance.com/api/v3/klines?symbol=' + a.sym + '&interval=' + ivl + '&limit=96')); } catch (e) { return a.daily; }
  }
  function abrirSocket(ativos, onTick) {
    const streams = ativos.filter((a) => a.kind === 'cripto' && !a.demo).map((a) => a.sym.toLowerCase() + '@miniTicker').join('/');
    if (!streams || typeof WebSocket === 'undefined') return;
    let tries = 0;
    (function ligar() {
      const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + streams);
      ws.onopen = () => { tries = 0; };
      ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data).data; if (!m) return;
        const a = ativos.find((x) => x.sym === m.s); if (!a) return;
        a.price = +m.c; a.chg = (+m.c / +m.o - 1) * 100; a.flash = true; onTick(a);
      };
      ws.onclose = () => { if (tries++ < 6) setTimeout(ligar, 2000 * tries); };
    })();
  }
  async function carregarAcoes(ativos) {
    for (const a of ativos.filter((x) => x.kind === 'ação')) {
      const j = await getJSON('https://api.twelvedata.com/time_series?symbol=' + a.sym + '&interval=1day&outputsize=' + C.days + '&apikey=' + C.twelveDataKey);
      if (j.status === 'error') throw new Error(j.message || 'erro da API');
      a.daily = j.values.slice().reverse().map((v) => ({ d: v.datetime.slice(0, 10), o: +v.open, h: +v.high, l: +v.low, c: +v.close, v: +v.volume }));
      a.chart = a.daily; a.price = a.daily[a.daily.length - 1].c; a.demo = false;
      a.chg = a.daily.length > 1 ? (a.price / a.daily[a.daily.length - 2].c - 1) * 100 : 0;
    }
  }
  async function atualizarCotacoes(ativos) {
    for (const a of ativos.filter((x) => x.kind === 'ação' && !x.demo)) {
      const q = await getJSON('https://api.twelvedata.com/quote?symbol=' + a.sym + '&apikey=' + C.twelveDataKey);
      if (q.status === 'error') throw new Error(q.message || 'erro da API');
      a.price = +q.close; a.chg = +q.percent_change; a.flash = true;
    }
  }
  PQ.api = { criarAtivos, demo, carregarCripto, klines, abrirSocket, carregarAcoes, atualizarCotacoes };
})();
