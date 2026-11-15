(function () {
  const PQ = window.PQ = window.PQ || {};
  const KEY = 'payquest.v1';
  const TITULOS = [[0, 'Aprendiz'], [300, 'Poupador'], [800, 'Investidor'], [1500, 'Mestre']];
  const BADGES = {
    primeiro_passo: { nome: 'Primeiro passo', desc: 'Completa o teste de risco', raridade: 'Comum' },
    explorador: { nome: 'Explorador', desc: 'Consulta todos os ativos do mercado', raridade: 'Comum' },
    leitor_curioso: { nome: 'Leitor curioso', desc: 'Lê 3 artigos de literacia', raridade: 'Raro' },
    diversificador: { nome: 'Diversificador', desc: 'Monta uma carteira com 3 ou mais ativos e nenhum acima de 50 %', raridade: 'Épico' },
    mente_fria: { nome: 'Mente fria', desc: 'Acerta as 4 perguntas de literacia à primeira', raridade: 'Lendário' }
  };
  const base = { xp: 0, risco: null, perfil: null, unlockedBadges: [], respostas: {}, artigosLidos: [], ativosVistos: [], desafios: [] };
  const subs = [];
  let s = load();
  function load() { try { return Object.assign({}, base, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, base); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sem armazenamento */ } }
  function emit() { subs.forEach((f) => f(s)); }
  const toast = (m, b) => PQ.ui && PQ.ui.toast(m, b);
  const store = {
    get state() { return s; },
    BADGES, TITULOS,
    nivel() { return Math.floor(s.xp / 100) + 1; },
    titulo() { let t = TITULOS[0][1]; TITULOS.forEach(([m, n]) => { if (s.xp >= m) t = n; }); return t; },
    progresso() { return (s.xp % 100) / 100; },
    addXp(n, motivo) { s.xp += n; save(); emit(); toast('+' + n + ' XP' + (motivo ? ' · ' + motivo : '')); },
    unlockBadge(id) {
      if (!BADGES[id] || s.unlockedBadges.includes(id)) return false;
      s.unlockedBadges.push(id); save(); emit(); toast('Insígnia desbloqueada: ' + BADGES[id].nome, true); return true;
    },
    answerChallenge(id, escolha, ok, xp) {
      if (s.respostas[id] !== undefined) return false;
      s.respostas[id] = { escolha, ok }; save();
      if (ok) store.addXp(xp, 'resposta certa'); else emit();
      const lit = ['lit_1', 'lit_2', 'lit_3', 'lit_4'];
      if (lit.every((k) => s.respostas[k] && s.respostas[k].ok)) store.unlockBadge('mente_fria');
      return true;
    },
    readArticle(id) {
      if (s.artigosLidos.includes(id)) return false;
      s.artigosLidos.push(id); save(); store.addXp(10, 'artigo lido');
      if (s.artigosLidos.length >= 3) store.unlockBadge('leitor_curioso');
      return true;
    },
    viewAsset(id, total) {
      if (s.ativosVistos.includes(id)) return;
      s.ativosVistos.push(id); save(); emit();
      if (s.ativosVistos.length >= total) { store.addXp(25, 'mercado explorado'); store.unlockBadge('explorador'); }
    },
    desafio(id, xp, motivo) { if (s.desafios.includes(id)) return false; s.desafios.push(id); save(); store.addXp(xp, motivo); return true; },
    setRisco(score) {
      const primeira = s.risco === null;
      s.risco = score; s.perfil = PQ.calc.perfilDe(score); save(); emit();
      if (primeira) { store.addXp(30, 'teste de risco'); store.unlockBadge('primeiro_passo'); }
    },
    reset() { s = Object.assign({}, base, { unlockedBadges: [], respostas: {}, artigosLidos: [], ativosVistos: [], desafios: [] }); save(); emit(); },
    subscribe(f) { subs.push(f); }
  };
  PQ.store = store;
})();
