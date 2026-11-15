(function () {
  const PQ = window.PQ, S = PQ.store, K = PQ.calc, $ = (id) => document.getElementById(id);
  function render() {
    const s = S.state, B = S.BADGES, ids = Object.keys(B);
    $('stats').innerHTML = [['XP total', s.xp], ['Nível', S.nivel()], ['Título', S.titulo()], ['Insígnias', s.unlockedBadges.length + ' / ' + ids.length], ['Artigos lidos', s.artigosLidos.length + ' / 3'], ['Perfil de risco', s.perfil ? s.perfil + ' (' + s.risco + ')' : 'Por definir']]
      .map(([l, v], i) => '<div class="st"' + (i === 0 ? ' style="background:var(--red);color:#fff"' : '') + '><span class="mut"' + (i === 0 ? ' style="color:#fff"' : '') + '>' + l + '</span><b class="d" style="font-size:30px;font-weight:400">' + v + '</b></div>').join('');
    $('badges').innerHTML = ids.map((id) => {
      const on = s.unlockedBadges.includes(id), b = B[id];
      return '<div class="card bc' + (on ? '' : ' off') + '">' + PQ.charts.hex(84, on, on ? '✓' : '?') + '<h3 class="d">' + b.nome + '</h3><span class="tag' + (on ? '' : ' line') + '">' + b.raridade + '</span><p style="margin-top:10px">' + b.desc + '</p></div>';
    }).join('');
    const cur = S.titulo();
    $('ladder').innerHTML = S.TITULOS.map(([m, n]) => '<div class="' + (n === cur ? 'on' : '') + '"><b>' + n.toUpperCase() + '</b>' + m + ' XP' + (n === cur ? ' · atual' : '') + '</div>').join('');
  }
  document.addEventListener('DOMContentLoaded', () => {
    render(); S.subscribe(render);
    $('reset').onclick = () => { if (confirm('Apagar todo o progresso guardado neste navegador?')) S.reset(); };
  });
})();
