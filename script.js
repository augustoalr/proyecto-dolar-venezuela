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