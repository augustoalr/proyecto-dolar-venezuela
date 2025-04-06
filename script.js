// Función para cargar los datos del archivo JSON
async function cargarDatos() {
    try {
      // Hacemos una solicitud HTTP para obtener el archivo JSON
      const response = await fetch('data.json');
      const data = await response.json();
  
      // Actualizamos los elementos HTML con los datos del JSON
      document.getElementById('dolar-oficial').querySelector('.price').textContent = `${data.dolar_oficial} Bs`;
      document.getElementById('dolar-promedio').querySelector('.price').textContent = `${data.dolar_promedio} Bs`;
      document.getElementById('dolar-paralelo').querySelector('.price').textContent = `${data.dolar_paralelo} Bs`;
  
      // Actualizamos la fecha de la última actualización
      document.getElementById('ultima-actualizacion').textContent = data.ultima_actualizacion;
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }
  
  // Cargamos los datos cuando se carga la página
  document.addEventListener('DOMContentLoaded', cargarDatos);