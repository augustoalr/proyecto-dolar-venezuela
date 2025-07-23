document.addEventListener('DOMContentLoaded', () => {
  // Verifica si 'data' está definido (por si data.js no se cargó)
  if (typeof data === 'undefined') {
    console.error('Error: data no está definido. Revisa data.js');
    // Ocultar elementos que dependen de 'data'
    document.getElementById('dolar-oficial').style.display = 'none';
    document.querySelector('.card:nth-of-type(2)').style.display = 'none'; // Oculta el card de calculadoras
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

  // Actualiza la hora
  if (data.ultima_actualizacion_hora) {
    document.getElementById('ultima-actualizacion-hora').textContent = data.ultima_actualizacion_hora;
  }

  // Inicializa las calculadoras y las noticias
  initCalculators();
  loadNews();
});

// Inicializa calculadoras
function initCalculators() {
  const dolarOficial = data.dolar_oficial;

  // Si no hay tasa oficial, no se puede continuar
  if (!dolarOficial) {
    // Opcional: deshabilitar o ocultar las calculadoras
    document.querySelector('.card:nth-of-type(2)').style.display = 'none';
    return;
  }

  // Calculadora de VENTA (USD a BsD)
  const inputVenta = document.getElementById('usd-venta');
  const resultadoVenta = document.getElementById('resultado-venta');
  const tasaVenta = document.getElementById('tasa-venta');

  // Calculadora de COMPRA (BsD a USD)
  const inputBcv = document.getElementById('bsd-bcv');
  const resultadoBcv = document.getElementById('resultado-bcv');
  const tasaBcv = document.getElementById('tasa-bcv');

  // Actualiza las tasas en la UI
  tasaVenta.textContent = dolarOficial.toFixed(2);
  tasaBcv.textContent = dolarOficial.toFixed(2);

  // Event listener para la calculadora de VENTA
  inputVenta.addEventListener('input', () => {
    const montoUSD = parseFloat(inputVenta.value);
    if (!isNaN(montoUSD)) {
      resultadoVenta.textContent = (montoUSD * dolarOficial).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      resultadoVenta.textContent = '0.00';
    }
  });

  // Event listener para la calculadora de COMPRA
  inputBcv.addEventListener('input', () => {
    const montoBsD = parseFloat(inputBcv.value);
    if (!isNaN(montoBsD)) {
      resultadoBcv.textContent = (montoBsD / dolarOficial).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      resultadoBcv.textContent = '0.00';
    }
  });
}


// Carga de noticias
async function loadNews() {
  const apiKey = '8037ba95720e4047bb3ed71baeb51c9d'; // Regístra una key gratis en https://newsapi.org/
  const query = 'dolar+venezuela';
  const url = `https://newsapi.org/v2/everything?q=${query}&language=es&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newsData = await response.json();
    displayNews(newsData.articles.slice(0, 6)); // Muestra las 6 más recientes
  } catch (error) {
    console.error("Error cargando noticias:", error);
    document.getElementById('news-feed').innerHTML = `
      <p class="news-error">No se pudieron cargar noticias. <a href="#" onclick="loadNews()">Reintentar</a></p>
    `;
  }
}

function displayNews(articles) {
  const newsContainer = document.getElementById('news-feed');
  if (!articles || articles.length === 0) {
    newsContainer.innerHTML = '<p>No hay noticias disponibles en este momento.</p>';
    return;
  }
  newsContainer.innerHTML = articles.map(article => `
    <div class="news-article">
      <h3><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
      <p>${article.description || 'Sin descripción disponible'}...</p>
    </div>
  `).join('');
}