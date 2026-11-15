(function () {
  const PQ = window.PQ = window.PQ || {};
  function toast(msg, badge) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast' + (badge ? ' badge' : ''); t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), 3800);
  }
  function hud() {
    const h = document.getElementById('hud'); if (!h) return;
    const S = PQ.store;
    h.innerHTML = '<span class="lvl d">' + S.nivel() + '</span><span><small>' + S.titulo() + ' · ' + S.state.xp + ' XP</small><span class="xp" style="display:block"><i style="width:' + Math.round(S.progresso() * 100) + '%"></i></span></span>';
    h.setAttribute('aria-label', 'Nível ' + S.nivel() + ', ' + S.titulo() + ', ' + S.state.xp + ' pontos de experiência');
  }
  PQ.ui = { toast, hud };
  document.addEventListener('DOMContentLoaded', () => { hud(); PQ.store.subscribe(hud); });
})();
