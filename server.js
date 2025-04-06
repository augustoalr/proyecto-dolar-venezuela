const puppeteer = require('puppeteer');
const fs = require('fs');
const cron = require('node-cron'); // Importa node-cron
const moment = require('moment-timezone'); // Importa moment-timezone

async function obtenerDolarOficial() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Configura un User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navega a la página del BCV
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2' });

    // Espera explícitamente al selector o al contenido visible
    await page.waitForFunction(() => {
      const elemento = document.querySelector('#dolar .centrado strong');
      return elemento && elemento.textContent.trim().length > 0;
    }, { timeout: 20000 });

    // Extrae el precio del dólar oficial
    const dolarOficial = await page.evaluate(() => {
      const elemento = document.querySelector('#dolar .centrado strong');
      return elemento ? elemento.textContent.trim() : null;
    });

    // Cierra el navegador
    await browser.close();

    // Si se obtuvo el precio, actualiza el archivo data.json
    if (dolarOficial) {
      const fechaActual = moment().tz('America/Caracas').format('DD/MM/YYYY');
      console.log(`Fecha actual en Caracas: ${fechaActual}`);
      const data = {
        dolar_oficial: parseFloat(dolarOficial.replace(',', '.')),
        dolar_promedio: 0,
        dolar_paralelo: 0,
        ultima_actualizacion: fechaActual,
      };

      // Calcula el promedio si también existe el dólar paralelo
      if (data.dolar_paralelo) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }

      data.ultima_actualizacion = fechaActual;

      // Escribe los datos en el archivo data.json
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('El archivo data.json se actualizó correctamente.');
    } else {
      console.log('No se pudo obtener el precio del dólar oficial.');
    }

    return dolarOficial;
  } catch (error) {
    console.error('Error al hacer scraping:', error);
    return null;
  }
}

async function obtenerDolarParalelo() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Configura un User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navega a la página monitordolarvenezuela.com
    await page.goto('https://monitordolarvenezuela.com/precio-dolar-paralelo', { waitUntil: 'networkidle2' });

    // Espera explícitamente al selector o al contenido visible
    await page.waitForFunction(() => {
      const elemento = document.querySelector('#precio-paralelo');
      return elemento && elemento.textContent.trim().length > 0;
    }, { timeout: 30000 });

    // Extrae el precio del dólar paralelo
    const dolarParalelo = await page.evaluate(() => {
      const elemento = document.querySelector('#precio-paralelo');
      return elemento ? elemento.textContent.trim() : null;
    });

    // Cierra el navegador
    await browser.close();

    // Si se obtuvo el precio, actualiza el archivo data.json
    if (dolarParalelo) {
      const fechaActual = moment().tz('America/Caracas').format('DD/MM/YYYY');
      console.log(`Fecha actual en Caracas: ${fechaActual}`);
      const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
      data.dolar_paralelo = parseFloat(dolarParalelo.replace(',', '.'));
      data.ultima_actualizacion = fechaActual;

      // Calcula el promedio si también existe el dólar oficial
      if (data.dolar_oficial) {
        data.dolar_promedio = (data.dolar_oficial + data.dolar_paralelo) / 2;
      }

      data.ultima_actualizacion = fechaActual;

      // Escribe los datos en el archivo data.json
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('El archivo data.json se actualizó correctamente con el dólar paralelo.');
    } else {
      console.log('No se pudo obtener el precio del dólar paralelo.');
    }

    return dolarParalelo;
  } catch (error) {
    console.error('Error al hacer scraping del dólar paralelo', error);
    return null;
  }
}

  //  - La sintaxis `'0 9 * * *'` significa:
  //    - `0`: Minuto 0.
  //    - `9`: Hora 9 (AM).
  //    - `*`: Todos los días del mes.
  //    - `*`: Todos los meses.
  //    - `*`: Todos los días de la semana.

// Programar la tarea para ejecutarse a una hora específica (por ejemplo, a las 9:00 AM)
cron.schedule('2 13 * * *', () => {
  console.log('Ejecutando tarea programada para obtener el precio del dólar...');
  obtenerDolarParalelo();
});

// También puedes ejecutar la función manualmente si lo necesitas
 //obtenerDolarParalelo();

 // Ejecuta las funciones manualmente para pruebas
 (async () => {
  console.log('Iniciando pruebas...');
   await obtenerDolarOficial();
  await obtenerDolarParalelo();
 })();
