<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { PlantsService } from '../services/plats.services';
import type { Plant } from '../model/plants.entity';
import { useAuthenticationStore } from '../../../IAM/services/Authentication.Store.ts';



interface Filter {
  id: string;
  label: string;
  count: number;
}

const router = useRouter();
const activeFilter = ref('all');
const searchQuery = ref('');
const plants = ref<Plant[]>([]);
const plantsService = new PlantsService();

const authStore = useAuthenticationStore();
// Ensure the authStore is initialized from localStorage if needed
if (!authStore.isSignedIn) {
  try { authStore.initialize(); } catch (e) { /* ignore */ }
}

// Use the authenticated user's id; fallback to null
const userId = computed(() => authStore.id as number | null);

onMounted(async () => {
  try {
    if (userId.value == null) {
      // No hay usuario, redirige al login (guard route debería proteger esto, pero por seguridad)
      return router.push({ name: 'SignIn' });
    }
    const response = await plantsService.getPlantsByUser(userId.value);
    plants.value = response.data;
  } catch (error) {
    console.error('Error al obtener plantas:', error);
  }
});

const filters = computed<Filter[]>(() => [
  { id: 'all', label: 'All Plants', count: plants.value.length },
  { id: 'healthy', label: 'Healthy', count: plants.value.filter(p => p.status === 'healthy').length },
  { id: 'warning', label: 'Warning', count: plants.value.filter(p => p.status === 'warning').length },
  { id: 'critical', label: 'Critical', count: plants.value.filter(p => p.status === 'critical').length },
]);

const filteredPlants = computed(() => {
  let result = activeFilter.value === 'all'
      ? plants.value
      : plants.value.filter(plant => plant.status === activeFilter.value);

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(plant =>
        plant.name.toLowerCase().includes(query) ||
        plant.type.toLowerCase().includes(query)
    );
  }

  return result;
});

const getStatusLabel = (status: any): string => {
  if (typeof status === 'object' && status !== null && 'label' in status) {
    return status.label;
  }
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'warning': return 'Warning';
    case 'critical': return 'Critical';
    default: return String(status);
  }
};

const navigateToPlant = (plantId: number) => {
  router.push(`/plants/${plantId}`);
};

const handleAddPlant = () => {
  router.push('/plants/new');
};

const handleAddFirstPlant = () => {
  router.push('/plants/new');
};
</script>

<template>
  <div class="plants">
    <div class="header">
      <h1 class="title">My Plants</h1>
      <div class="actions">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <InputText
              v-model="searchQuery"
              placeholder="Search plants..."
              class="search-input"
          />
        </div>
        <Button
            class="add-button"
            @click="handleAddPlant"
        >
          <span class="add-icon">➕</span>
          <span>Add Plant</span>
        </Button>
      </div>
    </div>

    <div class="filters">
      <button
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-button', { active: activeFilter === filter.id }]"
          @click="activeFilter = filter.id"
      >
        {{ filter.label }} ({{ filter.count }})
      </button>
    </div>

    <div v-if="filteredPlants.length > 0" class="plants-grid">
      <div
          v-for="plant in filteredPlants"
          :key="plant.id"
          class="plant-card"
          @click="navigateToPlant(plant.id)"
      >
        <div class="plant-image">
          <img class="plant-img" :src="plant.imgUrl" alt="Imagen de la planta" />
          <div :class="['plant-status', plant.status]">
            <span class="status-dot"></span>
            <span>{{ getStatusLabel(plant.status) }}</span>
          </div>
        </div>
        <div class="plant-content">
          <h3 class="plant-name">{{ plant.name }}</h3>
          <p class="plant-type">{{ plant.type }}</p>
          <div class="plant-stats">
            <div class="stat-item">
              <span class="stat-label">Humidity</span>
              <span class="stat-value">{{ plant.humidity }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Last Watered</span>
              <span class="stat-value">{{ plant.lastWatered }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🌱</div>
      <h2 class="empty-title">No plants found</h2>
      <p class="empty-description">
        {{ activeFilter === 'all'
          ? "Start by adding your first plant to your collection"
          : `No plants with ${activeFilter} status` }}
      </p>
      <Button
          label="Add Your First Plant"
          class="btn-primary"
          @click="handleAddFirstPlant"
      />
    </div>
  </div>
</template>

<style scoped>
.plants {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  min-width: 300px;
}

.search-icon {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.search-input {
  border: none !important;
  background: transparent !important;
  outline: none !important;
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  padding: 0 !important;
  box-shadow: none !important;
}

.search-input::placeholder {
  color: var(--text-light);
}

.add-button {
  display: flex !important;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--primary-green) !important;
  color: #ffffff !important;
  border: none !important;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: #7ab531 !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.add-icon {
  display: flex;
  align-items: center;
}

.filters {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.filter-button {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.filter-button.active {
  background: var(--primary-green);
  border-color: var(--primary-green);
  color: #ffffff;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.plant-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.plant-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.plant-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, var(--secondary-green) 0%, var(--primary-green) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.plant-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 180px;
  max-height: 180px;
  display: block;
  margin: auto;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  background: transparent;
}

.plant-status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 6px;
}

.plant-status.healthy {
  color: var(--status-healthy);
}

.plant-status.warning {
  color: var(--status-warning);
}

.plant-status.critical {
  color: var(--status-critical);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.plant-content {
  padding: var(--spacing-lg);
}

.plant-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.plant-type {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.plant-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
}

.btn-primary {
  background: var(--primary-green) !important;
  border: none !important;
  color: #ffffff !important;
  padding: 12px 24px;
  font-weight: var(--font-weight-semibold);
}

.btn-primary:hover {
  background: #7ab531 !important;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .actions {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: 0;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }

  .plant-image {
    height: 140px;
  }
  .plant-img {
    max-width: 120px;
    max-height: 120px;
  }
}
</style>