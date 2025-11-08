/**
 * Script de prueba para los endpoints de plantas
 * Ejecutar en la consola del navegador después de iniciar sesión
 */

// 1. Verificar autenticación
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userUuid');

console.log('🔍 Verificación de autenticación:');
console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
console.log('UserId:', userId || '❌ Ausente');

if (!token || !userId) {
  console.error('❌ No estás autenticado. Por favor, inicia sesión primero.');
  throw new Error('Not authenticated');
}

// 2. Decodificar token para ver información
const tokenPayload = JSON.parse(atob(token.split('.')[1]));
console.log('📄 Token payload:', tokenPayload);
console.log('⏰ Expira:', new Date(tokenPayload.exp * 1000));

// 3. Importar servicio (ejecutar desde un componente Vue o usar axios directamente)
import axios from 'axios';

// Configurar axios con baseURL
const api = axios.create({
  baseURL: '/api/v1', // Ajustar según tu configuración
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 4. Función para crear una planta de prueba
async function crearPlantaPrueba() {
  console.log('🌱 Creando planta de prueba...');

  try {
    const response = await api.post('/plants', {
      name: "Planta de Prueba",
      type: "test",
      location: "Oficina",
      bio: "Esta es una planta de prueba creada por el script",
      imgUrl: "https://via.placeholder.com/200",
      status: "HEALTHY"
      // ⚠️ NO incluir userId - el backend lo toma del token
    });

    console.log('✅ Planta creada exitosamente:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error al crear planta:', error.response?.data || error.message);
    throw error;
  }
}

// 5. Función para regar una planta
async function regarPlanta(plantId) {
  console.log(`💧 Regando planta ${plantId}...`);

  try {
    const response = await api.post(`/plants/${plantId}/water`, {
      // Body vacío = usar fecha actual del servidor
      // O especificar: { wateredAt: new Date().toISOString() }
    });

    console.log('✅ Planta regada exitosamente:', response.data);
    console.log('📅 Último riego:', response.data.lastWatered);
    console.log('📅 Próximo riego:', response.data.nextWatering);
    return response.data;

  } catch (error) {
    console.error('❌ Error al regar planta:', error.response?.data || error.message);

    if (error.response?.status === 403) {
      console.error('⚠️ Esta planta no te pertenece');
    } else if (error.response?.status === 404) {
      console.error('⚠️ Planta no encontrada');
    }

    throw error;
  }
}

// 6. Función para obtener todas las plantas del usuario
async function obtenerMisPlantas() {
  console.log('📋 Obteniendo mis plantas...');

  try {
    const response = await api.get(`/plants/users/${userId}/plants`);

    console.log(`✅ Se encontraron ${response.data.length} plantas:`);
    response.data.forEach((plant, index) => {
      console.log(`${index + 1}. ${plant.name} (${plant.type}) - Estado: ${plant.status}`);
    });

    return response.data;

  } catch (error) {
    console.error('❌ Error al obtener plantas:', error.response?.data || error.message);
    throw error;
  }
}

// 7. Función de prueba completa
async function ejecutarPruebaCompleta() {
  console.log('🚀 Iniciando prueba completa...\n');

  try {
    // Paso 1: Obtener plantas existentes
    console.log('--- PASO 1: Obtener plantas existentes ---');
    const plantasExistentes = await obtenerMisPlantas();
    console.log('\n');

    // Paso 2: Crear una nueva planta
    console.log('--- PASO 2: Crear nueva planta ---');
    const nuevaPlanta = await crearPlantaPrueba();
    console.log('\n');

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Paso 3: Regar la planta recién creada
    console.log('--- PASO 3: Regar la planta ---');
    const plantaRegada = await regarPlanta(nuevaPlanta.id);
    console.log('\n');

    // Paso 4: Verificar que se actualizó
    console.log('--- PASO 4: Verificación ---');
    const plantasActualizadas = await obtenerMisPlantas();
    console.log('\n');

    console.log('✅ ¡Prueba completa exitosa!');

    return {
      plantasExistentes,
      nuevaPlanta,
      plantaRegada,
      plantasActualizadas
    };

  } catch (error) {
    console.error('❌ La prueba falló:', error.message);
    throw error;
  }
}

// 8. Exportar funciones para uso manual
console.log(`
📝 Funciones disponibles:
- crearPlantaPrueba()     : Crea una planta de prueba
- regarPlanta(plantId)    : Riega una planta específica
- obtenerMisPlantas()     : Obtiene todas tus plantas
- ejecutarPruebaCompleta(): Ejecuta todas las pruebas

💡 Ejemplo de uso:
  await ejecutarPruebaCompleta()
`);

// Ejecutar automáticamente (comentar si no deseas ejecución automática)
// ejecutarPruebaCompleta().catch(console.error);

