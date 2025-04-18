const puppeteer = require('puppeteer');
const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment-timezone');

// Simulación de datos obtenidos del scraping
const data = {
  dolar_oficial: 72.1856,
  dolar_promedio: 84.7928,
  dolar_paralelo: 97.4,
  ultima_actualizacion: new Date().toISOString(),
  ultima_actualizacion_hora: new Date().toLocaleTimeString('es-VE')
};

// Escribir los datos en data.js
const contenido = `window.data = ${JSON.stringify(data, null, 2)};`;
fs.writeFileSync('data.js', contenido, 'utf8');
console.log('Archivo data.js actualizado correctamente.');

// Función para obtener el dólar oficial
async function obtenerDolarOficial() {
  try {
    console.log('Iniciando scraping del dólar oficial...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
      const fechaActual = moment().tz('America/Caracas').format('DD-MM-YYYY / HH:mm:ss');
      //const horaActual = moment().tz('America/Caracas').format('HH:mm:ss');
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      data.dolar_oficial = parseFloat(dolarOficial.replace(',', '.'));
      if (data.dolar_paralelo) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }
      data.ultima_actualizacion = fechaActual;
      //data.ultima_actualizacion_hora = horaActual;
      

     
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
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
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://monitordolarvenezuela.com/precio-dolar-paralelo', { waitUntil: 'networkidle2' });

    const dolarParalelo = await page.evaluate(() => {
      const elemento = document.querySelector('#precio-paralelo');
      return elemento ? elemento.textContent.trim() : null;
    });

    await browser.close();

    if (dolarParalelo) {
      const fechaActual = moment().tz('America/Caracas').format('DD-MM-YYYY / HH:mm:ss');
      //const horaActual = moment().tz('America/Caracas').format('HH:mm:ss');
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      data.dolar_paralelo = parseFloat(dolarParalelo.replace(',', '.'));
      if (data.dolar_oficial) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }
      data.ultima_actualizacion = fechaActual;
      //data.ultima_actualizacion_hora = horaActual;
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
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
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    if (data.dolar_oficial && data.dolar_paralelo) {
      data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      console.log('Dólar promedio:', data.dolar_promedio);
    } else {
      console.log('No se puede calcular el dólar promedio. Asegúrate de haber actualizado el dólar oficial y paralelo.');
    }
  })();
} else {
  console.log('Por favor, especifica --oficial, --paralelo o --promedio como argumento.');
}


