const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment-timezone');

function guardarDataJS(parcial) {
  let data = {};
  if (fs.existsSync('data.js')) {
    try {
      const raw = fs.readFileSync('data.js', 'utf8');
      data = eval(raw.replace('window.data =', '').replace(';', ''));
    } catch (e) {
      data = {};
    }
  }
  Object.assign(data, parcial);
  data.ultima_actualizacion_hora = moment().tz('America/Caracas').format('HH:mm:ss');
  fs.writeFileSync('data.js', 'window.data = ' + JSON.stringify(data, null, 2) + ';', 'utf8');
  console.log('Data written to data.js:', data);
}

// Función para obtener el dólar oficial
async function obtenerDolarOficial() {
  try {
    console.log('Iniciando scraping del dólar oficial...');
    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
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
      return elemento ? elemento.textContent.replace(/\s/g, '').replace(',', '.').trim() : null;
    });
    console.log('Valor extraído:', dolarOficial);

    await browser.close();
    console.log('Navegador cerrado.');

    if (dolarOficial) {
      console.log('Dólar oficial actualizado:', dolarOficial);
      return parseFloat(dolarOficial.replace(',', '.'));
    } else {
      console.log('No se pudo encontrar el valor del dólar oficial.');
      return null;
    }
  } catch (error) {
    console.error('Error al hacer scraping del dólar oficial:', error);
    return null;
  }
}

// Función para obtener el dólar paralelo
async function obtenerDolarParalelo() {
  try {
    console.log('Iniciando scraping del dólar paralelo...');
    console.log('CHROME_PATH:', process.env.CHROME_PATH);
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    console.log('Navegador iniciado.');
    const page = await browser.newPage();
    console.log('Nueva página creada.');
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    console.log('User-Agent configurado.');

    await page.goto('https://monitordolarvenezuela.com/precio-dolar-paralelo', { waitUntil: 'networkidle2' });
    console.log('Página cargada.');

    await page.waitForSelector('#precio-paralelo', { timeout: 10000 });
    const dolarParalelo = await page.evaluate(() => {
      const elemento = document.querySelector('#precio-paralelo');
      return elemento ? elemento.textContent.replace(/\s/g, '').replace(',', '.').trim() : null;
    });

    console.log('Valor extraído:', dolarParalelo);

    await browser.close();
    console.log('Navegador cerrado.');

    if (dolarParalelo) {
      console.log('Dólar paralelo actualizado:', dolarParalelo);
      return parseFloat(dolarParalelo.replace(',', '.'));
    } else {
      console.log('No se pudo encontrar el valor del dólar paralelo.');
      return null;
    }
  } catch (error) {
    console.error('Error al hacer scraping del dólar paralelo:', error);
    return null;
  }
}

// Detectar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--todo')) {
  (async () => {
    const dolar_oficial = await obtenerDolarOficial();
    const dolar_paralelo = await obtenerDolarParalelo();
    guardarDataJS({
      dolar_oficial,
      dolar_paralelo
    });
  })();
} else if (args.includes('--promedio')) {
  (async () => {
    let data = {};
    if (fs.existsSync('data.js')) {
      try {
        const raw = fs.readFileSync('data.js', 'utf8');
        data = eval(raw.replace('window.data =', '').replace(';', ''));
      } catch (e) {
        data = {};
      }
    }
    if (data.dolar_oficial && data.dolar_paralelo) {
      data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      guardarDataJS(data);
      console.log('Dólar promedio:', data.dolar_promedio);
    } else {
      console.log('No se puede calcular el dólar promedio. Asegúrate de haber actualizado el dólar oficial y paralelo.');
    }
  })();
} else {
  console.log('Por favor, ejecuta con --todo o --promedio como argumento.');
}

