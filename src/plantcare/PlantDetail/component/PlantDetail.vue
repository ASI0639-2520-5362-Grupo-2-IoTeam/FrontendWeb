<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Button from 'primevue/button';

interface HumidityData {
  day: string;
  value: number;
}

interface Plant {
  id: number;
  name: string;
  type: string;
  icon: string;
  humidity: number;
  lastWatered: string;
  status: 'healthy' | 'warning' | 'critical';
  location: string;
  nextWatering: string;
}

const router = useRouter();
const route = useRoute();

const plants: Plant[] = [
  { id: 1, name: 'Monstera Deliciosa', type: 'Tropical', icon: '🌿', humidity: 72, lastWatered: '2 days ago', status: 'healthy', location: 'Living Room', nextWatering: 'In 5 days' },
  { id: 2, name: 'Snake Plant', type: 'Succulent', icon: '🪴', humidity: 45, lastWatered: '1 week ago', status: 'warning', location: 'Bedroom', nextWatering: 'In 2 days' },
  { id: 3, name: 'Fiddle Leaf Fig', type: 'Tropical', icon: '🌱', humidity: 55, lastWatered: 'Today', status: 'healthy', location: 'Office', nextWatering: 'In 7 days' },
  { id: 4, name: 'Peace Lily', type: 'Flowering', icon: '🌺', humidity: 68, lastWatered: '3 days ago', status: 'healthy', location: 'Kitchen', nextWatering: 'In 4 days' },
  { id: 5, name: 'Pothos', type: 'Vine', icon: '🍃', humidity: 25, lastWatered: '2 weeks ago', status: 'critical', location: 'Bathroom', nextWatering: 'Today' },
  { id: 6, name: 'Rubber Plant', type: 'Tropical', icon: '🌳', humidity: 65, lastWatered: '4 days ago', status: 'healthy', location: 'Hallway', nextWatering: 'In 3 days' },
];

const plantId = computed(() => Number(route.params.id));
const plant = computed(() => plants.find(p => p.id === plantId.value));

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

const handleDelete = () => {
  console.log('Delete plant');
};

const handleWaterNow = () => {
  console.log('Water now');
};
</script>

<template>
  <div class="plant-detail">
    <button class="back-button" @click="goBack">
      ← Back to Plants
    </button>

    <div v-if="plant" class="content">
      <!-- Image Section -->
      <div class="image-section">
        <div class="plant-image">
          {{ plant.icon }}
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
              <div class="stat-value">{{ plant.lastWatered }}</div>
              <div class="stat-label">Last Watered</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ plant.nextWatering }}</div>
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
}

.plant-image {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  margin-bottom: var(--spacing-lg);
}

.image-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.btn-secondary {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.btn-secondary:hover {
  border-color: var(--primary-green) !important;
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

  .plant-image {
    font-size: 80px;
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
</style>