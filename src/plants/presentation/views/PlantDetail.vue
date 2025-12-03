
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { PlantsService } from '../../infrastructure/plants.services';
import type { Plant as PlantEntity, Metric } from '../../domain/model/plants.entity';

const router = useRouter();
const route = useRoute();
const plantsService = new PlantsService();
const confirm = useConfirm();
const toast = useToast();

const plant = ref<PlantEntity | null>(null);
const isLoading = ref(true);
const isWatering = ref(false);
const plantId = Number(route.params.id);

onMounted(async () => {
  try {
    const response = await plantsService.getPlantById(plantId);
    plant.value = response.data;
  } catch (err) {
    console.error('Error loading plant:', err);
    plant.value = null;
  } finally {
    isLoading.value = false;
  }
});

const latestMetric = computed((): Metric | null => {
  const metrics = plant.value?.metrics ?? [];
  if (metrics.length === 0) return null;
  const sorted = [...metrics].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return sorted[0] ?? null;
});

const goBack = () => {
  router.push('/plants');
};

const waterPlant = async () => {
  if (!plant.value) return;
  isWatering.value = true;
  try {
    const response = await plantsService.waterPlant(plant.value.id);
    plant.value = response.data;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Plant watered successfully!', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to water the plant.', life: 3000 });
  } finally {
    isWatering.value = false;
  }
};

const handleDelete = () => {
  if (!plant.value) return;

  confirm.require({
    message: 'Are you sure you want to delete this plant? This action cannot be undone.',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await plantsService.deletePlant(plant.value!.id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Plant deleted successfully', life: 3000 });
        setTimeout(() => router.push('/plants'), 1500);
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'There was an error deleting the plant', life: 3000 });
      }
    },
    reject: () => {
      toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled', life: 3000 });
    }
  });
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}
</script>

<template>
  <div class="plant-detail-view">
    <Toast />
    <ConfirmDialog />
    <Button
        icon="pi pi-arrow-left"
        label="Back to Plants"
        text
        @click="goBack"
        class="back-button"
    />

    <div v-if="isLoading" class="loading-state">
      <ProgressSpinner />
      <h2>Loading sensor data...</h2>
    </div>

    <div v-else-if="plant" class="content-grid">
      <!-- Left Column: Image and Bio -->
      <div class="left-column">
        <Card class="plant-card">
          <template #header>
            <div class="plant-image-container">
              <img :src="plant.imgUrl" :alt="plant.name" class="plant-image" />
            </div>
          </template>
          <template #title>
            <div class="plant-title-section">
              <h1 class="plant-name">{{ plant.name }}</h1>
              <p class="plant-type">{{ plant.type }}</p>
            </div>
          </template>
          <template #subtitle>
            <div class="plant-location">
              <i class="pi pi-map-marker"></i>
              <span>{{ plant.location }}</span>
            </div>
          </template>
          <template #content>
            <p class="plant-bio">{{ plant.bio }}</p>
          </template>
        </Card>
      </div>

      <!-- Right Column: Metrics and Details -->
      <div class="right-column">
        <div class="metrics-grid">
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <Avatar icon="pi pi-sun" size="large" shape="circle" class="metric-icon temp" />
                <div class="metric-info">
                  <span class="metric-label">Temperature</span>
                  <span class="metric-value">{{ latestMetric?.airTemperatureC ?? 'N/A' }}°C</span>
                </div>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <Avatar icon="pi pi-cloud" size="large" shape="circle" class="metric-icon humidity" />
                <div class="metric-info">
                  <span class="metric-label">Air Humidity</span>
                  <span class="metric-value">{{ latestMetric?.airHumidityPct ?? 'N/A' }}%</span>
                </div>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <Avatar icon="pi pi-lightbulb" size="large" shape="circle" class="metric-icon light" />
                <div class="metric-info">
                  <span class="metric-label">Light</span>
                  <span class="metric-value">{{ latestMetric?.lightIntensityLux ?? 'N/A' }} lm</span>
                </div>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <div class="metric-icon soil" role="img" aria-label="Soil humidity">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12 2s-7 7-7 12a7 7 0 0014 0c0-5-7-12-7-12z" />
                  </svg>
                </div>
                <div class="metric-info">
                  <span class="metric-label">Soil Humidity</span>
                  <span class="metric-value">{{ latestMetric?.soilMoisturePct ?? 'N/A' }}%</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <Card class="watering-card">
          <template #title>Watering Schedule</template>
          <template #content>
            <div class="watering-details">
              <div class="watering-item">
                <i class="pi pi-calendar-times"></i>
                <div>
                  <span class="watering-label">Last Watered</span>
                  <p>{{ formatDate(plant.lastWatered) }}</p>
                </div>
              </div>
              <div class="watering-item">
                <i class="pi pi-calendar-plus"></i>
                <div>
                  <span class="watering-label">Next Watering</span>
                  <p>{{ formatDate(plant.nextWatering) }}</p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <div class="watering-action-container">
          <Button
              class="water-button"
              @click="waterPlant"
              :disabled="isWatering"
              aria-label="Water Plant"
          >
            <span v-if="!isWatering" class="water-drop-icon">
              <svg viewBox="0 0 100 125">
                <path class="drop-outline" d="M50,5.5c-19.8,0-35.8,16.1-35.8,35.8c0,17.5,12.8,32.3,29.8,35.3V95h12V76.6c17-3,29.8-17.8,29.8-35.3 C85.8,21.6,69.8,5.5,50,5.5z"/>
                <path class="drop-fill" d="M50,5.5c-19.8,0-35.8,16.1-35.8,35.8c0,17.5,12.8,32.3,29.8,35.3V95h12V76.6c17-3,29.8-17.8,29.8-35.3 C85.8,21.6,69.8,5.5,50,5.5z"/>
              </svg>
            </span>
            <ProgressSpinner v-if="isWatering" style="width: 24px; height: 24px" strokeWidth="6" />
            <span class="p-button-label">{{ isWatering ? 'Watering...' : 'Water Plant' }}</span>
          </Button>
        </div>

        <div class="actions-footer">
          <Button
              label="Delete Plant"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="handleDelete"
          />
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>Plant Not Found</h2>
      <p>The specified ID does not correspond to any registered plant.</p>
    </div>
  </div>
</template>

<style scoped>
/* Reemplazos directos de variables por colores fijos para evitar errores de analizador */
.plant-detail-view {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.back-button {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.plant-card, .metric-card, .watering-card {
  background-color: var(--bg-card);
  border-radius: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.plant-image-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 1rem 1rem 0 0;
}

.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plant-title-section {
  text-align: center;
  margin-top: 1rem;
}

.plant-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.plant-type {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.plant-location {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.plant-bio {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
  padding: 0 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.metric-icon {
  color: #fff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.metric-icon svg {
  width: 26px;
  height: 26px;
}
.metric-icon.temp { background-color: #ff9800; }
.metric-icon.humidity { background-color: #2196f3; }
.metric-icon.light { background-color: #ffc107; }
.metric-icon.soil { background-color: #8d6e63; }

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.watering-details {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
}

.watering-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
}

.watering-item i {
  font-size: 2rem;
  color: var(--status-success);
}

.watering-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.watering-item p {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.25rem 0 0 0;
  color: var(--text-primary);
}

.watering-action-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.water-button {
  background-color: transparent;
  border: 2px solid #3b82f6; /* A neutral blue */
  color: #3b82f6;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.water-button:hover {
  background-color: #3b82f6;
  color: white;
}

.water-drop-icon {
  width: 24px;
  height: 24px;
}

.water-drop-icon svg {
  width: 100%;
  height: 100%;
}

.drop-outline {
  fill: none;
  stroke: currentColor;
  stroke-width: 5;
}

.drop-fill {
  fill: currentColor;
  transform-origin: 50% 100%;
  transform: scaleY(0);
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.water-button:hover .drop-fill {
  transform: scaleY(1);
}

.actions-footer {
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.not-found {
  text-align: center;
  padding: 4rem;
  background-color: var(--bg-card);
  color: var(--text-primary);
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-color-scheme: dark) {
  .plant-detail-view {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .plant-card, .metric-card, .watering-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    box-shadow: var(--shadow-md);
  }

  :deep(.p-card) {
    background-color: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    box-shadow: var(--shadow-md) !important;
  }

  :deep(.p-card .p-card-title), :deep(.p-card .p-card-content) {
    color: inherit !important;
  }

   .plant-image-container {
     background-color: var(--bg-primary);
   }

   .plant-name, .metric-value {
     color: var(--text-primary);
   }

   .plant-type, .plant-location, .plant-bio, .metric-label, .watering-label {
     color: var(--text-secondary);
   }

   .watering-item i {
     color: var(--status-info);
   }

   .water-button {
     border-color: #60a5fa; /* Lighter blue for dark mode */
     color: #60a5fa;
   }

   .water-button:hover {
     background-color: #60a5fa;
     color: #111827; /* Dark text on hover */
   }

   .not-found {
     background-color: var(--bg-card);
     color: var(--text-primary);
   }

   .metric-icon.temp { background-color: #b25b00; }
   .metric-icon.humidity { background-color: #1e6fb8; }
   .metric-icon.light { background-color: #b38600; }
   .metric-icon.soil { background-color: #6b4f44; }
}
</style>
