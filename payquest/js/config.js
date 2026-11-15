window.PQ = window.PQ || {};
PQ.config = {
  twelveDataKey: '',
  crypto: [
    { sym: 'BTCUSDT', name: 'Bitcoin', tag: 'BTC' },
    { sym: 'ETHUSDT', name: 'Ethereum', tag: 'ETH' },
    { sym: 'SOLUSDT', name: 'Solana', tag: 'SOL' }
  ],
  stocks: [
    { sym: 'AAPL', name: 'Apple', tag: 'AAPL' },
    { sym: 'TSLA', name: 'Tesla', tag: 'TSLA' },
    { sym: 'SPY', name: 'ETF S&P 500', tag: 'SPY' }
  ],
  days: 90,
  stockRefreshMs: 60000
};
