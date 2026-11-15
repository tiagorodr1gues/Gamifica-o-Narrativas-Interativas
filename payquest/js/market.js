(function () {
  const PQ = window.PQ, C = PQ.config, K = PQ.calc, S = PQ.store, CH = PQ.charts, A = PQ.api;
  const $ = (id) => document.getElementById(id);
  const ASSETS = A.criarAtivos();
  const COLORS = ['var(--ink)', 'var(--red)', 'var(--mute)', 'var(--ink)', 'var(--red)', 'var(--mute)'], DASH = ['', '', '', '6 5', '6 5', '6 5'];
  let sel = 0, ivl = '1h', tipo = 'velas', showMA = true, showVol = true, lastDraw = 0, mexeu = false;
  const cmpOn = new Set(ASSETS.map((a) => a.id)), W8 = {};
  ASSETS.forEach((a) => { W8[a.id] = a.kind === 'cripto' ? 10 : 30; });
  const perfil = () => S.state.risco !== null ? S.state.risco : 50;
  const money = (a) => isNaN(a.price) ? '…' : a.demo ? K.nf(a.price, 1) : K.nf(a.price, a.price >= 1 ? 2 : 4);
  const ARTS = [
    { id: 'volatilidade', t: 'O que é a volatilidade?', r: 'Mede quanto o preço sobe e desce.', x: 'Quanto maior a volatilidade, maiores podem ser os ganhos, mas também as perdas num curto espaço de tempo. É por isso que as criptomoedas costumam ter um nível de risco mais alto do que um ETF diversificado.' },
    { id: 'diversificar', t: 'Porquê diversificar?', r: 'Repartir reduz o impacto de uma queda.', x: 'Se tudo estiver num só ativo, uma queda forte afeta toda a carteira. Combinar ativos que não se movem sempre juntos tende a suavizar as oscilações, embora não elimine o risco.' },
    { id: 'etf', t: 'ETF ou ação?', r: 'Muitos ativos num só, ou uma só empresa.', x: 'Um ETF junta muitos ativos num único produto, normalmente replicando um índice. Uma ação representa uma única empresa, por isso o seu preço depende muito dos resultados e das notícias dessa empresa.' }
  ];

  function status(kind, ok, text) { const k = kind === 'cripto' ? 'c' : 's'; $('d' + k).className = 'dot' + (ok ? ' ok' : ''); $('t' + k).textContent = text; }
  function stamp() { $('upd').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-PT'); }

  async function loadChart() { const a = ASSETS[sel]; a.chart = await A.klines(a, ivl); }
  async function loadCrypto() {
    try { await A.carregarCripto(ASSETS); await loadChart(); status('cripto', true, 'Cripto: ligado (Binance)'); A.abrirSocket(ASSETS, onTick); }
    catch (e) { ASSETS.filter((a) => a.kind === 'cripto').forEach((a) => A.demo(a, e.message)); status('cripto', false, 'Cripto: demonstração (' + e.message + ')'); }
    renderAll();
  }
  async function loadStocks() {
    const st = ASSETS.filter((a) => a.kind === 'ação');
    if (!C.twelveDataKey) { st.forEach((a) => A.demo(a, 'sem chave')); status('ação', false, 'Ações: demonstração (falta a chave da Twelve Data)'); renderAll(); return; }
    try { await A.carregarAcoes(ASSETS); status('ação', true, 'Ações: ligado (Twelve Data, a cada minuto)'); setInterval(refresh, C.stockRefreshMs); }
    catch (e) { st.forEach((a) => { if (!a.daily.length) A.demo(a, e.message); }); status('ação', false, 'Ações: demonstração (' + e.message + ')'); }
    renderAll();
  }
  async function refresh() { try { await A.atualizarCotacoes(ASSETS); renderTicks(); renderMain(); } catch (e) { status('ação', false, 'Ações: ' + e.message); } }
  function onTick() { const n = Date.now(); if (n - lastDraw > 700) { lastDraw = n; renderTicks(); $('cPrice').textContent = money(ASSETS[sel]); } }

  function renderTicks() {
    const box = $('ticks'); box.innerHTML = '';
    ASSETS.forEach((a, i) => {
      const b = document.createElement('button'); b.className = 'tk' + (i === sel ? ' sel' : '') + (a.flash ? ' flash' : ''); a.flash = false;
      b.setAttribute('aria-pressed', i === sel);
      b.innerHTML = '<div class="n d">' + a.name.toUpperCase() + '</div><div class="m">' + a.tag + ' · ' + a.kind + (a.demo ? ' · DEMO' : '') + '</div><div class="p d">' + money(a) + '</div><div class="c">' + (isNaN(a.price) ? '' : K.pct(a.chg)) + '</div>';
      const c = a.daily.map((x) => x.c);
      if (c.length > 1) {
        const lo = Math.min(...c), hi = Math.max(...c), s = CH.el('svg', { viewBox: '0 0 150 30', width: 150, height: 30, 'aria-hidden': 'true' });
        CH.el('polyline', { points: c.map((v, j) => (j * 150 / (c.length - 1)).toFixed(1) + ',' + (28 - (v - lo) / (hi - lo || 1) * 26).toFixed(1)).join(' '), fill: 'none', stroke: i === sel ? '#fff' : 'var(--ink)', 'stroke-width': 2 }, s); b.appendChild(s);
      }
      b.onclick = async () => { sel = i; if (ASSETS[i].kind !== 'cripto') ivl = '1d'; S.viewAsset(ASSETS[i].id, ASSETS.length); await loadChart(); renderAll(); };
      box.appendChild(b);
    });
    stamp();
  }

  function renderMain() {
    const a = ASSETS[sel], cs = a.chart && a.chart.length ? a.chart : a.daily;
    $('cTitle').textContent = a.name.toUpperCase() + ' (' + a.tag + ') · ' + (a.demo ? 'DADOS DE DEMONSTRAÇÃO (índice)' : a.kind === 'cripto' ? 'USDT' : 'USD');
    $('cPrice').textContent = money(a);
    const iv = $('ivl'); iv.innerHTML = '';
    ['15m', '1h', '4h', '1d'].forEach((k) => { const b = document.createElement('button'); b.className = 'chip' + (ivl === k ? ' on' : ''); b.textContent = k; b.disabled = a.kind !== 'cripto' && k !== '1d'; b.onclick = async () => { ivl = k; await loadChart(); renderMain(); }; iv.appendChild(b); });
    $('bTipo').textContent = tipo === 'velas' ? 'Velas' : 'Linha'; $('bMA').classList.toggle('on', showMA); $('bVol').classList.toggle('on', showVol);
    CH.candles($('cbox'), cs, { ma: showMA, vol: showVol, tipo, intraday: ivl !== '1d' && a.kind === 'cripto' && !a.demo, label: 'Gráfico de ' + a.name });
    if (a.daily.length > 2) {
      const s = K.estatisticas(a);
      $('cStats').innerHTML = '<div class="st"><span class="mut">Volatilidade diária</span><b>' + K.nf(s.vol) + ' %</b></div><div class="st"><span class="mut">Maior queda no período</span><b>' + K.nf(s.dd) + ' %</b></div><div class="st"><span class="mut">Retorno (' + a.daily.length + ' dias)</span><b>' + K.pct(s.ret) + '</b></div>';
    }
    renderDetail();
  }

  function renderDetail() {
    const a = ASSETS[sel], d = $('det'); if (a.daily.length < 3) { d.innerHTML = '<div class="msg">A carregar…</div>'; return; }
    const s = K.estatisticas(a), diff = s.indice - perfil(), p = perfil();
    const note = Math.abs(diff) <= 15 ? 'Compatível com o teu perfil.' : diff > 0 ? 'Mais arriscado do que o teu perfil.' : 'Mais conservador do que o teu perfil.';
    d.innerHTML = '<h2 class="d">Detalhes · ' + a.name + '</h2><div class="mut">Nível de risco (últimos ' + a.daily.length + ' fechos)</div><div class="risk">' + [0, 1, 2, 3, 4].map((i) => '<i class="' + (i <= s.nivel ? 'f' : '') + '"></i>').join('') + '</div><b>' + K.NIVEIS[s.nivel] + '</b>' +
      '<p class="mut">Índice de risco do ativo: ' + s.indice + ' / 100 (volatilidade diária × 25, máximo 100). Fórmula educativa do projeto.</p>' +
      '<div class="fit"><b>Adequado ao teu perfil?</b><br>' + (S.state.risco === null ? 'Ainda não fizeste o <a href="perfil.html">teste de risco</a>. A usar 50 como valor por defeito.' : 'Perfil ' + S.state.perfil + ' (' + p + ' / 100).') + ' ' + note + '<div class="bar"><span style="width:' + s.indice + '%"></span></div></div>';
  }

  function renderCompare() {
    const lg = $('cmpLg'); lg.innerHTML = '';
    ASSETS.forEach((a) => { const b = document.createElement('button'); b.className = 'chip' + (cmpOn.has(a.id) ? ' on' : ''); b.textContent = a.tag; b.setAttribute('aria-pressed', cmpOn.has(a.id)); b.onclick = () => { cmpOn.has(a.id) ? cmpOn.delete(a.id) : cmpOn.add(a.id); renderCompare(); }; lg.appendChild(b); });
    const L = ASSETS.filter((a) => cmpOn.has(a.id) && a.daily.length > 2), dates = K.datasComuns(L);
    if (!L.length || dates.length < 5) { $('cmp').innerHTML = '<div class="msg">Escolhe pelo menos um ativo com datas em comum.</div>'; $('sc').innerHTML = ''; return; }
    const series = L.map((a) => { const c = K.fechosEm(a, dates), i = ASSETS.indexOf(a); return { v: c.map((x) => x / c[0] * 100), color: COLORS[i], dash: DASH[i], tag: a.tag }; });
    CH.line($('cmp'), series, 260, [dates[0], dates[dates.length - 1]]);
    const f = document.createElement('div'); f.className = 'lg'; series.forEach((s) => { const c = document.createElement('span'); c.className = 'mut'; c.textContent = s.tag + ' ' + K.pct(s.v[s.v.length - 1] - 100); f.appendChild(c); }); $('cmp').appendChild(f);
    CH.scatter($('sc'), L.map((a) => { const c = K.fechosEm(a, dates); return { tag: a.tag, cripto: a.kind === 'cripto', x: K.stdev(K.rets(c)) * 100, y: (c[c.length - 1] / c[0] - 1) * 100 }; }));
  }

  function renderPortfolio() {
    const host = $('pf');
    if (!host.dataset.built) {
      host.dataset.built = 1;
      ASSETS.forEach((a) => { const r = document.createElement('div'); r.className = 'sl'; r.innerHTML = '<label for="w_' + a.id + '">' + a.name + '</label><input id="w_' + a.id + '" type="range" min="0" max="100" step="5" value="' + W8[a.id] + '"><span id="v_' + a.id + '">' + W8[a.id] + ' %</span>'; host.appendChild(r); r.querySelector('input').oninput = (e) => { W8[a.id] = +e.target.value; mexeu = true; renderPortfolio(); }; });
    }
    ASSETS.forEach((a) => { $('v_' + a.id).textContent = W8[a.id] + ' %'; });
    const L = ASSETS.filter((a) => W8[a.id] > 0 && a.daily.length > 2), tot = L.reduce((s, a) => s + W8[a.id], 0), out = $('pfOut'), dates = K.datasComuns(L);
    if (!tot || dates.length < 5) { out.innerHTML = '<div class="msg">Escolhe pesos acima de zero para ativos com dados.</div>'; return; }
    const cl = L.map((a) => K.fechosEm(a, dates)), eq = [100], pr = [];
    for (let t = 1; t < dates.length; t++) { let r = 0; L.forEach((a, i) => { r += W8[a.id] / tot * (cl[i][t] / cl[i][t - 1] - 1); }); pr.push(r); eq.push(eq[t - 1] * (1 + r)); }
    const vol = K.stdev(pr) * 100, idx = K.indiceRisco(vol), dd = K.maxDD(eq), ret = eq[eq.length - 1] - 100, diff = idx - perfil();
    const al = Math.abs(diff) <= 15 ? 'Alinhada com o teu perfil.' : diff > 0 ? 'Mais arriscada do que o teu perfil (' + perfil() + ').' : 'Mais conservadora do que o teu perfil (' + perfil() + ').';
    out.innerHTML = '<div class="stats" style="margin:0 0 12px"><div class="st"><span class="mut">Risco da carteira</span><b>' + idx + ' / 100</b></div><div class="st"><span class="mut">Maior queda</span><b>' + K.nf(dd) + ' %</b></div><div class="st"><span class="mut">Retorno no período</span><b>' + K.pct(ret) + '</b></div></div><div class="fit" style="margin:0 0 10px"><b>' + al + '</b></div><div id="eq"></div><div class="mut">Período: ' + dates[0] + ' a ' + dates[dates.length - 1] + ' (' + dates.length + ' datas em comum, base 100). Os pesos são normalizados para somar 100 %.</div>';
    CH.line($('eq'), [{ v: eq, color: 'var(--red)', w: 3 }], 180);
    if (mexeu && L.length >= 3 && L.every((a) => W8[a.id] / tot <= .5)) { if (S.desafio('pf_div', 20, 'carteira diversificada')) S.unlockBadge('diversificador'); }
  }

  function renderArts() {
    const box = $('arts'); box.innerHTML = '';
    ARTS.forEach((r) => {
      const lido = S.state.artigosLidos.includes(r.id), c = document.createElement('div'); c.className = 'card';
      c.innerHTML = '<span class="tag' + (lido ? ' line' : '') + '">' + (lido ? 'Lido' : '+10 XP') + '</span><h3 class="d">' + r.t + '</h3><p>' + r.r + '</p><p class="x" hidden style="margin-top:10px">' + r.x + '</p><button class="chip" style="margin-top:14px" aria-expanded="false">Ler artigo</button>';
      const b = c.querySelector('button'), x = c.querySelector('.x');
      b.onclick = () => { x.hidden = !x.hidden; b.setAttribute('aria-expanded', !x.hidden); b.textContent = x.hidden ? 'Ler artigo' : 'Fechar'; if (!x.hidden && S.readArticle(r.id)) renderArts(); };
      box.appendChild(c);
    });
  }

  function renderAll() { renderTicks(); renderMain(); renderCompare(); renderPortfolio(); renderArts(); }
  document.addEventListener('DOMContentLoaded', () => {
    $('bTipo').onclick = () => { tipo = tipo === 'velas' ? 'linha' : 'velas'; renderMain(); };
    $('bMA').onclick = () => { showMA = !showMA; renderMain(); };
    $('bVol').onclick = () => { showVol = !showVol; renderMain(); };
    $('retry').onclick = () => { loadCrypto(); loadStocks(); };
    renderTicks(); loadCrypto().then(() => S.viewAsset(ASSETS[0].id, ASSETS.length)); loadStocks();
  });
})();
