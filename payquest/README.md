# PayQuest · Mercado Real (rascunho)

Site estático em HTML, CSS e JavaScript, sem frameworks nem passo de compilação.

## Como abrir
1. Descompacta a pasta e abre `index.html` no navegador (duplo clique).
2. Para publicar: GitHub Pages ou qualquer alojamento estático.

## Dados em tempo real
- **Cripto** (Binance, sem chave): preços por WebSocket e velas por REST. Funciona logo.
- **Ações e ETF** (Twelve Data): cria uma chave gratuita em twelvedata.com e cola-a em `js/config.js`, em `twelveDataKey`.
  A chave fica visível no código do navegador: usa uma chave gratuita e não a publiques num repositório público.
- Se uma fonte falhar (rede, bloqueio regional, limite de pedidos ou falta de chave), a página passa a **dados de demonstração** e identifica-os como tal.

## Estrutura
- `index.html`, `perfil.html`, `mercado.html`, `conquistas.html`
- `css/style.css`: estilos e tema (escuro por defeito, claro conforme o sistema)
- `js/config.js`: ativos, chave da API e opções
- `js/calc.js`: volatilidade, queda máxima, índice de risco e perfil
- `js/store.js`: estado do jogador (XP, nível, insígnias, respostas), guardado em `localStorage`
- `js/ui.js`: HUD de XP e avisos
- `js/charts.js`: gráficos em SVG (velas, linhas, dispersão)
- `js/api.js`: Binance e Twelve Data
- `js/market.js`, `js/quiz.js`, `js/conquistas.js`: lógica de cada página

## Ligação ao GDD (para migrar para Vue + Pinia)
- `store.js` corresponde à store Pinia: `xp`, `nivel()`, `unlockedBadges`, `answerChallenge()`, `readArticle()`, `setRisco()`.
- Cada ficheiro de página corresponde a uma `view`; as funções de desenho passam a componentes.

## Fórmulas educativas (explicar no GDD)
- Perfil de risco: soma de 5 respostas de 0, 10 ou 20 pontos (0 a 100). Conservador < 34, Moderado < 67, Agressivo ≥ 67.
- Índice de risco de um ativo ou carteira: volatilidade diária (%) × 25, máximo 100.
- Nível: sobe a cada 100 XP. Títulos aos 0, 300, 800 e 1 500 XP.

## Aviso
Conteúdo educativo