const puppeteer = require('puppeteer');
const BaseProvider = require('./baseProvider');

class BCVProvider extends BaseProvider {
  constructor() {
    super('BCV');
    this.url = 'https://www.bcv.org.ve/';
  }

  async getPrice() {
    let browser;
    try {
      const launchOptions = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      };
      
      if (process.env.CHROME_PATH) {
        launchOptions.executablePath = process.env.CHROME_PATH;
      }

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const price = await page.evaluate(() => {
        const elemento = document.querySelector('#dolar .centrado strong');
        if (!elemento) return null;
        // Limpiamos el texto: removemos espacios, cambiamos coma por punto
        return elemento.textContent.replace(/\s/g, '').replace(',', '.').trim();
      });

      if (!price) {
        throw new Error('No se pudo encontrar el valor en el selector del BCV');
      }
      
      return parseFloat(price);
    } catch (error) {
      console.error(`Error in BCVProvider (Scraping): ${error.message}`);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = BCVProvider;
