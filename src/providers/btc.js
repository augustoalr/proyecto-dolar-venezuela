const BaseProvider = require('./baseProvider');

class BTCProvider extends BaseProvider {
  constructor() {
    super('BTC');
    this.url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';
  }

  async getPrice() {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error(`Error in BTCProvider: ${error.message}`);
      return null;
    }
  }
}

module.exports = BTCProvider;
