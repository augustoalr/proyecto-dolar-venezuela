const BaseProvider = require('./baseProvider');

class BinanceP2PProvider extends BaseProvider {
  constructor() {
    super('BinanceP2P');
    this.url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
  }

  async getPrice() {
    const payload = {
      asset: 'USDT',
      fiat: 'VES',
      merchantCheck: false,
      page: 1,
      payTypes: [],
      publisherType: null,
      rows: 10,
      tradeType: 'BUY'
    };

    try {
      // Usando fetch global de Node 18+
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const prices = data.data.map(adv => parseFloat(adv.adv.price));
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        return avg;
      } else {
        throw new Error('No data found for Binance P2P');
      }
    } catch (error) {
      console.error(`Error in BinanceP2PProvider: ${error.message}`);
      return null;
    }
  }
}

module.exports = BinanceP2PProvider;
