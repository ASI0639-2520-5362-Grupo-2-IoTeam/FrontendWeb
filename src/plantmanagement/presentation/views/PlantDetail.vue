<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Button from 'primevue/button';
import { PlantsService } from '../../infrastructure/plats.services.ts';
import type { Plant as PlantEntity } from '../../domain/model/plants.entity.ts';

interface HumidityData {
  day: string;
  value: number;
}

// Interfaz que usa el template (mantenerla para no tocar el template ni estilos)
interface PlantView {
  id: number;
  name: string;
  type: string;
  icon: string;
  humidity: number;
  lastWatered: string;
  status: 'healthy' | 'warning' | 'critical';
  location: string;
  nextWatering: string;
  bio?: string; // Nueva propiedad bio
  imageUrl?: string; // Nueva propiedad para imagen
}

const router = useRouter();
const route = useRoute();
const plantsService = new PlantsService();

const plant = ref<PlantView | null>(null);

const plantId = Number(route.params.id);

function mapEntityToView(e: PlantEntity): PlantView {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    icon: '', // Se agrega para cumplir con la interfaz, pero no se usa
    humidity: e.humidity ?? 0,
    lastWatered: e.lastWatered ?? '',
    status: e.status ?? 'healthy',
    location: e.location ?? '',
    nextWatering: e.nextWatering ?? '',
    bio: e.bio ?? 'Esta planta es especial por su resistencia y belleza. Ideal para interiores y fácil de cuidar.',
    imageUrl: e.imgUrl ?? '/src/assets/vue.svg', // Usar imgUrl real
  };
}

onMounted(async () => {
  try {
    const response = await plantsService.getPlantById(plantId);
    // response.data es la entidad completa; la mapeamos a lo que espera el template
    plant.value = mapEntityToView(response.data as PlantEntity);
  } catch (err) {
    console.error('Error cargando planta:', err);
    plant.value = null;
  }
});

const humidityData = ref<HumidityData[]>([
  { day: 'Mon', value: 65 },
  { day: 'Tue', value: 70 },
  { day: 'Wed', value: 68 },
  { day: 'Thu', value: 72 },
  { day: 'Fri', value: 75 },
  { day: 'Sat', value: 71 },
  { day: 'Sun', value: 72 },
]);

const goBack = () => {
  router.push('/plants');
};

const handleChangePhoto = () => {
  console.log('Change photo');
};

const handleEditInfo = () => {
  console.log('Edit info');
};

const handleEdit = () => {
  console.log('Edit plant');
};

const handleDelete = async () => {
  const confirmed = window.confirm('¿Estás seguro de que deseas borrar esta planta? Esta acción no se puede deshacer.');
  if (!confirmed) return;
  try {
    await plantsService.deletePlant(plantId);
    window.alert('Planta eliminada correctamente.');
    router.push('/plants'); // Redirige a la lista de plantas
  } catch (err) {
    console.error('Error al borrar la planta:', err);
    window.alert('Hubo un error al borrar la planta.');
  }
};

const handleWaterNow = () => {
  console.log('Water now');
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  // Ejemplo: 7 oct 2025, 10:00
  return d.toLocaleString('es-PE', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}
</script>

<template>
  <div class="plant-detail">
    <button class="back-button" @click="goBack">
      ← Back to Plants
    </button>
    <div v-if="plant" class="content">
      <div class="image-section">
        <div class="plant-img-bg">
          <img :src="plant.imageUrl" alt="Plant" class="plant-img" />
        </div>
        <div class="image-actions">
          <Button
              label="📷 Change Photo"
              outlined
              @click="handleChangePhoto"
          />
          <Button
              label="📝 Edit Info"
              class="btn-secondary"
              @click="handleEditInfo"
          />
        </div>
        <div class="plant-bio-card">
          <span class="bio-icon">🌱</span>
          <p class="plant-bio-text">
            {{ plant.bio }}
          </p>
        </div>
      </div>

      <!-- Detail Section -->
      <div class="detail-section">
        <!-- Header -->
        <div class="header">
          <div class="title-row">
            <div>
              <h1 class="plant-name">{{ plant.name }}</h1>
              <p class="plant-type">{{ plant.type }} • {{ plant.location }}</p>
            </div>
            <div class="actions">
              <button
                  class="icon-button"
                  @click="handleEdit"
              >
                ✏️
              </button>
              <button
                  class="icon-button danger"
                  @click="handleDelete"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="status-badge healthy">
            <span class="status-dot"></span>
            Healthy
          </div>

          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-value">{{ plant.humidity }}%</div>
              <div class="stat-label">Current Humidity</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ formatDate(plant.lastWatered) }}</div>
              <div class="stat-label">Last Watered</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ formatDate(plant.nextWatering) }}</div>
              <div class="stat-label">Next Watering</div>
            </div>
          </div>
        </div>

        <!-- Humidity Chart -->
        <div class="chart-card">
          <h3 class="card-title">Humidity Levels (Last 7 Days)</h3>
          <div class="chart">
            <div
                v-for="(data, index) in humidityData"
                :key="index"
                class="chart-bar"
                :style="{ height: `${data.value}%` }"
            >
              <span class="chart-label">{{ data.day }}</span>
            </div>
          </div>
        </div>

        <!-- Watering Recommendation -->
        <div class="recommendation-card">
          <div class="recommendation-content">
            <div class="recommendation-info">
              <h3>💧 Watering Recommendation</h3>
              <p>Your {{ plant.name }} is doing well! Next watering recommended in 5 days.</p>
            </div>
            <button
                class="water-button"
                @click="handleWaterNow"
            >
              Water Now
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <h2>Planta no encontrada</h2>
      <p>El ID especificado no corresponde a ninguna planta registrada.</p>
      <button class="back-button" @click="goBack">
        ← Volver al listado
      </button>
    </div>
  </div>
</template>

<style scoped>
.plant-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  cursor: pointer;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.back-button:hover {
  color: var(--primary-green);
  background: rgba(138, 199, 61, 0.08);
}

.content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-xl);
}

.image-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.plant-img-bg {
  background: linear-gradient(135deg, #43ea7c 0%, #2dbd6e 100%);
  border-radius: 1.5rem;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.plant-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(67,234,124,0.15);
  background: #fff;
}

.image-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: 1rem;
}

.btn-secondary {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.btn-secondary:hover {
  border-color: var(--primary-green) !important;
}

.plant-bio-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(67,234,124,0.12);
  border: 1.5px solid #43ea7c;
  padding: 1.2rem 1.5rem;
  max-width: 370px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.bio-icon {
  font-size: 2rem;
  color: #43ea7c;
  margin-bottom: 0.5rem;
}

.plant-bio-text {
  color: #222;
  font-size: 1.15rem;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: 0.01em;
  margin: 0;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.header {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.plant-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.plant-type {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.icon-button:hover {
  border-color: var(--primary-green);
  background: rgba(138, 199, 61, 0.08);
}

.icon-button.danger:hover {
  border-color: var(--status-critical);
  background: rgba(239, 68, 68, 0.08);
  color: var(--status-critical);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: rgba(138, 199, 61, 0.15);
  margin-bottom: var(--spacing-lg);
}

.status-badge.healthy {
  color: var(--status-healthy);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.stat-box {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.chart {
  width: 100%;
  height: 300px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: var(--spacing-lg);
  gap: var(--spacing-sm);
}

.chart-bar {
  flex: 1;
  background: var(--primary-green);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  position: relative;
  transition: all 0.3s ease;
  min-height: 20px;
}

.chart-bar:hover {
  background: var(--secondary-green);
  transform: translateY(-4px);
}

.chart-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--text-light);
  white-space: nowrap;
}

.recommendation-card {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  color: #ffffff;
  box-shadow: var(--shadow-md);
}

.recommendation-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-info h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-sm) 0;
}

.recommendation-info p {
  opacity: 0.95;
  margin: 0;
}

.water-button {
  background: #ffffff;
  color: var(--primary-green);
  padding: 12px 32px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.water-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.not-found {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.not-found h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.not-found p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 992px) {
  .content {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .image-section {
    padding: var(--spacing-lg);
  }


  .stats-row {
    grid-template-columns: 1fr;
  }

  .recommendation-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }

  .water-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .plant-img-bg {
    padding: 1rem 0.5rem;
  }
  .plant-bio-card {
    font-size: 1rem;
    max-width: 95vw;
    padding: 1rem 0.5rem;
  }
}
</style>