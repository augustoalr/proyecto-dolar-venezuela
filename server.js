const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment-timezone');

function guardarDataJS(data) {
  const fileContent = `window.data = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync('data.js', fileContent, 'utf8');
  console.log('Data written to data.js:', data);
}

// Función para obtener el dólar oficial
async function obtenerDolarOficial() {
  try {
    console.log('Iniciando scraping del dólar oficial...');

    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    const browser = await puppeteer.launch({
       executablePath: process.env.CHROME_PATH, // ¡Esto es CLAVE!
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    console.log('Navegador iniciado.');
    const page = await browser.newPage();
    console.log('Nueva página creada.');

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    console.log('User-Agent configurado.');
    
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2', timeout: 60000});
    console.log('Página cargada.');

    const dolarOficial = await page.evaluate(() => {
      const elemento = document.querySelector('#dolar .centrado strong');
      return elemento ? elemento.textContent.trim() : null;
    });

    console.log('Valor extraído:', dolarOficial);

    await browser.close();
    console.log('Navegador cerrado.');

    if (dolarOficial) {
      const data = fs.existsSync('data.json')
        ? JSON.parse(fs.readFileSync('data.json', 'utf8'))
        : {};
      data.dolar_oficial = parseFloat(dolarOficial.replace(',', '.'));
      if (data.dolar_paralelo) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }
      data.ultima_actualizacion = moment().tz('America/Caracas').toISOString();
      data.ultima_actualizacion_hora = moment().tz('America/Caracas').format('HH:mm:ss');
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
      guardarDataJS(data);
      console.log('Dólar oficial actualizado:', data.dolar_oficial);
    } else {
      console.log('No se pudo encontrar el valor del dólar oficial.');
    }
  } catch (error) {
    console.error('Error al hacer scraping del dólar oficial:', error);
  }
}

// Función para obtener el dólar paralelo
async function obtenerDolarParalelo() {
  try {
    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    const executablePath = process.env.CHROME_PATH || require('puppeteer').executablePath();

    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    const browser = await puppeteer.launch({
      // executablePath: process.env.CHROME_PATH, // ¡Esto es CLAVE!
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto('https://monitordolarvenezuela.com/precio-dolar-paralelo', { waitUntil: 'networkidle2' });

    const dolarParalelo = await page.evaluate(() => {
      const elemento = document.querySelector('#precio-paralelo');
      return elemento ? elemento.textContent.trim() : null;
    });

    await browser.close();

    if (dolarParalelo) {
      const data = fs.existsSync('data.json')
        ? JSON.parse(fs.readFileSync('data.json', 'utf8'))
        : {};
      data.dolar_paralelo = parseFloat(dolarParalelo.replace(',', '.'));
      if (data.dolar_oficial) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }
      data.ultima_actualizacion = moment().tz('America/Caracas').toISOString();
      data.ultima_actualizacion_hora = moment().tz('America/Caracas').format('HH:mm:ss');
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
      guardarDataJS(data);
      console.log('Dólar paralelo actualizado:', data.dolar_paralelo);
    }
  } catch (error) {
    console.error('Error al hacer scraping del dólar paralelo:', error);
  }
}

// Detectar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--oficial')) {
  (async () => {
    await obtenerDolarOficial();
  })();
} else if (args.includes('--paralelo')) {
  (async () => {
    await obtenerDolarParalelo();
  })();
} else if (args.includes('--promedio')) {
  (async () => {
    const data = fs.existsSync('data.json')
      ? JSON.parse(fs.readFileSync('data.json', 'utf8'))
      : {};
    if (data.dolar_oficial && data.dolar_paralelo) {
      data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      guardarDataJS(data);
      console.log('Dólar promedio:', data.dolar_promedio);
    } else {
      console.log('No se puede calcular el dólar promedio. Asegúrate de haber actualizado el dólar oficial y paralelo.');
    }
  })();
} else {
  console.log('Por favor, especifica --oficial, --paralelo o --promedio como argumento.')


}