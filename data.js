

fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
guardarDataJS(data);

function guardarDataJS(data) {
  const fileContent = `window.data = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync('data.js', fileContent, 'utf8');
  console.log('Data written to data.js:', data);
}


window.data = {
  "dolar_oficial": 72.1856,
  "dolar_promedio": 84.7928,
  "dolar_paralelo": 97.4,
  "ultima_actualizacion": "2025-04-23T06:56:04.047Z",
  "ultima_actualizacion_hora": "6:56:04 a. m."
};

