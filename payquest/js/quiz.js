(function () {
  const PQ = window.PQ, S = PQ.store, K = PQ.calc, $ = (id) => document.getElementById(id);
  const QS = [
    { q: 'Quando vais precisar deste dinheiro?', o: [['Em menos de 1 ano', 0], ['Entre 1 e 5 anos', 10], ['Daqui a mais de 5 anos', 20]] },
    { q: 'O teu investimento cai 20 % num mês. O que fazes?', o: [['Vendo tudo', 0], ['Mantenho e espero', 10], ['Compro mais', 20]] },
    { q: 'Quantos meses de despesas tens guardados?', o: [['Nenhum', 0], ['1 a 2 meses', 10], ['3 meses ou mais', 20]] },
    { q: 'O que valorizas mais num investimento?', o: [['Segurança', 0], ['Equilíbrio', 10], ['Crescimento', 20]] },
    { q: 'Já investiste antes?', o: [['Nunca', 0], ['Um pouco', 10], ['Sim, regularmente', 20]] }
  ];
  const TXT = {
    Conservador: 'Preferes proteger o que tens. Para ti, a reserva de emergência e produtos diversificados fazem mais sentido do que apostas voláteis.',
    Moderado: 'Aceitas alguma oscilação, mas queres uma rede de segurança. Um equilíbrio entre reserva, ETF e uma pequena fatia de risco costuma ajustar-se.',
    Agressivo: 'Toleras oscilações fortes em troca de maior potencial de crescimento. Convém manter reserva e não pôr tudo num só ativo.'
  };
  const ALLOC = {
    Conservador: [['Fundo de emergência', 60, 'var(--red)'], ['ETF', 35, 'var(--ink)'], ['Ações', 5, 'var(--mute)'], ['Cripto', 0, '#7a0610']],
    Moderado: [['Fundo de emergência', 40, 'var(--red)'], ['ETF', 40, 'var(--ink)'], ['Ações', 15, 'var(--mute)'], ['Cripto', 5, '#7a0610']],
    Agressivo: [['Fundo de emergência', 20, 'var(--red)'], ['ETF', 40, 'var(--ink)'], ['Ações', 25, 'var(--mute)'], ['Cripto', 15, '#7a0610']]
  };
  let i = 0, pts = [];

  function wizard() {
    const q = QS[i], box = $('quiz'), chosen = pts[i];
    let segs = ''; for (let k = 0; k < QS.length; k++) segs += '<span style="flex:1;height:6px;border-radius:3px;background:' + (k <= i ? 'var(--red)' : 'var(--line)') + '"></span>';
    box.innerHTML = '<div class="qhead"><span class="tag line">Pergunta ' + (i + 1) + ' de ' + QS.length + '</span><span class="tag">+10 XP no fim</span></div><div style="display:flex;gap:6px;margin-bottom:18px">' + segs + '</div><h2 class="d">' + q.q + '</h2><div role="group" aria-label="Opções"></div><div class="row" style="margin-top:14px"><button class="btn ghost" id="back"' + (i === 0 ? ' disabled' : '') + '>Voltar</button><button class="btn" id="next"' + (chosen === undefined ? ' disabled' : '') + '>' + (i === QS.length - 1 ? 'Ver resultado' : 'Seguinte') + '</button></div>';
    const g = box.querySelector('[role=group]');
    q.o.forEach(([t, p], k) => {
      const b = document.createElement('button'); b.className = 'opt' + (chosen === p && pts.sel && pts.sel[i] === k ? ' sel' : ''); b.innerHTML = '<b>' + 'ABC'[k] + '</b><span>' + t + '</span>';
      b.setAttribute('aria-pressed', !!(pts.sel && pts.sel[i] === k));
      b.onclick = () => { pts[i] = p; pts.sel = pts.sel || []; pts.sel[i] = k; wizard(); };
      g.appendChild(b);
    });
    $('back').onclick = () => { i--; wizard(); };
    $('next').onclick = () => { if (i < QS.length - 1) { i++; wizard(); } else finish(); };
  }

  function finish() { const score = pts.reduce((a, b) => a + b, 0); S.setRisco(score); result(); }

  function result() {
    const sc = S.state.risco, p = K.perfilDe(sc), al = ALLOC[p];
    $('quiz').parentElement.hidden = true; $('res-sec').hidden = false;
    $('result').innerHTML = '<div class="card" style="border-color:var(--red)"><span class="tag">O TEU RESULTADO</span><div class="row" style="align-items:flex-end;margin-top:10px"><div><div class="big d" style="font-size:96px">' + sc + '<span class="mut" style="font-size:24px"> / 100</span></div><h2 class="d">' + p + '</h2></div></div>' +
      '<div class="seg">' + ['Conservador', 'Moderado', 'Agressivo'].map((n) => '<div class="' + (n === p ? 'on' : '') + '">' + n + '</div>').join('') + '</div><p class="sub">' + TXT[p] + '</p>' +
      '<div class="mut" style="font-weight:700;letter-spacing:.08em;text-transform:uppercase">Distribuição ilustrativa para este perfil</div><div class="stack">' + al.map((a) => '<i style="width:' + a[1] + '%;background:' + a[2] + '"></i>').join('') + '</div><div class="legend">' + al.map((a) => '<span style="--c:' + a[2] + '">' + a[0] + ' ' + a[1] + ' %</span>').join('') + '</div>' +
      '<p class="mut" style="margin-top:12px">Exemplo educativo do jogo, calculado só a partir das tuas respostas (soma de 0 a 100). Não é aconselhamento financeiro.</p>' +
      '<p style="margin-top:14px"><a class="btn" href="mercado.html">Explorar o Mercado Real</a> <button class="btn ghost" id="redo">Refazer o teste</button></p></div>';
    $('redo').onclick = () => { i = 0; pts = []; $('quiz').parentElement.hidden = false; $('res-sec').hidden = true; wizard(); };
  }

  const LIT = [
    { q: 'Qual é a função de um fundo de emergência?', o: ['Investir em ativos de risco elevado', 'Cobrir despesas imprevistas', 'Pagar férias e lazer'], c: 1, e: 'Costuma corresponder a alguns meses de despesas essenciais e deve estar facilmente acessível.' },
    { q: 'O que é um ETF?', o: ['Um fundo negociado em bolsa que reúne vários ativos', 'Uma ação de uma única empresa', 'Uma conta a prazo'], c: 0, e: 'Um ETF replica normalmente um índice e diversifica por muitos ativos de uma só vez.' },
    { q: 'Recebes um SMS do banco com um link urgente para «desbloquear a conta». O que fazes?', o: ['Clico depressa para não perder o acesso', 'Respondo com os meus dados', 'Ignoro e contacto o banco pelos canais oficiais'], c: 2, e: 'Os bancos não pedem dados nem links urgentes por SMS. Usa sempre os canais oficiais.' },
    { q: 'O que significa juro composto?', o: ['Os juros incidem apenas sobre o valor inicial', 'Os juros incidem também sobre os juros já acumulados', 'O banco cobra uma comissão fixa'], c: 1, e: 'Com o tempo, os juros geram novos juros, por isso começar cedo faz diferença.' }
  ];
  function lit() {
    const box = $('lit'); box.innerHTML = '';
    LIT.forEach((it, n) => {
      const id = 'lit_' + (n + 1), r = S.state.respostas[id], card = document.createElement('div'); card.className = 'card';
      card.innerHTML = '<div class="qhead"><span class="tag line">Pergunta ' + (n + 1) + '</span>' + (r ? '<span class="tag' + (r.ok ? '' : ' line') + '">' + (r.ok ? 'Correto +10 XP' : 'Incorreto') + '</span>' : '<span class="tag line">Por responder</span>') + '</div><h3 class="d" style="text-transform:none;font-size:22px">' + it.q + '</h3><div></div>' + (r ? '<p class="expl">' + it.e + '</p>' : '');
      const g = card.children[2];
      it.o.forEach((t, k) => {
        const b = document.createElement('button'); b.className = 'opt' + (r && k === it.c ? ' ok' : r && k === r.escolha ? ' no' : ''); b.disabled = !!r;
        b.innerHTML = '<b>' + 'ABC'[k] + '</b><span>' + t + (r && k === it.c ? ' ✓' : r && k === r.escolha ? ' ✗' : '') + '</span>';
        b.onclick = () => { S.answerChallenge(id, k, k === it.c, 10); lit(); };
        g.appendChild(b);
      });
      box.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', () => { if (S.state.risco !== null) result(); else wizard(); lit(); });
})();
