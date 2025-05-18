document.addEventListener('DOMContentLoaded', () => {
  // Verifica si 'data' está definido (por si data.js no se cargó)
  if (typeof data === 'undefined') {
    console.error('Error: data no está definido. Revisa data.js');
    return;
  }

  // Función auxiliar para formatear valores
  const formatValue = (value) => {
    return value !== undefined && value !== null ? 
      `${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs` : 
      "No disponible";
  };

  // Actualiza los elementos del DOM
  document.getElementById('dolar-oficial').querySelector('.price').textContent = formatValue(data.dolar_oficial);
  document.getElementById('dolar-promedio').querySelector('.price').textContent = formatValue(data.dolar_promedio);
  document.getElementById('dolar-paralelo').querySelector('.price').textContent = formatValue(data.dolar_paralelo);

  // Actualiza la hora
  if (data.ultima_actualizacion_hora) {
    document.getElementById('ultima-actualizacion-hora').textContent = data.ultima_actualizacion_hora;
  }
});

// Calculadora de divisas

// Función para formatear números


// Inicializa calculadoras
function initCalculators() {
  // Calculadora Promedio
  const inputPromedio = document.getElementById('bsd-promedio');
  const resultadoPromedio = document.getElementById('resultado-promedio');
  const tasaPromedio = document.getElementById('tasa-promedio');

  // Calculadora de venta Dolar promedio
  const inputVenta = document.getElementById('usd-venta');
  const resultadoVenta = document.getElementById('resultado-venta');
  const tasaVenta = document.getElementById('tasa-venta');

  // Calculadora BCV
  const inputBcv = document.getElementById('bsd-bcv');
  const resultadoBcv = document.getElementById('resultado-bcv');
  const tasaBcv = document.getElementById('tasa-bcv');



  // Actualiza tasas al cargar/cambiar data.js
  function updateTasas() {
    if (data.dolar_promedio) {
      tasaPromedio.textContent = data.dolar_promedio.toFixed(2);
    }
    if (data.dolar_promedio) {
      tasaVenta.textContent = data.dolar_promedio.toFixed(2);
    }
    if (data.dolar_oficial) {
      tasaBcv.textContent = data.dolar_oficial.toFixed(2);
    }
  }

  // Conversión Promedio
  inputPromedio.addEventListener('input', () => {
    if (data.dolar_promedio) {
      resultadoPromedio.textContent = (inputPromedio.value / data.dolar_promedio).toFixed(2);
    }
  });

  // Conversión Venta
  inputVenta.addEventListener('input', () => {
    if (data.dolar_promedio) {
      resultadoVenta.textContent = (inputVenta.value * data.dolar_promedio).toFixed(2);
    }
  });

  // Conversión BCV
  inputBcv.addEventListener('input', () => {
    if (data.dolar_oficial) {
      resultadoBcv.textContent = (inputBcv.value / data.dolar_oficial).toFixed(2);
    }
  });

  // Inicializa
  updateTasas();
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', () => {
  initCalculators(); // Reemplaza initCalculator()
});

// En tu script.js
async function loadNews() {
  const apiKey = '8037ba95720e4047bb3ed71baeb51c9d'; // Regístra una key gratis en https://newsapi.org/
  const query = 'dolar+venezuela';
  const url = `https://newsapi.org/v2/everything?q=${query}&language=es&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayNews(data.articles.slice(0, 6)); // Muestra las 6 más recientes
  } catch (error) {
    console.error("Error cargando noticias:", error);
    document.getElementById('news-feed').innerHTML = `
      <p class="news-error">No se pudieron cargar noticias. <a href="#" onclick="loadNews()">Reintentar</a></p>
    `;
  }
}

function displayNews(articles) {
  const newsContainer = document.getElementById('news-feed');
  newsContainer.innerHTML = articles.map(article => `
    <div class="news-article">
      <h3>${article.title}</h3>
      <p>${article.description || 'Sin descripción disponible'}...</p>
      <a href="${article.url}" target="_blank">Leer más →</a>
    </div>
  `).join('');
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  initCalculators();
  loadNews(); // Añade esta línea
});