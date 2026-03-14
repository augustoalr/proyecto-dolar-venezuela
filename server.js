const fs = require('fs');
const moment = require('moment-timezone');
const BCVProvider = require('./src/providers/bcv');
const BinanceP2PProvider = require('./src/providers/binanceP2P');
const BTCProvider = require('./src/providers/btc');

// Configuración de proveedores
const providers = [
  new BCVProvider(),
  new BinanceP2PProvider(),
  new BTCProvider()
];

function guardarDataJS(parcial) {
  let data = {};
  if (fs.existsSync('data.js')) {
    try {
      const raw = fs.readFileSync('data.js', 'utf8');
      // Limpia la cadena para convertirla en JSON válido
      const jsonStr = raw.replace('window.data =', '').replace(/;$/, '').trim();
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Error reading data.js, starting with empty object:', e.message);
      data = {};
    }
  }

  // Mezclar nuevos datos
  Object.assign(data, parcial);
  data.ultima_actualizacion_hora = moment().tz('America/Caracas').format('HH:mm:ss');
  data.ultima_actualizacion_fecha = moment().tz('America/Caracas').format('DD/MM/YYYY');
  
  // Guardamos como script para el frontend
  fs.writeFileSync('data.js', `window.data = ${JSON.stringify(data, null, 2)};`, 'utf8');
  console.log('Data successfully written to data.js');
}

async function runScraper() {
  console.log('--- Iniciando VEX EXCHANGE Scraper ---');
  const results = {};

  for (const provider of providers) {
    console.log(`Ejecutando proveedor: ${provider.name}...`);
    const price = await provider.getPrice();
    if (price !== null) {
      results[provider.name.toLowerCase()] = price;
      console.log(`> ${provider.name}: ${price}`);
    } else {
      console.error(`> ${provider.name}: Error al obtener precio.`);
    }
  }

  if (Object.keys(results).length > 0) {
    guardarDataJS(results);
  } else {
    console.error('No se obtuvieron resultados de ningún proveedor.');
  }
}

// Ejecución principal
const args = process.argv.slice(2);

if (args.includes('--todo')) {
  runScraper().then(() => {
    console.log('--- Proceso completado ---');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
} else {
  console.log('Uso: node server.js --todo');
}

// Exportar para posibles pruebas
module.exports = { runScraper, providers };