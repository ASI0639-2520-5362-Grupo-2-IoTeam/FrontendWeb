
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
import { PlantsService } from '../../infrastructure/plats.services';
import type { Plant as PlantEntity, Metric } from '../../domain/model/plants.entity';

const router = useRouter();
const route = useRoute();
const plantsService = new PlantsService();
const confirm = useConfirm();
const toast = useToast();

const plant = ref<PlantEntity | null>(null);
const isLoading = ref(true);
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
  // Sort by the new 'timestamp' field in descending order
  const sorted = [...metrics].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return sorted[0] ?? null;
});

const goBack = () => {
  router.push('/plants');
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

/* Add sizing/centering for metric icons (ensures SVG fits) */
.metric-icon {
  color: #fff; /* Keep icon color white for contrast with custom backgrounds */
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

/* Dark mode overrides: cambia fondos y colores cuando el sistema está en modo oscuro */
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

  /* Forzar sobre los elementos internos de PrimeVue (p-card) en caso de que el tema los pinte en claro */
  :deep(.p-card) {
    background-color: var(--bg-card) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    box-shadow: var(--shadow-md) !important;
  }

  /* Contenido y títulos internos de la card */
  :deep(.p-card .p-card-title), :deep(.p-card .p-card-content) {
    color: inherit !important;
  }

   .plant-image-container {
     /* opcional: añadir un fondo oscuro por si la imagen no carga */
     background-color: var(--bg-primary);
   }

   .plant-name, .metric-value {
     color: var(--text-primary);
   }

   .plant-type, .plant-location, .plant-bio, .metric-label, .watering-label {
     color: var(--text-secondary);
   }

   .watering-item i {
     color: var(--status-info); /* color primario claro para íconos */
   }

   .not-found {
     background-color: var(--bg-card);
     color: var(--text-primary);
   }

   /* Ajustes menores para los iconos circulares para mejor contraste en oscuro */
   .metric-icon.temp { background-color: #b25b00; }
   .metric-icon.humidity { background-color: #1e6fb8; }
   .metric-icon.light { background-color: #b38600; }
   .metric-icon.soil { background-color: #6b4f44; }
}
</style>
